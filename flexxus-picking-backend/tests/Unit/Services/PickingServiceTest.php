<?php

namespace Tests\Unit\Services;

use App\Exceptions\Picking\AlreadyPickedException;
use App\Exceptions\Picking\InvalidOrderStateException;
use App\Exceptions\Picking\OrderNotFoundException;
use App\Exceptions\Picking\OverPickException;
use App\Exceptions\Picking\PhysicalStockInsufficientException;
use App\Exceptions\Picking\UnauthorizedOperationException;
use App\Exceptions\Picking\WarehouseMismatchException;
use App\Models\PickingAlert;
use App\Models\PickingItemProgress;
use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\FlexxusPickingService;
use App\Services\Picking\Interfaces\StockValidationServiceInterface;
use App\Services\Picking\PickingService;
use App\Services\Picking\StockValidationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Mockery;
use Tests\TestCase;

class PickingServiceTest extends TestCase
{
    use RefreshDatabase;

    private PickingService $service;

    private FlexxusPickingService $flexxusService;

    private StockValidationServiceInterface $stockValidationService;

    private \App\Services\Picking\Interfaces\StockCacheServiceInterface $stockCacheService;

    private \App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface $warehouseContextResolver;

    private User $user;

    private Warehouse $warehouse;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake();
        Cache::flush();

        $this->flexxusService = Mockery::mock(FlexxusPickingService::class);
        $this->stockValidationService = Mockery::mock(StockValidationServiceInterface::class);
        $this->stockCacheService = Mockery::mock(\App\Services\Picking\Interfaces\StockCacheServiceInterface::class);
        $this->warehouseContextResolver = Mockery::mock(\App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface::class);
        $this->service = new PickingService(
            $this->flexxusService,
            $this->stockValidationService,
            $this->stockCacheService,
            $this->warehouseContextResolver
        );

        $this->warehouse = Warehouse::factory()->create(['code' => 'WH01', 'name' => 'WH01']);
        $this->user = User::factory()->create(['warehouse_id' => $this->warehouse->id]);

        $context = new \App\Services\Picking\WarehouseExecutionContext(
            $this->warehouse->id,
            $this->warehouse->code,
            $this->user->id
        );

