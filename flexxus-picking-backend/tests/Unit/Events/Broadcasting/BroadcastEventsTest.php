<?php

namespace Tests\Unit\Events\Broadcasting;

use App\Events\Broadcasting\OrderStartedBroadcastEvent;
use App\Events\Broadcasting\OrderCompletedBroadcastEvent;
use App\Events\Broadcasting\PickingProgressBroadcastEvent;
use App\Events\Broadcasting\StockAlertBroadcastEvent;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Broadcast;
use Tests\TestCase;

class BroadcastEventsTest extends TestCase
{
    use DatabaseMigrations;

    // ─────────────────────────────────────────────────────────────────────────
    // OrderStartedBroadcastEvent
    // ─────────────────────────────────────────────────────────────────────────

    public function test_order_started_broadcast_event_broadcasts_to_correct_channels(): void
    {
        $event = new OrderStartedBroadcastEvent(
            orderNumber: 'ORD-TEST-001',
            warehouseId: 5,
            userId: 10,
            userName: 'Juan Pérez',
            message: 'Pedido iniciado',
        );

        $channels = $event->broadcastOn();

        $this->assertCount(3, $channels);

        $this->assertEquals('private-warehouse.5', $channels[0]->name);
        $this->assertEquals('private-user.10', $channels[1]->name);
        $this->assertEquals('private-order.ORD-TEST-001', $channels[2]->name);
    }

    public function test_order_started_broadcast_event_has_correct_broadcast_name(): void
    {
        $event = new OrderStartedBroadcastEvent(
            orderNumber: 'ORD-TEST-001',
            warehouseId: 5,
            userId: 10,
            userName: 'Juan Pérez',
        );

        $this->assertEquals('order.started', $event->broadcastAs());
    }

