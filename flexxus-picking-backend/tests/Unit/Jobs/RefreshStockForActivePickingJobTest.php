<?php

namespace Tests\Unit\Jobs;

use App\Jobs\RefreshStockForActivePickingJob;
use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\StockCacheServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Mockery;
use Tests\TestCase;

class RefreshStockForActivePickingJobTest extends TestCase
{
    use RefreshDatabase;

    private StockCacheServiceInterface $mockCacheService;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();

        $this->mockCacheService = Mockery::mock(StockCacheServiceInterface::class);
        $this->instance(StockCacheServiceInterface::class, $this->mockCacheService);
    }

    public function test_job_refreshes_stock_for_active_orders(): void
    {
        // Arrange
        $user = User::factory()->create();
        $warehouse = Warehouse::factory()->create();

        // Create 3 orders: 2 active, 1 completed
        $activeOrder1 = PickingOrderProgress::factory()->create([
            'user_id' => $user->id,
            'warehouse_id' => $warehouse->id,
            'status' => 'in_progress',
        ]);

        $activeOrder2 = PickingOrderProgress::factory()->create([
            'user_id' => $user->id,
            'warehouse_id' => $warehouse->id,
            'status' => 'in_progress',
        ]);

        $completedOrder = PickingOrderProgress::factory()->create([
            'user_id' => $user->id,
            'warehouse_id' => $warehouse->id,
            'status' => 'completed',
        ]);

        // Expect prefetch to be called twice (once for each active order)
        $this->mockCacheService->shouldReceive('prefetchStockForOrder')
            ->twice();

        // Act
        $job = new RefreshStockForActivePickingJob;
        $job->handle($this->mockCacheService);

        // Assert - No exception thrown, job completed successfully
        $this->assertTrue(true);
    }

    public function test_job_handles_no_active_orders(): void
    {
        // Arrange
        $user = User::factory()->create();
        $warehouse = Warehouse::factory()->create();

        // Create only completed orders
        PickingOrderProgress::factory()->count(3)->create([
            'user_id' => $user->id,
            'warehouse_id' => $warehouse->id,
            'status' => 'completed',
        ]);

        // Expect prefetch to never be called
        $this->mockCacheService->shouldReceive('prefetchStockForOrder')
            ->never();

        // Act
        $job = new RefreshStockForActivePickingJob;
        $job->handle($this->mockCacheService);

        // Assert - No exception thrown
        $this->assertTrue(true);
    }

    public function test_job_skips_stale_orders(): void
    {
        // Arrange
        $user = User::factory()->create();
        $warehouse = Warehouse::factory()->create();

        // Create a stale active order (last updated > 2 hours ago)
        $staleOrder = PickingOrderProgress::factory()->create([
            'user_id' => $user->id,
            'warehouse_id' => $warehouse->id,
            'status' => 'in_progress',
            'updated_at' => now()->subHours(3),
        ]);

        // Create a fresh active order
        $freshOrder = PickingOrderProgress::factory()->create([
            'user_id' => $user->id,
            'warehouse_id' => $warehouse->id,
            'status' => 'in_progress',
            'updated_at' => now()->subMinutes(30),
        ]);

        // Expect prefetch to be called only once (for the fresh order)
        $this->mockCacheService->shouldReceive('prefetchStockForOrder')
            ->once()
            ->with(Mockery::on(function ($order) use ($freshOrder) {
                return $order->id === $freshOrder->id;
            }));

        // Act
        $job = new RefreshStockForActivePickingJob;
        $job->handle($this->mockCacheService);

        // Assert - No exception thrown
        $this->assertTrue(true);
    }
}