        $this->warehouseContextResolver
            ->shouldReceive('resolveForUserId')
            ->with($this->user->id)
            ->andReturn($context);
    }

    public function test_get_available_orders_merges_flexxus_data_with_local_progress()
    {
        $today = now()->format('Y-m-d');

        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '12345',
                'RAZONSOCIAL' => 'Customer 1',
                'TOTAL' => 100.50,
                'FECHACOMPROBANTE' => $today,
            ],
            [
                'NUMEROCOMPROBANTE' => '67890',
                'RAZONSOCIAL' => 'Customer 2',
                'TOTAL' => 200.00,
                'FECHACOMPROBANTE' => $today,
            ],
        ];

        $this->flexxusService->shouldReceive('getOrdersByDateAndWarehouse')
            ->with($today, Mockery::on(function ($warehouse) {
                return $warehouse instanceof \App\Models\Warehouse;
            }))
            ->once()
            ->andReturn($flexxusOrders);

        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 12345',
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $result = $this->service->getAvailableOrders($this->user->id);

        $this->assertInstanceOf(\Illuminate\Pagination\LengthAwarePaginator::class, $result);
        $this->assertCount(2, $result->items());

        $firstOrder = $result->items()[0];
        $this->assertEquals('12345', $firstOrder['order_number']);
        $this->assertEquals('NP', $firstOrder['order_type']);
        $this->assertEquals('Customer 1', $firstOrder['customer']);
        $this->assertEquals('in_progress', $firstOrder['status']);
        $this->assertEquals('WH01', $firstOrder['warehouse']['code']);
        $this->assertNotNull($firstOrder['started_at']);

        $secondOrder = $result->items()[1];
        $this->assertEquals('67890', $secondOrder['order_number']);
        $this->assertEquals('NP', $secondOrder['order_type']);
        $this->assertEquals('pending', $secondOrder['status']);
        $this->assertNull($secondOrder['started_at']);
    }

    public function test_get_available_orders_filters_by_status()
    {
        $today = now()->format('Y-m-d');

        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '12345',
                'RAZONSOCIAL' => 'Customer 1',
                'TOTAL' => 100.50,
                'FECHACOMPROBANTE' => $today,
            ],
        ];

        $this->flexxusService->shouldReceive('getOrdersByDateAndWarehouse')
            ->with($today, Mockery::on(function ($warehouse) {
                return $warehouse instanceof \App\Models\Warehouse;
            }))
            ->once()
            ->andReturn($flexxusOrders);

        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 12345',
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);

        $result = $this->service->getAvailableOrders($this->user->id, ['status' => 'pending']);

        $this->assertCount(0, $result->items());
    }

    public function test_get_available_orders_defaults_to_pending_and_in_progress()
    {
        $today = now()->format('Y-m-d');

        $flexxusOrders = [
            ['NUMEROCOMPROBANTE' => '1', 'RAZONSOCIAL' => 'Customer 1', 'TOTAL' => 100, 'FECHACOMPROBANTE' => $today],
            ['NUMEROCOMPROBANTE' => '2', 'RAZONSOCIAL' => 'Customer 2', 'TOTAL' => 200, 'FECHACOMPROBANTE' => $today],
            ['NUMEROCOMPROBANTE' => '3', 'RAZONSOCIAL' => 'Customer 3', 'TOTAL' => 300, 'FECHACOMPROBANTE' => $today],
        ];

        $this->flexxusService->shouldReceive('getOrdersByDateAndWarehouse')
            ->with($today, Mockery::on(function ($warehouse) {
                return $warehouse instanceof \App\Models\Warehouse;
            }))
            ->once()
            ->andReturn($flexxusOrders);

        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 1',
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'pending',
        ]);

        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 2',
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);

        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 3',
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'completed',
        ]);

        $result = $this->service->getAvailableOrders($this->user->id);

        $this->assertCount(2, $result->items());
        $statuses = collect($result->items())->pluck('status')->toArray();
        $this->assertContains('pending', $statuses);
        $this->assertContains('in_progress', $statuses);
        $this->assertNotContains('completed', $statuses);
    }

    public function test_get_available_orders_with_status_all_returns_all_orders()
    {
        $today = now()->format('Y-m-d');

        $flexxusOrders = [
            ['NUMEROCOMPROBANTE' => '1', 'RAZONSOCIAL' => 'Customer 1', 'TOTAL' => 100, 'FECHACOMPROBANTE' => $today],
            ['NUMEROCOMPROBANTE' => '2', 'RAZONSOCIAL' => 'Customer 2', 'TOTAL' => 200, 'FECHACOMPROBANTE' => $today],
            ['NUMEROCOMPROBANTE' => '3', 'RAZONSOCIAL' => 'Customer 3', 'TOTAL' => 300, 'FECHACOMPROBANTE' => $today],
        ];

        $this->flexxusService->shouldReceive('getOrdersByDateAndWarehouse')
            ->with($today, Mockery::on(function ($warehouse) {
                return $warehouse instanceof \App\Models\Warehouse;
            }))
            ->once()
            ->andReturn($flexxusOrders);

        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 1',
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'pending',
        ]);

        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 2',
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);

        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 3',
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'completed',
        ]);

        $result = $this->service->getAvailableOrders($this->user->id, ['status' => 'all']);

        $this->assertCount(3, $result->items());
    }

    public function test_get_available_orders_filters_by_specific_status_pending()
    {
        $today = now()->format('Y-m-d');

        $flexxusOrders = [
            ['NUMEROCOMPROBANTE' => '1', 'RAZONSOCIAL' => 'Customer 1', 'TOTAL' => 100, 'FECHACOMPROBANTE' => $today],
            ['NUMEROCOMPROBANTE' => '2', 'RAZONSOCIAL' => 'Customer 2', 'TOTAL' => 200, 'FECHACOMPROBANTE' => $today],
        ];

        $this->flexxusService->shouldReceive('getOrdersByDateAndWarehouse')
            ->with($today, Mockery::on(function ($warehouse) {
                return $warehouse instanceof \App\Models\Warehouse;
            }))
            ->once()
            ->andReturn($flexxusOrders);

        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 1',
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'pending',
        ]);

        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 2',
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);

        $result = $this->service->getAvailableOrders($this->user->id, ['status' => 'pending']);

        $this->assertCount(1, $result->items());
        $this->assertEquals('pending', $result->items()[0]['status']);
    }

    public function test_get_available_orders_filters_by_specific_status_completed()
    {
        $today = now()->format('Y-m-d');

        $flexxusOrders = [
            ['NUMEROCOMPROBANTE' => '1', 'RAZONSOCIAL' => 'Customer 1', 'TOTAL' => 100, 'FECHACOMPROBANTE' => $today],
            ['NUMEROCOMPROBANTE' => '2', 'RAZONSOCIAL' => 'Customer 2', 'TOTAL' => 200, 'FECHACOMPROBANTE' => $today],
        ];

        $this->flexxusService->shouldReceive('getOrdersByDateAndWarehouse')
            ->with($today, Mockery::on(function ($warehouse) {
                return $warehouse instanceof \App\Models\Warehouse;
            }))
            ->once()
            ->andReturn($flexxusOrders);

        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 1',
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'pending',
        ]);

        PickingOrderProgress::factory()->create([
            'order_number' => 'NP 2',
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'completed',
        ]);

        $result = $this->service->getAvailableOrders($this->user->id, ['status' => 'completed']);

        $this->assertCount(1, $result->items());
        $this->assertEquals('completed', $result->items()[0]['status']);
    }

    public function test_get_available_orders_throws_exception_when_user_has_no_warehouse()
    {
        $userWithoutWarehouse = User::factory()->create(['warehouse_id' => null]);

        $this->warehouseContextResolver
            ->shouldReceive('resolveForUserId')
            ->with($userWithoutWarehouse->id)
            ->andThrow(new WarehouseMismatchException('', $userWithoutWarehouse->id, 0, [
                'reason' => 'User does not have a warehouse assigned',
            ]));

        $this->expectException(WarehouseMismatchException::class);
        $this->expectExceptionMessage('warehouse mismatch');

        $this->service->getAvailableOrders($userWithoutWarehouse->id);
    }

    public function test_get_order_detail_includes_items_and_stock()
    {
        $orderNumber = '12345';

        $flexxusOrder = [
            'RAZONSOCIAL' => 'Customer 1',
            'TOTAL' => 100.50,
            'DETALLE' => [
                [
                    'CODIGOPARTICULAR' => 'PROD1',
                    'DESCRIPCION' => 'Product 1',
                    'PENDIENTE' => 10,
                    'LOTE' => 'LOT001',
                ],
            ],
        ];

        $stockInfo = [
            'warehouse' => 'WH01',
            'total' => 50,
            'is_local' => true,
        ];

        $formattedItem = [
            'product_code' => 'PROD1',
            'description' => 'Product 1',
            'quantity_required' => 10,
            'quantity_picked' => 0,
            'location' => null,
            'status' => 'pending',
        ];

        $context = new \App\Services\Picking\WarehouseExecutionContext(
            $this->warehouse->id,
            $this->warehouse->code,
            $this->user->id
        );

        $this->warehouseContextResolver
            ->shouldReceive('resolveForUserId')
            ->with($this->user->id)
            ->andReturn($context);

        $this->flexxusService->shouldReceive('getOrderDetail')
            ->with('12345', 'WH01')
            ->once()
            ->andReturn($flexxusOrder);

        $this->stockValidationService->shouldReceive('getStockForProduct')
            ->with('PROD1', $this->warehouse->id)
            ->once()
            ->andReturn($stockInfo);

        $this->flexxusService->shouldReceive('formatOrderItem')
            ->once()
            ->andReturn($formattedItem);

        $result = $this->service->getOrderDetail('NP 12345', $this->user->id);

        $this->assertEquals('12345', $result['order_number']);
        $this->assertEquals('NP', $result['order_type']);
        $this->assertEquals('Customer 1', $result['customer']);
        $this->assertEquals('WH01', $result['warehouse']['code']);
        $this->assertEquals('pending', $result['status']);
        $this->assertCount(1, $result['items']);
        $this->assertEquals('PROD1', $result['items'][0]['product_code']);
        $this->assertEquals(0, $result['items'][0]['quantity_picked']);
        $this->assertEquals('pending', $result['items'][0]['status']);
    }

    public function test_get_order_detail_includes_local_progress()
    {
        $orderNumber = 'NP 12345';

        $flexxusOrder = [
            'RAZONSOCIAL' => 'Customer 1',
            'TOTAL' => 100.50,
            'items' => [],
        ];

        $this->flexxusService->shouldReceive('getOrderDetail')
            ->with($orderNumber, Mockery::on(function ($warehouse) {
                return $warehouse instanceof \App\Models\Warehouse;
            }))
            ->once()
            ->andReturn($flexxusOrder);

        $progress = PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        PickingItemProgress::factory()->create([
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 5,
            'status' => 'in_progress',
        ]);

        $result = $this->service->getOrderDetail($orderNumber, $this->user->id);

        $this->assertEquals('in_progress', $result['status']);
        $this->assertNotNull($result['started_at']);
        $this->assertEquals($this->user->id, $result['assigned_to']['id']);
        $this->assertEquals($this->user->name, $result['assigned_to']['name']);
    }

    public function test_get_order_detail_throws_exception_when_order_not_found()
    {
        $orderNumber = 'NP 99999';

        $this->flexxusService->shouldReceive('getOrderDetail')
            ->with($orderNumber, Mockery::on(function ($warehouse) {
                return $warehouse instanceof \App\Models\Warehouse;
            }))
            ->once()
            ->andReturn([]);

        $this->expectException(OrderNotFoundException::class);
        $this->expectExceptionMessage("Order {$orderNumber} not found");

        $this->service->getOrderDetail($orderNumber, $this->user->id);
    }

    public function test_start_order_creates_progress_records()
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
            ->with($today, Mockery::on(function ($warehouse) {
                return $warehouse instanceof \App\Models\Warehouse;
            }))
            ->once()
            ->andReturn($flexxusOrders);

        $flexxusOrder = [
            'DETALLE' => [
                ['CODIGOPARTICULAR' => 'PROD1', 'PENDIENTE' => 10, 'CANTIDAD' => 10],
                ['CODIGOPARTICULAR' => 'PROD2', 'PENDIENTE' => 5, 'CANTIDAD' => 5],
            ],
        ];

        $this->flexxusService->shouldReceive('getOrderDetail')
            ->with($orderNumber, Mockery::on(function ($warehouse) {
                return $warehouse instanceof \App\Models\Warehouse;
            }))
            ->once()
            ->andReturn($flexxusOrder);

        $this->stockCacheService->shouldReceive('prefetchStockForOrder')
            ->once()
            ->andReturn(new \Illuminate\Database\Eloquent\Collection);

        $result = $this->service->startOrder($orderNumber, $this->user->id);

        $this->assertInstanceOf(PickingOrderProgress::class, $result);
        $this->assertEquals($orderNumber, $result->order_number);
        $this->assertEquals($this->user->id, $result->user_id);
        $this->assertEquals($this->warehouse->id, $result->warehouse_id);
        $this->assertEquals('in_progress', $result->status);
        $this->assertNotNull($result->started_at);

        $this->assertCount(2, $result->items);
        $this->assertEquals('PROD1', $result->items[0]->product_code);
        $this->assertEquals(10, $result->items[0]->quantity_required);
        $this->assertEquals(0, $result->items[0]->quantity_picked);
        $this->assertEquals('pending', $result->items[0]->status);

        $this->assertEquals('PROD2', $result->items[1]->product_code);
        $this->assertEquals(5, $result->items[1]->quantity_required);
    }

    public function test_start_order_throws_exception_when_order_not_found()
    {
        $orderNumber = 'NP 99999';

        $this->flexxusService->shouldReceive('getOrdersByDateAndWarehouse')
            ->once()
            ->andReturn([]);

        $this->expectException(OrderNotFoundException::class);
        $this->expectExceptionMessage("Order {$orderNumber} not found");

        $this->service->startOrder($orderNumber, $this->user->id);
    }

    public function test_start_order_prefetches_stock_for_all_items(): void
    {
        // Arrange
        $orderNumber = 'NP 54321';

        $flexxusOrders = [
            ['NUMEROCOMPROBANTE' => '54321', 'DEPOSITO' => $this->warehouse->name],
        ];

        $this->flexxusService->shouldReceive('getOrdersByDateAndWarehouse')
            ->with(Mockery::type('string'), Mockery::on(function ($warehouse) {
                return $warehouse instanceof \App\Models\Warehouse;
            }))
            ->once()
            ->andReturn($flexxusOrders);

        $flexxusOrder = [
            'DETALLE' => [
                ['CODIGOPARTICULAR' => 'PROD-001', 'PENDIENTE' => 10, 'CANTIDAD' => 10],
                ['CODIGOPARTICULAR' => 'PROD-002', 'PENDIENTE' => 5, 'CANTIDAD' => 5],
                ['CODIGOPARTICULAR' => 'PROD-003', 'PENDIENTE' => 3, 'CANTIDAD' => 3],
            ],
        ];

        $this->flexxusService->shouldReceive('getOrderDetail')
            ->with($orderNumber, Mockery::on(function ($warehouse) {
                return $warehouse instanceof \App\Models\Warehouse;
            }))
            ->once()
            ->andReturn($flexxusOrder);

        // Mock StockCacheService
        $mockCacheService = Mockery::mock(\App\Services\Picking\Interfaces\StockCacheServiceInterface::class);
        $mockCacheService->shouldReceive('prefetchStockForOrder')
            ->once()
            ->with(Mockery::on(function ($order) use ($orderNumber) {
                return $order instanceof PickingOrderProgress
                    && $order->order_number === $orderNumber
                    && $order->items->count() === 3;
            }));

        // Create service with mocked cache service
        $this->service = new PickingService(
            $this->flexxusService,
            $this->stockValidationService,
            $mockCacheService,
            $this->warehouseContextResolver
        );

        // Act
        $result = $this->service->startOrder($orderNumber, $this->user->id);

        // Assert
        $this->assertInstanceOf(PickingOrderProgress::class, $result);
        $this->assertCount(3, $result->items);
    }

    public function test_start_order_with_numeric_only_input_normalizes_to_canonical_format(): void
    {
        $orderNumber = '623200';
        $canonicalOrderNumber = 'NP 623200';
        $today = now()->format('Y-m-d');

        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '623200',
                'RAZONSOCIAL' => 'Customer 1',
            ],
        ];

        $this->flexxusService->shouldReceive('getOrdersByDateAndWarehouse')
            ->with($today, Mockery::on(function ($warehouse) {
                return $warehouse instanceof \App\Models\Warehouse;
            }))
            ->once()
            ->andReturn($flexxusOrders);

        $flexxusOrder = [
            'DETALLE' => [
                ['CODIGOPARTICULAR' => 'PROD1', 'PENDIENTE' => 10, 'CANTIDAD' => 10],
            ],
        ];

        $this->flexxusService->shouldReceive('getOrderDetail')
            ->with($canonicalOrderNumber, Mockery::on(function ($warehouse) {
                return $warehouse instanceof \App\Models\Warehouse;
            }))
            ->once()
            ->andReturn($flexxusOrder);

        $this->stockCacheService->shouldReceive('prefetchStockForOrder')
            ->once()
            ->andReturn(new \Illuminate\Database\Eloquent\Collection);

        $result = $this->service->startOrder($orderNumber, $this->user->id);

        $this->assertInstanceOf(PickingOrderProgress::class, $result);
        $this->assertEquals($canonicalOrderNumber, $result->order_number, 'Progress order_number should be canonical NP 623200');
        $this->assertCount(1, $result->items);
        $this->assertEquals($canonicalOrderNumber, $result->items->first()->order_number, 'Item order_number should be canonical NP 623200');
    }

    public function test_pick_item_updates_picked_quantity()
    {
        $orderNumber = 'NP 12345';

        $progress = PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);

        $item = PickingItemProgress::factory()->create([
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 3,
            'status' => 'in_progress',
        ]);

        // Mock StockValidationService to pass validation
        $validation = \App\Models\PickingStockValidation::factory()->make([
            'order_number' => $orderNumber,
            'item_code' => 'PROD1',
            'validation_result' => 'passed',
        ]);

        $this->stockValidationService
            ->shouldReceive('validateStockForPick')
            ->once()
            ->with($orderNumber, 'PROD1', 4, \Mockery::type(User::class))
            ->andReturn($validation);

        $this->stockValidationService
            ->shouldReceive('getLatestValidation')
            ->once()
            ->with($orderNumber, 'PROD1')
            ->andReturn($validation);

        $result = $this->service->pickItem($orderNumber, 'PROD1', 4, $this->user->id);

        $this->assertEquals('PROD1', $result['product_code']);
        $this->assertEquals(10, $result['quantity_required']);
        $this->assertEquals(7, $result['quantity_picked']);
        $this->assertEquals('in_progress', $result['status']);
        $this->assertEquals(3, $result['remaining']);

        $item->refresh();
        $this->assertEquals(7, $item->quantity_picked);
        $this->assertEquals('in_progress', $item->status);
    }

    public function test_pick_item_completes_when_quantity_reached()
    {
        $orderNumber = 'NP 12345';

        PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
        ]);

        $item = PickingItemProgress::factory()->create([
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 8,
            'status' => 'in_progress',
        ]);

        // Mock StockValidationService to pass validation
        $validation = \App\Models\PickingStockValidation::factory()->make([
            'order_number' => $orderNumber,
            'item_code' => 'PROD1',
            'validation_result' => 'passed',
        ]);

        $this->stockValidationService
            ->shouldReceive('validateStockForPick')
            ->once()
            ->with($orderNumber, 'PROD1', 2, \Mockery::type(User::class))
            ->andReturn($validation);

        $this->stockValidationService
            ->shouldReceive('getLatestValidation')
            ->once()
            ->with($orderNumber, 'PROD1')
            ->andReturn($validation);

        $result = $this->service->pickItem($orderNumber, 'PROD1', 2, $this->user->id);

        $this->assertEquals('completed', $result['status']);
        $this->assertEquals(0, $result['remaining']);

        $item->refresh();
        $this->assertEquals('completed', $item->status);
        $this->assertNotNull($item->completed_at);
    }

    public function test_pick_item_throws_exception_when_order_not_found()
    {
        $this->expectException(OrderNotFoundException::class);
        $this->expectExceptionMessage('Order NP 99999 not found');

        $this->service->pickItem('NP 99999', 'PROD1', 1, $this->user->id);
    }

    public function test_pick_item_throws_exception_when_user_not_assigned()
    {
        $orderNumber = 'NP 12345';
        $otherUser = User::factory()->create();

        PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $otherUser->id,
            'warehouse_id' => $this->warehouse->id,
        ]);

        $this->expectException(UnauthorizedOperationException::class);
        $this->expectExceptionMessage("Operation 'pick items' forbidden");

        $this->service->pickItem($orderNumber, 'PROD1', 1, $this->user->id);
    }

    public function test_pick_item_throws_exception_when_quantity_exceeds_required()
    {
        $orderNumber = 'NP 12345';

        PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
        ]);

        PickingItemProgress::factory()->create([
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 8,
        ]);

        // Mock StockValidationService to throw OverPickException
        $this->stockValidationService
            ->shouldReceive('validateStockForPick')
            ->once()
            ->with($orderNumber, 'PROD1', 3, \Mockery::type(User::class))
            ->andThrow(new OverPickException($orderNumber, 'PROD1', 3, 2));

        $this->expectException(OverPickException::class);
        $this->expectExceptionMessage('No se puede marcar más de 2 unidades para PROD1');

        $this->service->pickItem($orderNumber, 'PROD1', 3, $this->user->id);
    }

    public function test_complete_order_marks_completed()
    {
        $orderNumber = 'NP 12345';

        $progress = PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
        ]);

        PickingItemProgress::factory()->create([
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 10,
            'status' => 'completed',
        ]);

        $result = $this->service->completeOrder($orderNumber, $this->user->id);

        $this->assertEquals('completed', $result->status);
        $this->assertNotNull($result->completed_at);
    }

    public function test_complete_order_throws_exception_with_incomplete_items()
    {
        $orderNumber = 'NP 12345';

        PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
        ]);

        PickingItemProgress::factory()->create([
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 5,
            'status' => 'in_progress',
        ]);

        $this->expectException(InvalidOrderStateException::class);
        $this->expectExceptionMessage('Cannot complete order');

        $this->service->completeOrder($orderNumber, $this->user->id);
    }

    public function test_create_alert_creates_alert_and_updates_order()
    {
        $orderNumber = 'NP 12345';

        PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'has_stock_issues' => false,
            'issues_count' => 0,
        ]);

        $data = [
            'order_number' => $orderNumber,
            'alert_type' => 'insufficient_stock',
            'product_code' => 'PROD1',
            'message' => 'Insufficient stock',
            'severity' => 'high',
        ];

        $result = $this->service->createAlert($data, $this->user->id);

        $this->assertInstanceOf(PickingAlert::class, $result);
        $this->assertEquals($orderNumber, $result->order_number);
        $this->assertEquals($this->warehouse->id, $result->warehouse_id);
        $this->assertEquals($this->user->id, $result->user_id);
        $this->assertEquals('insufficient_stock', $result->alert_type);
        $this->assertEquals('PROD1', $result->product_code);
        $this->assertEquals('Insufficient stock', $result->message);
        $this->assertEquals('high', $result->severity);

        $result->refresh();
        $this->assertFalse($result->is_resolved);

        $progress = PickingOrderProgress::where('order_number', $orderNumber)->first();
        $this->assertTrue($progress->has_stock_issues);
        $this->assertEquals(1, $progress->issues_count);
    }

    public function test_get_alerts_returns_paginated_alerts()
    {
        PickingAlert::factory()->count(20)->create([
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
        ]);

        $result = $this->service->getAlerts();

        $this->assertInstanceOf(\Illuminate\Pagination\LengthAwarePaginator::class, $result);
        $this->assertCount(15, $result->items());
        $this->assertEquals(20, $result->total());
    }

    public function test_get_alerts_filters_by_warehouse()
    {
        $otherWarehouse = Warehouse::factory()->create();

        PickingAlert::factory()->create([
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
        ]);

        PickingAlert::factory()->create([
            'warehouse_id' => $otherWarehouse->id,
            'user_id' => $this->user->id,
        ]);

        $result = $this->service->getAlerts(['warehouse_id' => $this->warehouse->id]);

        $this->assertCount(1, $result->items());
        $this->assertEquals($this->warehouse->id, $result->items()[0]->warehouse_id);
    }

    public function test_get_alerts_filters_by_resolved_status()
    {
        PickingAlert::factory()->create([
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
            'is_resolved' => true,
        ]);

        PickingAlert::factory()->create([
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
            'is_resolved' => false,
        ]);

        $result = $this->service->getAlerts(['resolved' => 'false']);

        $this->assertCount(1, $result->items());
        $this->assertFalse($result->items()[0]->is_resolved);
    }

    public function test_resolve_alert_marks_resolved()
    {
        $alert = PickingAlert::factory()->create([
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
            'is_resolved' => false,
        ]);

        $resolver = User::factory()->create();

        $result = $this->service->resolveAlert($alert->id, $resolver->id, 'Fixed');

        $this->assertTrue($result->is_resolved);
        $this->assertNotNull($result->resolved_at);
        $this->assertEquals($resolver->id, $result->resolved_by);
        $this->assertEquals($resolver->name, $result->resolver->name);
    }

    public function test_get_available_orders_includes_assigned_to_and_items_picked()
    {
        $today = now()->format('Y-m-d');

        $flexxusOrders = [
            [
                'NUMEROCOMPROBANTE' => '12345',
                'RAZONSOCIAL' => 'Customer 1',
                'TOTAL' => 100.50,
                'FECHACOMPROBANTE' => $today,
            ],
            [
                'NUMEROCOMPROBANTE' => '67890',
                'RAZONSOCIAL' => 'Customer 2',
                'TOTAL' => 200.00,
                'FECHACOMPROBANTE' => $today,
            ],
        ];

        $this->flexxusService->shouldReceive('getOrdersByDateAndWarehouse')
            ->with($today, Mockery::on(function ($warehouse) {
                return $warehouse instanceof \App\Models\Warehouse;
            }))
            ->once()
            ->andReturn($flexxusOrders);

        $progress = PickingOrderProgress::factory()->create([
            'order_number' => 'NP 12345',
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        PickingItemProgress::factory()->count(3)->create([
            'order_number' => 'NP 12345',
            'status' => 'completed',
        ]);

        PickingItemProgress::factory()->count(2)->create([
            'order_number' => 'NP 12345',
            'status' => 'pending',
        ]);

        $result = $this->service->getAvailableOrders($this->user->id);

        $firstOrder = collect($result->items())->first(fn ($o) => $o['order_number'] === 'NP 12345');
        $secondOrder = collect($result->items())->first(fn ($o) => $o['order_number'] === 'NP 67890');

        $this->assertNotNull($firstOrder['assigned_to']);
        $this->assertEquals($this->user->id, $firstOrder['assigned_to']['id']);
        $this->assertEquals($this->user->name, $firstOrder['assigned_to']['name']);
        $this->assertEquals(3, $firstOrder['items_picked']);

        $this->assertNull($secondOrder['assigned_to']);
        $this->assertEquals(0, $secondOrder['items_picked']);
    }

    // New tests for StockValidationService integration (Task 2.4)

    public function test_pick_item_throws_over_pick_exception_when_exceeding_remaining()
    {
        $orderNumber = 'NP 12345';

        PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
        ]);

        PickingItemProgress::factory()->create([
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 8,
            'status' => 'in_progress',
        ]);

        // Mock validation to throw OverPickException
        $this->stockValidationService
            ->shouldReceive('validateStockForPick')
            ->once()
            ->with($orderNumber, 'PROD1', 5, \Mockery::type(User::class))
            ->andThrow(new OverPickException($orderNumber, 'PROD1', 5, 2));

        $this->expectException(OverPickException::class);
        $this->expectExceptionMessage('No se puede marcar más de 2 unidades para PROD1');

        $this->service->pickItem($orderNumber, 'PROD1', 5, $this->user->id);
    }

    public function test_pick_item_throws_already_picked_exception_when_item_completed()
    {
        $orderNumber = 'NP 12345';

        PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
        ]);

        PickingItemProgress::factory()->create([
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 10,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Mock validation to throw AlreadyPickedException
        $this->stockValidationService
            ->shouldReceive('validateStockForPick')
            ->once()
            ->with($orderNumber, 'PROD1', 1, \Mockery::type(User::class))
            ->andThrow(new AlreadyPickedException($orderNumber, 'PROD1', 10, now()));

        $this->expectException(AlreadyPickedException::class);
        $this->expectExceptionMessage('El item PROD1 ya fue pickeado');

        $this->service->pickItem($orderNumber, 'PROD1', 1, $this->user->id);
    }

    public function test_pick_item_throws_physical_stock_insufficient_exception()
    {
        $orderNumber = 'NP 12345';

        PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
        ]);

        PickingItemProgress::factory()->create([
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 5,
            'status' => 'in_progress',
        ]);

        // Mock validation to throw PhysicalStockInsufficientException
        $this->stockValidationService
            ->shouldReceive('validateStockForPick')
            ->once()
            ->with($orderNumber, 'PROD1', 3, \Mockery::type(User::class))
            ->andThrow(new PhysicalStockInsufficientException($orderNumber, 'PROD1', 3, 0));

        $this->expectException(PhysicalStockInsufficientException::class);
        $this->expectExceptionMessage('Stock físico insuficiente: hay 0, se solicitaron 3');

        $this->service->pickItem($orderNumber, 'PROD1', 3, $this->user->id);
    }

    public function test_pick_item_response_includes_stock_after_pick()
    {
        $orderNumber = 'NP 12345';

        $progress = PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $progress->id,
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 5,
            'status' => 'in_progress',
        ]);

        $validation = \App\Models\PickingStockValidation::factory()->make([
            'order_number' => $orderNumber,
            'item_code' => 'PROD1',
            'validation_result' => 'passed',
            'available_qty' => 20,
        ]);

        $this->stockValidationService
            ->shouldReceive('validateStockForPick')
            ->once()
            ->with($orderNumber, 'PROD1', 3, \Mockery::type(User::class))
            ->andReturn($validation);

        $this->stockValidationService
            ->shouldReceive('getLatestValidation')
            ->once()
            ->with($orderNumber, 'PROD1')
            ->andReturn($validation);

        $result = $this->service->pickItem($orderNumber, 'PROD1', 3, $this->user->id);

        $this->assertArrayHasKey('stock_after_pick', $result);
        $this->assertEquals(12, $result['stock_after_pick']);
        $this->assertEquals(8, $result['quantity_picked']);
        $this->assertEquals(2, $result['remaining']);
    }

    public function test_pick_item_stock_after_pick_decrements_with_each_pick()
    {
        $orderNumber = 'NP 12345';

        $progress = PickingOrderProgress::factory()->create([
            'order_number' => $orderNumber,
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $progress->id,
            'order_number' => $orderNumber,
            'product_code' => 'PROD1',
            'quantity_required' => 10,
            'quantity_picked' => 0,
            'status' => 'pending',
        ]);

        $validation = \App\Models\PickingStockValidation::factory()->make([
            'order_number' => $orderNumber,
            'item_code' => 'PROD1',
            'validation_result' => 'passed',
            'available_qty' => 50,
        ]);

        $this->stockValidationService
            ->shouldReceive('validateStockForPick')
            ->times(2)
            ->with($orderNumber, 'PROD1', \Mockery::type('int'), \Mockery::type(User::class))
            ->andReturn($validation);

        $this->stockValidationService
            ->shouldReceive('getLatestValidation')
            ->times(2)
            ->with($orderNumber, 'PROD1')
            ->andReturn($validation);

        $result1 = $this->service->pickItem($orderNumber, 'PROD1', 3, $this->user->id);
        $this->assertEquals(47, $result1['stock_after_pick']);

        $result2 = $this->service->pickItem($orderNumber, 'PROD1', 4, $this->user->id);
        $this->assertEquals(43, $result2['stock_after_pick']);
    }
}