    public function test_order_started_broadcast_event_returns_valid_payload(): void
    {
        $event = new OrderStartedBroadcastEvent(
            orderNumber: 'ORD-TEST-001',
            warehouseId: 5,
            userId: 10,
            userName: 'Juan Pérez',
            message: 'Pedido iniciado',
        );

        $payload = $event->toArray();

        $this->assertEquals('order_started', $payload['event_type']);
        $this->assertEquals('ORD-TEST-001', $payload['order_number']);
        $this->assertEquals(5, $payload['warehouse_id']);
        $this->assertEquals(10, $payload['user_id']);
        $this->assertEquals('Juan Pérez', $payload['user_name']);
        $this->assertEquals('Pedido iniciado', $payload['message']);
        $this->assertArrayHasKey('timestamp', $payload);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OrderCompletedBroadcastEvent
    // ─────────────────────────────────────────────────────────────────────────

    public function test_order_completed_broadcast_event_broadcasts_to_correct_channels(): void
    {
        $event = new OrderCompletedBroadcastEvent(
            orderNumber: 'ORD-TEST-002',
            warehouseId: 3,
            userId: 7,
            userName: 'María García',
            totalItems: 10,
            pickedItems: 10,
        );

        $channels = $event->broadcastOn();

        $this->assertCount(3, $channels);
        $this->assertEquals('private-warehouse.3', $channels[0]->name);
        $this->assertEquals('private-user.7', $channels[1]->name);
        $this->assertEquals('private-order.ORD-TEST-002', $channels[2]->name);
    }

    public function test_order_completed_broadcast_event_has_correct_broadcast_name(): void
    {
        $event = new OrderCompletedBroadcastEvent(
            orderNumber: 'ORD-TEST-002',
            warehouseId: 3,
            userId: 7,
            userName: 'María García',
            totalItems: 10,
            pickedItems: 10,
        );

        $this->assertEquals('order.completed', $event->broadcastAs());
    }

    public function test_order_completed_broadcast_event_returns_valid_payload(): void
    {
        $event = new OrderCompletedBroadcastEvent(
            orderNumber: 'ORD-TEST-002',
            warehouseId: 3,
            userId: 7,
            userName: 'María García',
            totalItems: 10,
            pickedItems: 10,
            message: 'Pedido completado',
        );

        $payload = $event->toArray();

        $this->assertEquals('order_completed', $payload['event_type']);
        $this->assertEquals('ORD-TEST-002', $payload['order_number']);
        $this->assertEquals(3, $payload['warehouse_id']);
        $this->assertEquals(7, $payload['user_id']);
        $this->assertEquals(10, $payload['total_items']);
        $this->assertEquals(10, $payload['picked_items']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PickingProgressBroadcastEvent
    // ─────────────────────────────────────────────────────────────────────────

    public function test_picking_progress_broadcast_event_broadcasts_to_correct_channels(): void
    {
        $event = new PickingProgressBroadcastEvent(
            orderNumber: 'ORD-TEST-003',
            warehouseId: 8,
            userId: 12,
            totalItems: 5,
            pickedItems: 2,
            progressPercent: 40.0,
            productCode: 'SKU-123',
            quantityPicked: 1,
            eventType: 'item_completed',
            message: 'Item SKU-123 completado',
        );

        $channels = $event->broadcastOn();

        $this->assertCount(2, $channels);
        $this->assertEquals('private-order.ORD-TEST-003', $channels[0]->name);
        $this->assertEquals('private-warehouse.8', $channels[1]->name);
    }

    public function test_picking_progress_broadcast_event_has_correct_broadcast_name(): void
    {
        $event = new PickingProgressBroadcastEvent(
            orderNumber: 'ORD-TEST-003',
            warehouseId: 8,
            userId: 12,
            totalItems: 5,
            pickedItems: 2,
            progressPercent: 40.0,
        );

        $this->assertEquals('picking.progress', $event->broadcastAs());
    }

    public function test_picking_progress_broadcast_event_returns_valid_payload(): void
    {
        $event = new PickingProgressBroadcastEvent(
            orderNumber: 'ORD-TEST-003',
            warehouseId: 8,
            userId: 12,
            totalItems: 5,
            pickedItems: 2,
            progressPercent: 40.0,
            productCode: 'SKU-123',
            quantityPicked: 1,
            eventType: 'item_completed',
            message: 'Item SKU-123 completado',
        );

        $payload = $event->toArray();

        $this->assertEquals('item_completed', $payload['event_type']);
        $this->assertEquals('ORD-TEST-003', $payload['order_number']);
        $this->assertEquals(8, $payload['warehouse_id']);
        $this->assertEquals('SKU-123', $payload['product_code']);
        $this->assertEquals(1, $payload['quantity_picked']);
        $this->assertEquals(5, $payload['total_items']);
        $this->assertEquals(2, $payload['picked_items']);
        $this->assertEquals(40.0, $payload['progress_percent']);
    }

    public function test_picking_progress_broadcast_event_rounds_progress_percent(): void
    {
        $event = new PickingProgressBroadcastEvent(
            orderNumber: 'ORD-TEST-003',
            warehouseId: 8,
            userId: 12,
            totalItems: 3,
            pickedItems: 1,
            progressPercent: 33.333333,
        );

        $payload = $event->toArray();

        $this->assertEquals(33.33, $payload['progress_percent']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // StockAlertBroadcastEvent
    // ─────────────────────────────────────────────────────────────────────────

    public function test_stock_alert_broadcast_event_broadcasts_to_correct_channels(): void
    {
        $event = new StockAlertBroadcastEvent(
            alertType: 'stock_mismatch',
            message: 'Stock discrepancy detected',
            warehouseId: 4,
            userId: 15,
            severity: 'high',
            productCode: 'SKU-456',
            orderNumber: 'ORD-TEST-004',
            expectedQty: 100,
            actualQty: 80,
        );

        $channels = $event->broadcastOn();

        $this->assertCount(2, $channels);
        $this->assertEquals('private-warehouse.4', $channels[0]->name);
        $this->assertEquals('private-user.15', $channels[1]->name);
    }

    public function test_stock_alert_broadcast_event_has_correct_broadcast_name(): void
    {
        $event = new StockAlertBroadcastEvent(
            alertType: 'stock_mismatch',
            message: 'Stock discrepancy detected',
            warehouseId: 4,
            userId: 15,
        );

        $this->assertEquals('stock.alert', $event->broadcastAs());
    }

    public function test_stock_alert_broadcast_event_returns_valid_payload(): void
    {
        $event = new StockAlertBroadcastEvent(
            alertType: 'stock_mismatch',
            message: 'Stock discrepancy detected',
            warehouseId: 4,
            userId: 15,
            severity: 'high',
            productCode: 'SKU-456',
            orderNumber: 'ORD-TEST-004',
            expectedQty: 100,
            actualQty: 80,
        );

        $payload = $event->toArray();

        $this->assertEquals('stock_alert', $payload['event_type']);
        $this->assertEquals('stock_mismatch', $payload['alert_type']);
        $this->assertEquals(4, $payload['warehouse_id']);
        $this->assertEquals(15, $payload['user_id']);
        $this->assertEquals('SKU-456', $payload['product_code']);
        $this->assertEquals('ORD-TEST-004', $payload['order_number']);
        $this->assertEquals(100, $payload['expected_qty']);
        $this->assertEquals(80, $payload['actual_qty']);
        $this->assertEquals('high', $payload['severity']);
    }

    public function test_stock_alert_broadcast_event_works_with_minimal_data(): void
    {
        $event = new StockAlertBroadcastEvent(
            alertType: 'out_of_stock',
            message: 'Product out of stock',
            warehouseId: 4,
            userId: 15,
        );

        $payload = $event->toArray();

        $this->assertEquals('stock_alert', $payload['event_type']);
        $this->assertEquals('out_of_stock', $payload['alert_type']);
        $this->assertNull($payload['product_code']);
        $this->assertNull($payload['order_number']);
        $this->assertNull($payload['expected_qty']);
        $this->assertNull($payload['actual_qty']);
        $this->assertEquals('medium', $payload['severity']); // default
    }
}
