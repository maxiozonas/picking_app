<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PendingOrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $order = $this->resource;

        return [
            'order_number' => $order['order_number'] ?? null,
            'customer' => $order['customer'] ?? null,
            'total' => $order['total'] ?? 0,
            'warehouse' => [
                'id' => $order['warehouse']['id'] ?? null,
                'code' => $order['warehouse']['code'] ?? null,
                'name' => $order['warehouse']['name'] ?? null,
            ],
            'status' => $order['status'] ?? 'pending',
            'delivery_type' => $order['delivery_type'] ?? null,
            'flexxus_created_at' => $order['flexxus_created_at'] ?? null,
            'started_at' => $order['started_at'] ?? null,
            'completed_at' => $order['completed_at'] ?? null,
            'items_count' => $order['items_count'] ?? 0,
            'items_picked' => $order['items_picked'] ?? 0,
            'assigned_to' => $order['assigned_to'] ?? null,
        ];
    }
}
