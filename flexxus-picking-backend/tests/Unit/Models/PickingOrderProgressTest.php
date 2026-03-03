<?php

namespace Tests\Unit\Models;

use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PickingOrderProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_picking_order_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $warehouse = Warehouse::factory()->create();
        $order = PickingOrderProgress::factory()->create([
            'user_id' => $user->id,
            'warehouse_id' => $warehouse->id,
        ]);

        $this->assertInstanceOf(User::class, $order->user);
        $this->assertEquals($user->id, $order->user->id);
    }

    public function test_picking_order_belongs_to_warehouse(): void
    {
        $warehouse = Warehouse::factory()->create();
        $order = PickingOrderProgress::factory()->create([
            'warehouse_id' => $warehouse->id,
        ]);

        $this->assertInstanceOf(Warehouse::class, $order->warehouse);
        $this->assertEquals($warehouse->id, $order->warehouse->id);
    }

    public function test_picking_order_has_many_items(): void
    {
        $this->markTestIncomplete(
            'PickingItemProgress model does not exist yet. Will be tested in Task 7.'
        );

        $order = PickingOrderProgress::factory()
            ->hasItems(3)
            ->create();

        $this->assertCount(3, $order->items);
        $this->assertEquals($order->order_number, $order->items->first()->order_number);
    }

    public function test_picking_order_has_many_alerts(): void
    {
        $this->markTestIncomplete(
            'PickingAlert model does not exist yet. Will be tested in Task 7.'
        );

        $order = PickingOrderProgress::factory()
            ->hasAlerts(2)
            ->create();

        $this->assertCount(2, $order->alerts);
        $this->assertEquals($order->order_number, $order->alerts->first()->order_number);
    }

    public function test_scope_pending_filters_only_pending_orders(): void
    {
        PickingOrderProgress::factory()->create(['status' => 'pending']);
        PickingOrderProgress::factory()->create(['status' => 'in_progress']);
        PickingOrderProgress::factory()->create(['status' => 'completed']);

        $pendingOrders = PickingOrderProgress::pending()->get();

        $this->assertCount(1, $pendingOrders);
        $this->assertEquals('pending', $pendingOrders->first()->status);
    }
}
