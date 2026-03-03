<?php

namespace Tests\Unit\Models;

use App\Models\PickingItemProgress;
use App\Models\PickingOrderProgress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PickingItemProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_picking_item_belongs_to_order(): void
    {
        $order = PickingOrderProgress::factory()->create();
        $item = PickingItemProgress::factory()->create([
            'order_number' => $order->order_number,
        ]);

        $this->assertInstanceOf(PickingOrderProgress::class, $item->order);
        $this->assertEquals($order->order_number, $item->order->order_number);
    }

    public function test_quantity_remaining_returns_difference(): void
    {
        $item = PickingItemProgress::factory()->create([
            'quantity_required' => 10,
            'quantity_picked' => 3,
        ]);

        $this->assertEquals(7, $item->quantity_remaining);
    }

    public function test_quantity_remaining_zero_when_fully_picked(): void
    {
        $item = PickingItemProgress::factory()->create([
            'quantity_required' => 10,
            'quantity_picked' => 10,
        ]);

        $this->assertEquals(0, $item->quantity_remaining);
    }

    public function test_is_completed_returns_true_when_fully_picked(): void
    {
        $item = PickingItemProgress::factory()->create([
            'quantity_required' => 10,
            'quantity_picked' => 10,
        ]);

        $this->assertTrue($item->is_completed);
    }

    public function test_is_completed_returns_true_when_over_picked(): void
    {
        $item = PickingItemProgress::factory()->create([
            'quantity_required' => 10,
            'quantity_picked' => 12,
        ]);

        $this->assertTrue($item->is_completed);
    }

    public function test_is_completed_returns_false_when_partially_picked(): void
    {
        $item = PickingItemProgress::factory()->create([
            'quantity_required' => 10,
            'quantity_picked' => 5,
        ]);

        $this->assertFalse($item->is_completed);
    }

    public function test_is_completed_returns_false_when_not_picked(): void
    {
        $item = PickingItemProgress::factory()->create([
            'quantity_required' => 10,
            'quantity_picked' => 0,
        ]);

        $this->assertFalse($item->is_completed);
    }

    public function test_completed_at_is_cast_to_datetime(): void
    {
        $item = PickingItemProgress::factory()->create([
            'completed_at' => '2024-03-03 10:00:00',
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $item->completed_at);
        $this->assertEquals('2024-03-03 10:00:00', $item->completed_at->format('Y-m-d H:i:s'));
    }
}
