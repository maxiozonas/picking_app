<?php

namespace App\Events\Broadcasting;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast event fired when an operative starts picking an order.
 *
 * @property string $orderNumber
 * @property int $warehouseId
 * @property int $userId
 * @property string $userName
 * @property string $message
 * @property string $eventType
 * @property string $timestamp
 */
final class OrderStartedBroadcastEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $orderNumber,
        public readonly int $warehouseId,
        public readonly int $userId,
        public readonly string $userName,
        public readonly string $message = 'Pedido iniciado',
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
            new PrivateChannel("order.{$this->orderNumber}"),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'order.started';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'event_type' => 'order_started',
            'order_number' => $this->orderNumber,
            'warehouse_id' => $this->warehouseId,
            'user_id' => $this->userId,
            'user_name' => $this->userName,
            'message' => $this->message,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
