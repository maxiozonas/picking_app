<?php

namespace Tests\Unit\Services\Picking;

use App\Models\PickingItemProgress;
use App\Models\PickingOrderProgress;
use App\Models\PickingStockValidation;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\FlexxusPickingService;
use App\Services\Picking\Interfaces\StockCacheServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockCacheServiceTest extends TestCase
{
    use RefreshDatabase;

    private StockCacheServiceInterface $cacheService;

    private User $user;

    private Warehouse $warehouse;

    private PickingOrderProgress $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cacheService = $this->app->make(StockCacheServiceInterface::class);
        $this->user = User::factory()->create();
        $this->warehouse = Warehouse::factory()->create();

        $this->order = PickingOrderProgress::factory()->create([
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_prefetch_stock_for_order_creates_validation_records(): void
    {
        // Arrange
        $items = PickingItemProgress::factory()->count(3)->create([
            'picking_order_progress_id' => $this->order->id,
            'item_code' => 'PROD-TEST', // Ensure item_code is set
        ]);

        // Mock FlexxusPickingService
        $this->instance(
            FlexxusPickingService::class,
            $mockFlexxus = $this->createMock(FlexxusPickingService::class)
        );

        $mockFlexxus->method('getProductStock')
            ->willReturn([
                'warehouse' => $this->warehouse->code,
                'total' => 100,
                'is_local' => true,
            ]);

        // Re-create cache service with mocked dependency
        $this->cacheService = new \App\Services\Picking\StockCacheService($mockFlexxus);

        // Act
        $validations = $this->cacheService->prefetchStockForOrder($this->order);

        // Assert
        $this->assertCount(3, $validations);
        $this->assertInstanceOf(PickingStockValidation::class, $validations->first());
        $this->assertEquals('prefetch', $validations->first()->validation_type);
    }

    public function test_prefetch_stock_stores_available_quantity(): void
    {
        // Arrange
        $itemCode = 'PROD-001';
        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $this->order->id,
            'item_code' => $itemCode,
        ]);

        // Mock FlexxusPickingService
        $this->instance(
            FlexxusPickingService::class,
            $mockFlexxus = $this->createMock(FlexxusPickingService::class)
        );

        $mockFlexxus->method('getProductStock')
            ->with(
                $itemCode,
                $this->callback(function ($warehouse) {
                    return $warehouse instanceof \App\Models\Warehouse
                        && $warehouse->id === $this->warehouse->id;
                })
            )
            ->willReturn([
                'warehouse' => $this->warehouse->code,
                'total' => 50,
                'is_local' => true,
            ]);

        $this->cacheService = new \App\Services\Picking\StockCacheService($mockFlexxus);

        // Act
        $validations = $this->cacheService->prefetchStockForOrder($this->order);

        // Assert
        $this->assertEquals(50, $validations->first()->available_qty);
        $this->assertEquals($itemCode, $validations->first()->item_code);
    }

    public function test_get_cached_stock_returns_validation_if_fresh(): void
    {
        // Arrange
        $itemCode = 'PROD-002';
        $validation = PickingStockValidation::factory()->create([
            'order_number' => $this->order->order_number,
            'item_code' => $itemCode,
            'validation_type' => 'prefetch',
            'validated_at' => now()->subSeconds(10), // Fresh (within TTL)
        ]);

        // Act
        $cached = $this->cacheService->getCachedStock($this->order->order_number, $itemCode);

        // Assert
        $this->assertNotNull($cached);
        $this->assertEquals($validation->id, $cached->id);
    }

    public function test_get_cached_stock_returns_null_if_expired(): void
    {
        // Arrange
        $itemCode = 'PROD-003';
        PickingStockValidation::factory()->create([
            'order_number' => $this->order->order_number,
            'item_code' => $itemCode,
            'validation_type' => 'prefetch',
            'validated_at' => now()->subSeconds(46), // Expired (beyond 45s TTL)
        ]);

        // Act
        $cached = $this->cacheService->getCachedStock($this->order->order_number, $itemCode);

        // Assert
        $this->assertNull($cached);
    }

    public function test_get_cached_stock_returns_null_if_not_found(): void
    {
        // Act
        $cached = $this->cacheService->getCachedStock('NONEXISTENT', 'PROD-999');

        // Assert
        $this->assertNull($cached);
    }

    public function test_cache_ttl_is_45_seconds(): void
    {
        // Arrange
        $itemCode = 'PROD-004';
        $validation = PickingStockValidation::factory()->create([
            'order_number' => $this->order->order_number,
            'item_code' => $itemCode,
            'validation_type' => 'prefetch',
            'validated_at' => now()->subSeconds(44), // Fresh (within 45s TTL)
        ]);

        // Act
        $cached = $this->cacheService->getCachedStock($this->order->order_number, $itemCode);

        // Assert
        $this->assertNotNull($cached);
        $this->assertEquals($validation->id, $cached->id);
    }

    public function test_cache_expires_after_45_seconds(): void
    {
        // Arrange
        $itemCode = 'PROD-005';
        PickingStockValidation::factory()->create([
            'order_number' => $this->order->order_number,
            'item_code' => $itemCode,
            'validation_type' => 'prefetch',
            'validated_at' => now()->subSeconds(46), // Expired (beyond 45s TTL)
        ]);

        // Act
        $cached = $this->cacheService->getCachedStock($this->order->order_number, $itemCode);

        // Assert
        $this->assertNull($cached);
    }
}
