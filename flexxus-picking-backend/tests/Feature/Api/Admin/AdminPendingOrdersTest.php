<?php

namespace Tests\Feature\Api\Admin;

use App\Http\Clients\Flexxus\FlexxusClient;
use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Cache;
use Mockery;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminPendingOrdersTest extends TestCase
{
    use DatabaseMigrations;

    private User $admin;

    private User $employee;

    private Warehouse $warehouse;

    private FlexxusClientFactoryInterface $mockFactory;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles for Spatie
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'empleado', 'guard_name' => 'web']);

        $this->warehouse = Warehouse::factory()->create([
            'code' => 'CENTRO',
            'name' => 'Don Bosco',
        ]);

        $this->admin = User::factory()->admin()->create();
        $this->employee = User::factory()->empleado()->create();

        // Mock the FlexxusClientFactory
        $this->mockFactory = Mockery::mock(FlexxusClientFactoryInterface::class);
        $this->app->instance(FlexxusClientFactoryInterface::class, $this->mockFactory);

        Cache::flush();
    }

    public function test_admin_can_get_pending_orders(): void
    {
        // Arrange - Mock Flexxus response
        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '623202',
                'RAZONSOCIAL' => 'CONSTRUCTORA S.A.',
                'TOTAL' => 150000.50,
                'FECHACOMPROBANTE' => '2024-03-10T08:30:00Z',
            ],
            [
                'NUMEROCOMPROBANTE' => '623203',
                'RAZONSOCIAL' => 'OBRA GENIAL',
                'TOTAL' => 75000.00,
                'FECHACOMPROBANTE' => '2024-03-10T09:15:00Z',
            ],
        ];

        $mockClient = Mockery::mock(FlexxusClient::class);
        $mockClient->shouldReceive('request')
            ->andReturn(['data' => $flexxusOrders]);

        $this->mockFactory->shouldReceive('createForWarehouse')
            ->andReturn($mockClient);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$this->warehouse->id);

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'order_number',
                        'customer',
                        'total',
                        'warehouse',
                        'status',
                        'created_at',
                        'items_count',
                        'assigned_to',
                    ],
                ],
                'meta' => [
                    'current_page',
                    'per_page',
                    'total',
                ],
            ]);

        $data = $response->json('data');
        $this->assertCount(2, $data);
    }

    public function test_get_pending_orders_requires_warehouse_id(): void
    {
        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders');

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['warehouse_id']);
    }

    public function test_get_pending_orders_validates_warehouse_exists(): void
    {
        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id=99999');

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['warehouse_id']);
    }

    public function test_get_pending_orders_filters_by_search(): void
    {
        // Arrange
        $flexxusOrders = [
            ['NUMEROCOMPROBANTE' => '623202', 'RAZONSOCIAL' => 'CLIENTE A', 'TOTAL' => 1000],
            ['NUMEROCOMPROBANTE' => '623203', 'RAZONSOCIAL' => 'CLIENTE B', 'TOTAL' => 2000],
        ];

        $mockClient = Mockery::mock(FlexxusClient::class);
        $mockClient->shouldReceive('request')
            ->once()
            ->andReturn(['data' => $flexxusOrders]);

        $this->mockFactory->shouldReceive('createForWarehouse')
            ->once()
            ->andReturn($mockClient);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$this->warehouse->id.'&search=623202');

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('623202', $data[0]['order_number']);
    }

    public function test_get_pending_orders_filters_by_status_all(): void
    {
        // Arrange
        $flexxusOrders = [
            ['NUMEROCOMPROBANTE' => '623202', 'RAZONSOCIAL' => 'CLIENTE A', 'TOTAL' => 1000],
        ];

        $mockClient = Mockery::mock(FlexxusClient::class);
        $mockClient->shouldReceive('request')
            ->once()
            ->andReturn(['data' => $flexxusOrders]);

        $this->mockFactory->shouldReceive('createForWarehouse')
            ->once()
            ->andReturn($mockClient);

        // Act - status=all should return all orders
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$this->warehouse->id.'&status=all');

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
    }

    public function test_get_pending_orders_default_status_is_pending(): void
    {
        // Arrange - Create an in-progress order
        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 623203',
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->employee->id,
            'status' => 'in_progress',
        ]);

        $flexxusOrders = [
            ['NUMEROCOMPROBANTE' => '623202', 'RAZONSOCIAL' => 'CLIENTE A', 'TOTAL' => 1000],
            ['NUMEROCOMPROBANTE' => '623203', 'RAZONSOCIAL' => 'CLIENTE B', 'TOTAL' => 2000],
        ];

        $mockClient = Mockery::mock(FlexxusClient::class);
        $mockClient->shouldReceive('request')
            ->once()
            ->andReturn(['data' => $flexxusOrders]);

        $this->mockFactory->shouldReceive('createForWarehouse')
            ->once()
            ->andReturn($mockClient);

        // Act - default filter should only show pending
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$this->warehouse->id);

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data); // Only pending order
        $this->assertEquals('623202', $data[0]['order_number']);
    }

    public function test_get_pending_orders_validates_date_range(): void
    {
        // Act - date_to before date_from
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$this->warehouse->id.'&date_from=2024-03-15&date_to=2024-03-10');

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['date_to']);
    }

    public function test_get_pending_orders_validates_date_from_is_today_or_future(): void
    {
        // Act - date_from in the past
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$this->warehouse->id.'&date_from=2020-01-01');

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['date_from']);
    }

    public function test_get_pending_orders_validates_per_page_range(): void
    {
        // Act - per_page > 100
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$this->warehouse->id.'&per_page=150');

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['per_page']);
    }

    public function test_get_pending_orders_validates_search_max_length(): void
    {
        // Act - search > 100 chars
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$this->warehouse->id.'&search='.str_repeat('a', 101));

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['search']);
    }

    public function test_admin_can_refresh_pending_orders(): void
    {
        // Arrange
        $flexxusOrders = [
            ['NUMEROCOMPROBANTE' => '623202', 'RAZONSOCIAL' => 'CLIENTE A', 'TOTAL' => 1000],
        ];

        $callCount = 0;
        $mockClient = Mockery::mock(FlexxusClient::class);
        $mockClient->shouldReceive('request')
            ->andReturnUsing(function () use (&$callCount, $flexxusOrders) {
                $callCount++;

                return ['data' => $flexxusOrders];
            });

        $this->mockFactory->shouldReceive('createForWarehouse')
            ->andReturn($mockClient);

        // Initial call to populate cache
        $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$this->warehouse->id);

        // Act - Refresh should clear cache
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/pending-orders/refresh', [
                'warehouse_id' => $this->warehouse->id,
            ]);

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'meta',
            ]);

        $this->assertEquals(2, $callCount, 'API should be called twice (initial + refresh)');
    }

    public function test_refresh_pending_orders_requires_warehouse_id(): void
    {
        // Act
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/pending-orders/refresh');

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['warehouse_id']);
    }

    public function test_refresh_pending_orders_validates_date_from(): void
    {
        // Act - Invalid date format
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/pending-orders/refresh', [
                'warehouse_id' => $this->warehouse->id,
                'date_from' => 'invalid-date',
            ]);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['date_from']);
    }

    public function test_regular_user_cannot_access_pending_orders(): void
    {
        // Act
        $response = $this->actingAs($this->employee)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$this->warehouse->id);

        // Assert
        $response->assertStatus(403);
    }

    public function test_regular_user_cannot_refresh_pending_orders(): void
    {
        // Act
        $response = $this->actingAs($this->employee)
            ->postJson('/api/admin/pending-orders/refresh', [
                'warehouse_id' => $this->warehouse->id,
            ]);

        // Assert
        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_access_pending_orders(): void
    {
        // Act
        $response = $this->getJson('/api/admin/pending-orders?warehouse_id='.$this->warehouse->id);

        // Assert
        $response->assertStatus(401);
    }

    public function test_pending_order_resource_includes_warehouse_info(): void
    {
        // Arrange
        $flexxusOrders = [
            ['NUMEROCOMPROBANTE' => '623202', 'RAZONSOCIAL' => 'CLIENTE A', 'TOTAL' => 1000],
        ];

        $mockClient = Mockery::mock(FlexxusClient::class);
        $mockClient->shouldReceive('request')
            ->once()
            ->andReturn(['data' => $flexxusOrders]);

        $this->mockFactory->shouldReceive('createForWarehouse')
            ->once()
            ->andReturn($mockClient);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$this->warehouse->id);

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data.0');

        $this->assertArrayHasKey('warehouse', $data);
        $this->assertEquals($this->warehouse->id, $data['warehouse']['id']);
        $this->assertEquals($this->warehouse->code, $data['warehouse']['code']);
        $this->assertEquals($this->warehouse->name, $data['warehouse']['name']);
    }

    public function test_pending_order_resource_includes_assigned_to_when_in_progress(): void
    {
        // Arrange
        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 623202',
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->employee->id,
            'status' => 'in_progress',
        ]);

        $flexxusOrders = [
            ['NUMEROCOMPROBANTE' => '623202', 'RAZONSOCIAL' => 'CLIENTE A', 'TOTAL' => 1000],
        ];

        $mockClient = Mockery::mock(FlexxusClient::class);
        $mockClient->shouldReceive('request')
            ->once()
            ->andReturn(['data' => $flexxusOrders]);

        $this->mockFactory->shouldReceive('createForWarehouse')
            ->once()
            ->andReturn($mockClient);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$this->warehouse->id.'&status=all');

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data.0');

        $this->assertArrayHasKey('assigned_to', $data);
        $this->assertNotNull($data['assigned_to']);
        $this->assertEquals($this->employee->id, $data['assigned_to']['id']);
        $this->assertEquals($this->employee->name, $data['assigned_to']['name']);
    }

    public function test_pending_order_resource_null_assigned_to_when_pending(): void
    {
        // Arrange
        $flexxusOrders = [
            ['NUMEROCOMPROBANTE' => '623202', 'RAZONSOCIAL' => 'CLIENTE A', 'TOTAL' => 1000],
        ];

        $mockClient = Mockery::mock(FlexxusClient::class);
        $mockClient->shouldReceive('request')
            ->once()
            ->andReturn(['data' => $flexxusOrders]);

        $this->mockFactory->shouldReceive('createForWarehouse')
            ->once()
            ->andReturn($mockClient);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/pending-orders?warehouse_id='.$this->warehouse->id);

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data.0');

        $this->assertEquals('pending', $data['status']);
        $this->assertNull($data['assigned_to']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
