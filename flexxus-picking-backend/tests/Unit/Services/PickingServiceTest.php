<?php

namespace Tests\Unit\Services;

use App\Models\PickingAlert;
use App\Models\PickingItemProgress;
use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\FlexxusPickingService;
use App\Services\Picking\PickingService;
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

    private User $user;

    private Warehouse $warehouse;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake();
        Cache::flush();

        $this->flexxusService = Mockery::mock(FlexxusPickingService::class);
        $this->service = new PickingService($this->flexxusService);

        $this->warehouse = Warehouse::factory()->create(['code' => 'WH01', 'name' => 'WH01']);
        $this->user = User::factory()->create(['warehouse_id' => $this->warehouse->id]);
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
            ->with($today, 'WH01')
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
        $this->assertEquals('NP 12345', $firstOrder['order_number']);
        $this->assertEquals('Customer 1', $firstOrder['customer']);
        $this->assertEquals('in_progress', $firstOrder['status']);
        $this->assertEquals('WH01', $firstOrder['warehouse']['code']);
        $this->assertNotNull($firstOrder['started_at']);

        $secondOrder = $result->items()[1];
        $this->assertEquals('NP 67890', $secondOrder['order_number']);
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
            ->with($today, 'WH01')
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
            ->with($today, 'WH01')
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
            ->with($today, 'WH01')
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
            ->with($today, 'WH01')
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
            ->with($today, 'WH01')
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

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('User does not have a warehouse assigned');

        $this->service->getAvailableOrders($userWithoutWarehouse->id);
    }

    public function test_get_order_detail_includes_items_and_stock()
    {
        $orderNumber = 'NP 12345';

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
            'lot' => 'LOT001',
            'stock_info' => [
                'available' => 50,
                'is_local' => true,
                'is_sufficient' => true,
                'shortage' => 0,
            ],
        ];

        $this->flexxusService->shouldReceive('getOrderDetail')
            ->with($orderNumber)
            ->once()
            ->andReturn($flexxusOrder);

        $this->flexxusService->shouldReceive('getProductStock')
            ->with('PROD1', 'WH01')
            ->once()
            ->andReturn($stockInfo);

        $this->flexxusService->shouldReceive('formatOrderItem')
            ->once()
            ->andReturn($formattedItem);

        $result = $this->service->getOrderDetail($orderNumber, $this->user->id);

        $this->assertEquals($orderNumber, $result['order_number']);
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
            ->with($orderNumber)
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
            ->with($orderNumber)
            ->once()
            ->andReturn([]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Order {$orderNumber} not found in Flexxus");

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
            ->with($today, 'WH01')
            ->once()
            ->andReturn($flexxusOrders);

        $flexxusOrder = [
            'DETALLE' => [
                ['CODIGOPARTICULAR' => 'PROD1', 'PENDIENTE' => 10, 'CANTIDAD' => 10],
                ['CODIGOPARTICULAR' => 'PROD2', 'PENDIENTE' => 5, 'CANTIDAD' => 5],
            ],
        ];

        $this->flexxusService->shouldReceive('getOrderDetail')
            ->with($orderNumber)
            ->once()
            ->andReturn($flexxusOrder);

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

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Order {$orderNumber} not found or not accessible");

        $this->service->startOrder($orderNumber, $this->user->id);
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

        $result = $this->service->pickItem($orderNumber, 'PROD1', 2, $this->user->id);

        $this->assertEquals('completed', $result['status']);
        $this->assertEquals(0, $result['remaining']);

        $item->refresh();
        $this->assertEquals('completed', $item->status);
        $this->assertNotNull($item->completed_at);
    }

    public function test_pick_item_throws_exception_when_order_not_found()
    {
        $this->expectException(\Exception::class);
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

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("You don't have permission to modify this order");

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

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Cannot pick more than required quantity');

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

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Cannot complete order with incomplete items');

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
            ->with($today, 'WH01')
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
}
