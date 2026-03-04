<?php

namespace Tests\Integration\Services;

use App\Exceptions\Picking\InsufficientStockException;
use App\Exceptions\Picking\InvalidOrderStateException;
use App\Exceptions\Picking\OrderNotFoundException;
use App\Exceptions\Picking\UnauthorizedOperationException;
use App\Exceptions\Picking\WarehouseMismatchException;
use App\Models\PickingItemProgress;
use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\FlexxusPickingService;
use App\Services\Picking\PickingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class PickingServiceExceptionsTest extends TestCase
{
    use RefreshDatabase;

    private PickingService $service;

    private FlexxusPickingService $flexxusService;

    private User $user;

    private Warehouse $warehouse;

    protected function setUp(): void
    {
        parent::setUp();

        $this->flexxusService = Mockery::mock(FlexxusPickingService::class);
        $this->service = new PickingService($this->flexxusService);

        $this->warehouse = Warehouse::factory()->create(['code' => 'WH01', 'name' => 'WH01']);
        $this->user = User::factory()->create(['warehouse_id' => $this->warehouse->id]);
    }

    // Task 2.1: OrderNotFoundException tests
    public function test_get_order_detail_throws_order_not_found_exception()
    {
        $orderNumber = 'NP 99999';

        $this->flexxusService->shouldReceive('getOrderDetail')
            ->with($orderNumber)
            ->once()
            ->andReturn([]);

        $this->expectException(OrderNotFoundException::class);
        $this->expectExceptionMessage("Order {$orderNumber} not found");

        $this->service->getOrderDetail($orderNumber, $this->user->id);
    }

    public function test_start_order_throws_order_not_found_exception()
    {
        $orderNumber = 'NP 99999';
        $today = now()->format('Y-m-d');

        $this->flexxusService->shouldReceive('getOrdersByDateAndWarehouse')
            ->with($today, 'WH01')
            ->once()
            ->andReturn([]);

        $this->expectException(OrderNotFoundException::class);
        $this->expectExceptionMessage("Order {$orderNumber} not found");

        $this->service->startOrder($orderNumber, $this->user->id);
    }

    public function test_pick_item_throws_order_not_found_exception()
    {
        $orderNumber = 'NP 99999';

        $this->expectException(OrderNotFoundException::class);
        $this->expectExceptionMessage("Order {$orderNumber} not found");

        $this->service->pickItem($orderNumber, 'PROD1', 1, $this->user->id);
    }

    public function test_complete_order_throws_order_not_found_exception()
    {
        $orderNumber = 'NP 99999';

        $this->expectException(OrderNotFoundException::class);
        $this->expectExceptionMessage("Order {$orderNumber} not found");

        $this->service->completeOrder($orderNumber, $this->user->id);
    }

    // Task 2.2: InvalidOrderStateException tests
    public function test_pick_item_throws_invalid_state_exception_for_completed_order()
    {
        $orderNumber = 'NP 12345';

        $progress = PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        $this->expectException(InvalidOrderStateException::class);
        $this->expectExceptionMessage('Cannot pick items order');

        $this->service->pickItem($orderNumber, 'PROD1', 1, $this->user->id);
    }

    public function test_complete_order_throws_invalid_state_exception_when_already_completed()
    {
        $orderNumber = 'NP 12345';

        $progress = PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        PickingItemProgress::factory()->create([
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 10,
            'status' => 'completed',
        ]);

        $this->expectException(InvalidOrderStateException::class);
        $this->expectExceptionMessage("Cannot complete order {$orderNumber} in state 'completed'");

        $this->service->completeOrder($orderNumber, $this->user->id);
    }

    // Task 2.3: WarehouseMismatchException tests
    public function test_get_available_orders_throws_warehouse_mismatch_exception()
    {
        $userWithoutWarehouse = User::factory()->create(['warehouse_id' => null]);

        $this->expectException(WarehouseMismatchException::class);
        $this->expectExceptionMessage('warehouse mismatch');

        $this->service->getAvailableOrders($userWithoutWarehouse->id);
    }

    // Task 2.4: InsufficientStockException tests
    public function test_pick_item_throws_insufficient_stock_exception()
    {
        $orderNumber = 'NP 12345';

        PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);

        PickingItemProgress::factory()->create([
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 8,
            'status' => 'in_progress',
        ]);

        $this->expectException(InsufficientStockException::class);
        $this->expectExceptionMessage('Insufficient stock for item PROD1');

        $this->service->pickItem($orderNumber, 'PROD1', 3, $this->user->id);
    }

    // Task 2.5: UnauthorizedOperationException tests
    public function test_pick_item_throws_unauthorized_operation_exception_for_different_user()
    {
        $orderNumber = 'NP 12345';
        $otherUser = User::factory()->create();

        PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $otherUser->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);

        $this->expectException(UnauthorizedOperationException::class);
        $this->expectExceptionMessage("Operation 'pick items' forbidden");

        $this->service->pickItem($orderNumber, 'PROD1', 1, $this->user->id);
    }

    public function test_complete_order_throws_unauthorized_operation_exception_for_different_user()
    {
        $orderNumber = 'NP 12345';
        $otherUser = User::factory()->create();

        PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $otherUser->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);

        $this->expectException(UnauthorizedOperationException::class);
        $this->expectExceptionMessage("Operation 'complete order' forbidden");

        $this->service->completeOrder($orderNumber, $this->user->id);
    }

    public function test_start_order_throws_invalid_state_exception_for_already_started_order()
    {
        $orderNumber = 'NP 12345';
        $today = now()->format('Y-m-d');

        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '12345',
                'RAZONSOCIAL' => 'Customer 1',
            ],
        ];

        $this->flexxusService->shouldReceive('getOrdersByDateAndWarehouse')
            ->with($today, 'WH01')
            ->once()
            ->andReturn($flexxusOrders);

        // Create an existing progress record (order already started)
        PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $this->expectException(InvalidOrderStateException::class);
        $this->expectExceptionMessage("Cannot start order {$orderNumber} in state 'in_progress'");

        $this->service->startOrder($orderNumber, $this->user->id);
    }
}
