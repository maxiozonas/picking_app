<?php

namespace App\Events\Broadcasting;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast event fired when an item is picked or progress changes on an order.
 *
 * This event covers both single-item picks and periodic progress updates,
 * providing real-time feedback to admin and operative dashboards.
 *
 * @property string $orderNumber
 * @property int $warehouseId
 * @property int $userId
 * @property string $productCode
 * @property int $quantityPicked
 * @property int $totalItems
 * @property int $pickedItems
 * @property float $progressPercent
 * @property string|null $eventType
 * @property string|null $message
 * @property string $timestamp
 */
final class PickingProgressBroadcastEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $orderNumber,
        public readonly int $warehouseId,
        public readonly int $userId,
        public readonly int $totalItems,
        public readonly int $pickedItems,
        public readonly float $progressPercent,
        public readonly ?string $productCode = null,
        public readonly ?int $quantityPicked = null,
        public readonly ?string $eventType = null,
        public readonly ?string $message = null,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Broadcasting\PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("order.{$this->orderNumber}"),
            new PrivateChannel("warehouse.{$this->warehouseId}"),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'picking.progress';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'event_type' => $this->eventType ?? 'picking_progress',
            'order_number' => $this->orderNumber,
            'warehouse_id' => $this->warehouseId,
            'user_id' => $this->userId,
            'product_code' => $this->productCode,
            'quantity_picked' => $this->quantityPicked,
            'total_items' => $this->totalItems,
            'picked_items' => $this->pickedItems,
            'progress_percent' => round($this->progressPercent, 2),
            'message' => $this->message,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
