<?php

namespace Tests\Unit\Services\Picking;

use App\Exceptions\Picking\OrderNotFoundException;
use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\FlexxusPickingService;
use App\Services\Picking\Interfaces\StockCacheServiceInterface;
use App\Services\Picking\Interfaces\StockValidationServiceInterface;
use App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface;
use App\Services\Picking\PickingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class PickingServiceWarehouseIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_order_detail_reads_local_progress_only_for_user_warehouse(): void
    {
        $warehouseA = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $warehouseB = Warehouse::factory()->create(['code' => 'CENTRO']);
        $user = User::factory()->create(['warehouse_id' => $warehouseA->id]);
        $orderNumber = 'NP 12345';

        PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'warehouse_id' => $warehouseB->id,
            'user_id' => User::factory()->create()->id,
            'status' => 'completed',
        ]);

        $flexxusService = Mockery::mock(FlexxusPickingService::class);
        $flexxusService->shouldReceive('getOrderDetail')
            ->once()
            ->with($orderNumber, Mockery::on(fn (Warehouse $warehouse) => $warehouse->id === $warehouseA->id))
            ->andReturn([
                'RAZONSOCIAL' => 'Cliente',
                'TOTAL' => 100,
                'DETALLE' => [],
            ]);

        $service = new PickingService(
            $flexxusService,
            Mockery::mock(StockValidationServiceInterface::class),
            Mockery::mock(StockCacheServiceInterface::class),
            $this->app->make(WarehouseExecutionContextResolverInterface::class)
        );

        $detail = $service->getOrderDetail($orderNumber, $user->id);

        $this->assertSame('pending', $detail['status']);
        $this->assertNull($detail['assigned_to']);
    }

    public function test_pick_item_does_not_access_order_from_different_warehouse(): void
    {
        $warehouseA = Warehouse::factory()->create(['code' => 'RONDEAU']);
        $warehouseB = Warehouse::factory()->create(['code' => 'CENTRO']);
        $user = User::factory()->create(['warehouse_id' => $warehouseA->id]);
        $orderNumber = 'NP 55555';

        PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'warehouse_id' => $warehouseB->id,
            'user_id' => $user->id,
            'status' => 'in_progress',
        ]);

        $stockValidationMock = Mockery::mock(StockValidationServiceInterface::class);
        $stockValidationMock->shouldReceive('validateStockForPick')
            ->once()
            ->with($orderNumber, 'PROD-001', 1, Mockery::type(User::class))
            ->andThrow(new OrderNotFoundException($orderNumber));

        $service = new PickingService(
            Mockery::mock(FlexxusPickingService::class),
            $stockValidationMock,
            Mockery::mock(StockCacheServiceInterface::class),
            $this->app->make(WarehouseExecutionContextResolverInterface::class)
        );

        $this->expectException(OrderNotFoundException::class);

        $service->pickItem($orderNumber, 'PROD-001', 1, $user->id);
    }
}
