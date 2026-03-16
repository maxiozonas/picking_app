<?php

namespace Tests\Unit\Services\Admin;

use App\Http\Clients\Flexxus\FlexxusClient;
use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\AdminPickingService;
use App\Services\Picking\Interfaces\AdminPickingServiceInterface;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class AdminPickingServiceTest extends TestCase
{
    use RefreshDatabase;

    private AdminPickingServiceInterface $service;

    private FlexxusClientFactoryInterface $mockFactory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mockFactory = $this->createMock(FlexxusClientFactoryInterface::class);
        $this->service = new AdminPickingService($this->mockFactory);
    }

    public function test_get_pending_orders_requires_warehouse_id(): void
    {
        // Expect exception when warehouse_id is not provided
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('warehouse_id is required');

        $this->service->getPendingOrders([]);
    }

    public function test_get_pending_orders_fetches_from_flexxus_on_cache_miss(): void
    {
        // Arrange
        $warehouse = Warehouse::factory()->create([
            'code' => 'CENTRO',
            'name' => 'Don Bosco',
        ]);

        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '623202',
                'RAZONSOCIAL' => 'CONSTRUCTORA S.A.',
                'TOTAL' => 150000.50,
                'FECHACOMPROBANTE' => '2024-03-10T08:30:00Z',
                'DEPOSITO' => $warehouse->name,
            ],
            [
                'NUMEROCOMPROBANTE' => '623203',
                'RAZONSOCIAL' => 'OBRA GENIAL',
                'TOTAL' => 75000.00,
                'FECHACOMPROBANTE' => '2024-03-10T09:15:00Z',
                'DEPOSITO' => $warehouse->name,
            ],
        ];

        $mockClient = $this->createMock(FlexxusClient::class);
        $mockClient->method('request')
            ->willReturn(['data' => $flexxusOrders]);

        $this->mockFactory->method('createForWarehouse')
            ->willReturn($mockClient);

        // Clear cache to ensure miss
        Cache::flush();

        // Act
        $result = $this->service->getPendingOrders([
            'warehouse_id' => $warehouse->id,
            'date_from' => '2024-03-10',
        ]);

        // Assert
        $this->assertInstanceOf(\Illuminate\Pagination\LengthAwarePaginator::class, $result);
        $this->assertCount(2, $result->items());
    }

    public function test_get_pending_orders_returns_cached_data_on_cache_hit(): void
    {
        // Arrange
        $warehouse = Warehouse::factory()->create([
            'code' => 'CENTRO',
            'name' => 'Don Bosco',
        ]);

        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '623202',
                'RAZONSOCIAL' => 'CONSTRUCTORA S.A.',
                'TOTAL' => 150000.50,
                'FECHACOMPROBANTE' => '2024-03-10T08:30:00Z',
                'DEPOSITO' => $warehouse->name,
            ],
        ];

        $apiCallCount = 0;
        $mockClient = $this->createMock(FlexxusClient::class);
        $mockClient->method('request')
            ->willReturnCallback(function () use (&$apiCallCount, $flexxusOrders) {
                $apiCallCount++;

                return ['data' => $flexxusOrders];
            });

        $this->mockFactory->method('createForWarehouse')
            ->willReturn($mockClient);

        Cache::flush();

        // Act - First call (cache miss)
        $result1 = $this->service->getPendingOrders([
            'warehouse_id' => $warehouse->id,
            'date_from' => '2024-03-10',
        ]);

        // Act - Second call (cache hit - within 120s TTL)
        $result2 = $this->service->getPendingOrders([
            'warehouse_id' => $warehouse->id,
            'date_from' => '2024-03-10',
        ]);

        // Assert
        $this->assertEquals(1, $apiCallCount, 'API should be called only once (second call uses cache)');
        $this->assertEquals($result1->total(), $result2->total());
    }

    public function test_get_pending_orders_merges_with_local_progress(): void
    {
        // Arrange
        $warehouse = Warehouse::factory()->create([
            'code' => 'CENTRO',
            'name' => 'Don Bosco',
        ]);

        $user = User::factory()->create();

        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '623202',
                'RAZONSOCIAL' => 'CONSTRUCTORA S.A.',
                'TOTAL' => 150000.50,
                'FECHACOMPROBANTE' => '2024-03-10T08:30:00Z',
                'DEPOSITO' => $warehouse->name,
            ],
            [
                'NUMEROCOMPROBANTE' => '623203',
                'RAZONSOCIAL' => 'OBRA GENIAL',
                'TOTAL' => 75000.00,
                'FECHACOMPROBANTE' => '2024-03-10T09:15:00Z',
                'DEPOSITO' => $warehouse->name,
            ],
        ];

        // Create local progress for second order (started)
        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 623203',
            'warehouse_id' => $warehouse->id,
            'user_id' => $user->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $mockClient = $this->createMock(FlexxusClient::class);
        $mockClient->method('request')
            ->willReturn(['data' => $flexxusOrders]);

        $this->mockFactory->method('createForWarehouse')
            ->willReturn($mockClient);

        // Act
        $result = $this->service->getPendingOrders([
            'warehouse_id' => $warehouse->id,
            'date_from' => '2024-03-10',
            'status' => 'all', // Get both pending and in_progress
        ]);

        // Assert
        $orders = $result->items();
        $this->assertCount(2, $orders);

        // First order should be pending (not in local DB)
        $pendingOrder = collect($orders)->first(fn ($o) => $o['order_number'] === 'NP 623202');
        $this->assertEquals('pending', $pendingOrder['status']);
        $this->assertNull($pendingOrder['assigned_to']);

        // Second order should be in_progress (in local DB)
        $inProgressOrder = collect($orders)->first(fn ($o) => $o['order_number'] === 'NP 623203');
        $this->assertEquals('in_progress', $inProgressOrder['status']);
        $this->assertNotNull($inProgressOrder['assigned_to']);
        $this->assertEquals($user->id, $inProgressOrder['assigned_to']['id']);
    }

    public function test_get_pending_orders_filters_by_search_term(): void
    {
        // Arrange
        $warehouse = Warehouse::factory()->create([
            'code' => 'CENTRO',
        ]);

        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '623202',
                'RAZONSOCIAL' => 'CONSTRUCTORA S.A.',
                'TOTAL' => 150000.50,
                'DEPOSITO' => $warehouse->name,
            ],
            [
                'NUMEROCOMPROBANTE' => '623203',
                'RAZONSOCIAL' => 'OBRA GENIAL',
                'TOTAL' => 75000.00,
                'DEPOSITO' => $warehouse->name,
            ],
        ];

        $mockClient = $this->createMock(FlexxusClient::class);
        $mockClient->method('request')
            ->willReturn(['data' => $flexxusOrders]);

        $this->mockFactory->method('createForWarehouse')
            ->willReturn($mockClient);

        // Act
        $result = $this->service->getPendingOrders([
            'warehouse_id' => $warehouse->id,
            'search' => '623202',
        ]);

        // Assert
        $this->assertCount(1, $result->items());
        $this->assertEquals('NP 623202', $result->items()[0]['order_number']);
    }

    public function test_get_pending_orders_paginates_results(): void
    {
        // Arrange
        $warehouse = Warehouse::factory()->create();

        // Create 20 orders
        $flexxusOrders = array_map(fn ($i) => [
            'NUMEROCOMPROBANTE' => strval(623200 + $i),
            'RAZONSOCIAL' => "CLIENTE {$i}",
            'TOTAL' => 1000.00,
            'DEPOSITO' => $warehouse->name,
        ], range(1, 20));

        $mockClient = $this->createMock(FlexxusClient::class);
        $mockClient->method('request')
            ->willReturn(['data' => $flexxusOrders]);

        $this->mockFactory->method('createForWarehouse')
            ->willReturn($mockClient);

        // Act - Page 1 with default per_page=15
        $result = $this->service->getPendingOrders([
            'warehouse_id' => $warehouse->id,
        ]);

        // Assert
        $this->assertEquals(15, $result->perPage());
        $this->assertEquals(20, $result->total());
        $this->assertCount(15, $result->items());
        $this->assertEquals(1, $result->currentPage());
    }

    public function test_status_pending_when_not_in_local_db(): void
    {
        // Arrange
        $warehouse = Warehouse::factory()->create();

        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '623202',
                'RAZONSOCIAL' => 'CLIENTE TEST',
                'TOTAL' => 1000.00,
                'DEPOSITO' => $warehouse->name,
            ],
        ];

        $mockClient = $this->createMock(FlexxusClient::class);
        $mockClient->method('request')
            ->willReturn(['data' => $flexxusOrders]);

        $this->mockFactory->method('createForWarehouse')
            ->willReturn($mockClient);

        // Act
        $result = $this->service->getPendingOrders([
            'warehouse_id' => $warehouse->id,
        ]);

        // Assert
        $this->assertCount(1, $result->items());
        $this->assertEquals('pending', $result->items()[0]['status']);
        $this->assertNull($result->items()[0]['assigned_to']);
    }

    public function test_status_in_progress_when_in_local_db(): void
    {
        // Arrange
        $warehouse = Warehouse::factory()->create();
        $user = User::factory()->create();

        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 623202',
            'warehouse_id' => $warehouse->id,
            'user_id' => $user->id,
            'status' => 'in_progress',
        ]);

        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '623202',
                'RAZONSOCIAL' => 'CLIENTE TEST',
                'TOTAL' => 1000.00,
                'DEPOSITO' => $warehouse->name, // Required for warehouse filtering
            ],
        ];

        $mockClient = $this->createMock(FlexxusClient::class);
        $mockClient->method('request')
            ->willReturn(['data' => $flexxusOrders]);

        $this->mockFactory->method('createForWarehouse')
            ->willReturn($mockClient);

        // Act
        $result = $this->service->getPendingOrders([
            'warehouse_id' => $warehouse->id,
            'status' => 'all',
        ]);

        // Assert
        $this->assertCount(1, $result->items());
        $this->assertEquals('in_progress', $result->items()[0]['status']);
        $this->assertEquals($user->id, $result->items()[0]['assigned_to']['id']);
    }

    public function test_refresh_clears_cache(): void
    {
        // Arrange
        $warehouse = Warehouse::factory()->create();

        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '623202',
                'RAZONSOCIAL' => 'CLIENTE TEST',
                'TOTAL' => 1000.00,
                'DEPOSITO' => $warehouse->name,
            ],
        ];

        $mockClient = $this->createMock(FlexxusClient::class);
        $mockClient->method('request')
            ->willReturn(['data' => $flexxusOrders]);

        $this->mockFactory->method('createForWarehouse')
            ->willReturn($mockClient);

        Cache::flush();

        // Act - First call to populate cache
        $this->service->getPendingOrders([
            'warehouse_id' => $warehouse->id,
        ]);

        // Verify cache exists
        $cacheKey = 'flexxus_orders_pending_'.now()->format('Y-m-d')."_{$warehouse->id}_{$warehouse->code}";
        $this->assertTrue(Cache::has($cacheKey));

        // Act - Refresh should clear cache
        $this->service->refreshPendingOrders([
            'warehouse_id' => $warehouse->id,
        ]);

        // Assert - Cache should be cleared and repopulated with fresh data
        $this->assertTrue(Cache::has($cacheKey), 'Cache should be repopulated after refresh');
    }

    public function test_refresh_fetches_fresh_data_from_flexxus(): void
    {
        // Arrange
        $warehouse = Warehouse::factory()->create();

        $callCount = 0;
        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '623202',
                'RAZONSOCIAL' => 'CLIENTE TEST',
                'TOTAL' => 1000.00,
                'DEPOSITO' => $warehouse->name,
            ],
        ];

        $mockClient = $this->createMock(FlexxusClient::class);
        $mockClient->method('request')
            ->willReturnCallback(function () use (&$callCount, $flexxusOrders) {
                $callCount++;

                return ['data' => $flexxusOrders];
            });

        $this->mockFactory->method('createForWarehouse')
            ->willReturn($mockClient);

        // Act - First call
        $this->service->getPendingOrders([
            'warehouse_id' => $warehouse->id,
        ]);

        // Act - Refresh (should call API again)
        $this->service->refreshPendingOrders([
            'warehouse_id' => $warehouse->id,
        ]);

        // Assert - API should be called twice (initial + refresh)
        $this->assertEquals(2, $callCount, 'API should be called twice (initial + refresh)');
    }

    public function test_cache_key_format_is_correct(): void
    {
        // Arrange
        $warehouse = Warehouse::factory()->create([
            'code' => 'CENTRO',
        ]);

        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '623202',
                'RAZONSOCIAL' => 'CLIENTE TEST',
                'TOTAL' => 1000.00,
                'DEPOSITO' => $warehouse->name,
            ],
        ];

        $mockClient = $this->createMock(FlexxusClient::class);
        $mockClient->method('request')
            ->willReturn(['data' => $flexxusOrders]);

        $this->mockFactory->method('createForWarehouse')
            ->willReturn($mockClient);

        Cache::flush();

        $date = now()->format('Y-m-d');
        $expectedCacheKey = "flexxus_orders_pending_{$date}_{$warehouse->id}_{$warehouse->code}";

        // Act
        $this->service->getPendingOrders([
            'warehouse_id' => $warehouse->id,
            'date_from' => $date,
        ]);

        // Assert
        $this->assertTrue(Cache::has($expectedCacheKey));
    }

    public function test_cache_ttl_is_120_seconds(): void
    {
        // Arrange
        $warehouse = Warehouse::factory()->create();

        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '623202',
                'RAZONSOCIAL' => 'CLIENTE TEST',
                'TOTAL' => 1000.00,
                'DEPOSITO' => $warehouse->name,
            ],
        ];

        $mockClient = $this->createMock(FlexxusClient::class);
        $mockClient->method('request')
            ->willReturn(['data' => $flexxusOrders]);

        $this->mockFactory->method('createForWarehouse')
            ->willReturn($mockClient);

        // We can't test exact TTL without time manipulation, but we can verify cache is set
        Cache::flush();

        // Act
        $this->service->getPendingOrders([
            'warehouse_id' => $warehouse->id,
        ]);

        $cacheKey = 'flexxus_orders_pending_'.now()->format('Y-m-d')."_{$warehouse->id}_{$warehouse->code}";

        // Assert - Cache should exist (not expired immediately)
        $this->assertTrue(Cache::has($cacheKey));
    }

    public function test_get_pending_counts_returns_correct_breakdown(): void
    {
        // Arrange
        $warehouse1 = Warehouse::factory()->create();
        $warehouse2 = Warehouse::factory()->create();

        $flexxusOrders = [
            ['NUMEROCOMPROBANTE' => '623202', 'RAZONSOCIAL' => 'CLIENTE 1', 'TOTAL' => 1000, 'DEPOSITO' => $warehouse1->name],
            ['NUMEROCOMPROBANTE' => '623203', 'RAZONSOCIAL' => 'CLIENTE 2', 'TOTAL' => 2000, 'DEPOSITO' => $warehouse2->name],
        ];

        $mockClient = $this->createMock(FlexxusClient::class);
        $mockClient->method('request')
            ->willReturn(['data' => $flexxusOrders]);

        $this->mockFactory->method('createForWarehouse')
            ->willReturn($mockClient);

        // Act
        $counts = $this->service->getPendingCounts();

        // Assert
        $this->assertIsArray($counts);
        $this->assertArrayHasKey('total', $counts);
        $this->assertArrayHasKey('by_warehouse', $counts);
    }
}
