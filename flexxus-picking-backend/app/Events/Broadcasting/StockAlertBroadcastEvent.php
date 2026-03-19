<?php

namespace App\Events\Broadcasting;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast event fired when a stock alert is created.
 *
 * Notifies warehouse users and the specific operative who created the alert.
 *
 * @property string $alertType
 * @property string $message
 * @property int $warehouseId
 * @property int $userId
 * @property string|null $productCode
 * @property string|null $orderNumber
 * @property int|null $expectedQty
 * @property int|null $actualQty
 * @property string $severity
 * @property string $eventType
 * @property string $timestamp
 */
final class StockAlertBroadcastEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $alertType,
        public readonly string $message,
        public readonly int $warehouseId,
        public readonly int $userId,
        public readonly string $severity = 'medium',
        public readonly ?string $productCode = null,
        public readonly ?string $orderNumber = null,
        public readonly ?int $expectedQty = null,
        public readonly ?int $actualQty = null,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Broadcasting\PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("warehouse.{$this->warehouseId}"),
            new PrivateChannel("user.{$this->userId}"),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'stock.alert';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'event_type' => 'stock_alert',
            'alert_type' => $this->alertType,
            'warehouse_id' => $this->warehouseId,
            'user_id' => $this->userId,
            'product_code' => $this->productCode,
            'order_number' => $this->orderNumber,
            'expected_qty' => $this->expectedQty,
            'actual_qty' => $this->actualQty,
            'severity' => $this->severity,
            'message' => $this->message,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
