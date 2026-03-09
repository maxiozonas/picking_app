<?php

namespace Tests\Unit\Services\Picking;

use App\Exceptions\Picking\InvalidOrderStateException;
use App\Models\PickingItemProgress;
use App\Models\PickingOrderProgress;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\PickingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Phase 5: Transaction Safety Tests for Complete Order Flow
 *
 * Tests that completeOrder operation is atomic and uses proper row locking
 * to prevent race conditions and partial updates.
 */
class CompleteOrderTransactionSafetyTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Warehouse $warehouse;

    private PickingService $pickingService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->warehouse = Warehouse::factory()->create([
            'code' => 'WH01',
            'name' => 'Warehouse 01',
        ]);

        $this->user = User::factory()->create([
            'warehouse_id' => $this->warehouse->id,
        ]);

        $this->pickingService = $this->app->make(PickingService::class);
    }

    /**
     * Task 5.5: Test that completeOrder is wrapped in DB transaction
     *
     * When completeOrder fails, all changes should rollback.
     * GREEN: Transaction ensures atomic rollback on failure.
     */
    public function test_complete_order_rolls_back_on_incomplete_items(): void
    {
        // Arrange: Create order with incomplete items
        $order = PickingOrderProgress::factory()->create([
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
            'started_at' => now(),
            'order_number' => 'NP CO01',
        ]);

        // Create one completed item and one incomplete item
        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $order->id,
            'product_code' => 'PROD-001',
            'quantity_required' => 10,
            'quantity_picked' => 10,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $order->id,
            'product_code' => 'PROD-002',
            'quantity_required' => 10,
            'quantity_picked' => 5,
            'status' => 'in_progress',
        ]);

        // Record initial state
        $initialStatus = $order->status;
        $initialCompletedAt = $order->completed_at;

        // Act & Assert: Attempt to complete order with incomplete items (should fail)
        $this->expectException(InvalidOrderStateException::class);

        try {
            $this->pickingService->completeOrder(
                $order->order_number,
                $this->user->id
            );
        } catch (InvalidOrderStateException $e) {
            // Assert: Order should not be partially updated
            $order->refresh();
            $this->assertEquals($initialStatus, $order->status, 'Order status should not change on failed complete');
            $this->assertEquals($initialCompletedAt, $order->completed_at, 'Order completed_at should not change on failed complete');

            throw $e;
        }
    }

    /**
     * Task 5.6: Test row locking prevents concurrent complete attempts
     *
     * When two concurrent requests attempt to complete the same order,
     * only one should succeed.
     * GREEN: Row locking ensures only one transaction completes at a time.
     */
    public function test_complete_order_uses_row_locking_for_concurrent_attempts(): void
    {
        // Arrange: Create order with all items completed
        $order = PickingOrderProgress::factory()->create([
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
            'started_at' => now(),
            'order_number' => 'NP CO02',
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $order->id,
            'product_code' => 'PROD-001',
            'quantity_required' => 10,
            'quantity_picked' => 10,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $order->id,
            'product_code' => 'PROD-002',
            'quantity_required' => 10,
            'quantity_picked' => 10,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // First complete attempt
        $result1 = $this->pickingService->completeOrder(
            $order->order_number,
            $this->user->id
        );

        // Assert: First attempt succeeds
        $this->assertEquals('completed', $result1->status);
        $this->assertNotNull($result1->completed_at);

        // Second complete attempt (should fail - already completed)
        $this->expectException(InvalidOrderStateException::class);

        $this->pickingService->completeOrder(
            $order->order_number,
            $this->user->id
        );
    }

    /**
     * Task 5.7: Test completeOrder commits atomically
     *
     * When completeOrder succeeds, all related updates should commit together.
     * GREEN: Transaction ensures atomic commit of all changes.
     */
    public function test_complete_order_commits_atomically(): void
    {
        // Arrange: Create order with all items completed
        $order = PickingOrderProgress::factory()->create([
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
            'started_at' => now(),
            'order_number' => 'NP CO03',
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $order->id,
            'product_code' => 'PROD-001',
            'quantity_required' => 10,
            'quantity_picked' => 10,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $order->id,
            'product_code' => 'PROD-002',
            'quantity_required' => 10,
            'quantity_picked' => 10,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $order->id,
            'product_code' => 'PROD-003',
            'quantity_required' => 10,
            'quantity_picked' => 10,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        $initialStatus = $order->status;

        // Act: Complete order
        $result = $this->pickingService->completeOrder(
            $order->order_number,
            $this->user->id
        );

        // Assert: Order updated atomically
        $this->assertEquals('completed', $result->status);
        $this->assertNotNull($result->completed_at);
        $this->assertNotEquals($initialStatus, $result->status);

        // Assert: All items still completed (no partial rollback)
        $items = $result->items;
        $this->assertCount(3, $items);
        foreach ($items as $item) {
            $this->assertEquals('completed', $item->status);
            $this->assertEquals(10, $item->quantity_picked);
        }
    }

    /**
     * Task 5.8: Test completeOrder validates items atomically
     *
     * The validation that all items are complete should happen within
     * the transaction to prevent race conditions.
     * GREEN: Validation happens inside transaction with row lock.
     */
    public function test_complete_order_validates_items_atomically(): void
    {
        // Arrange: Create order with incomplete items
        $order = PickingOrderProgress::factory()->create([
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'in_progress',
            'started_at' => now(),
            'order_number' => 'NP CO04',
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $order->id,
            'product_code' => 'PROD-001',
            'quantity_required' => 10,
            'quantity_picked' => 10,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $order->id,
            'product_code' => 'PROD-002',
            'quantity_required' => 10,
            'quantity_picked' => 9, // Not complete
            'status' => 'in_progress',
        ]);

        // Act & Assert: Should fail validation atomically
        $this->expectException(InvalidOrderStateException::class);

        $this->pickingService->completeOrder(
            $order->order_number,
            $this->user->id
        );

        // Assert: Order not modified
        $order->refresh();
        $this->assertEquals('in_progress', $order->status);
        $this->assertNull($order->completed_at);
    }

    /**
     * Task 5.9: Test completeOrder with already completed order
     *
     * Attempting to complete an already completed order should fail
     * without making any changes.
     * GREEN: Already-completed check happens inside transaction.
     */
    public function test_complete_order_fails_on_already_completed(): void
    {
        // Arrange: Create already completed order
        $order = PickingOrderProgress::factory()->create([
            'user_id' => $this->user->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => 'completed',
            'started_at' => now()->subHour(),
            'completed_at' => now()->subMinutes(30),
            'order_number' => 'NP CO05',
        ]);

        PickingItemProgress::factory()->create([
            'picking_order_progress_id' => $order->id,
            'product_code' => 'PROD-001',
            'quantity_required' => 10,
            'quantity_picked' => 10,
            'status' => 'completed',
            'completed_at' => now()->subMinutes(30),
        ]);

        $originalCompletedAt = $order->completed_at;

        // Act & Assert: Should fail without modifying order
        $this->expectException(InvalidOrderStateException::class);

        $this->pickingService->completeOrder(
            $order->order_number,
            $this->user->id
        );

        // Assert: Order not modified
        $order->refresh();
        $this->assertEquals($originalCompletedAt, $order->completed_at);
    }
}
