<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = is_object($this->resource) ? (array) $this->resource : $this->resource;

        return [
            'id' => $data['id'] ?? null,
            'order_number' => $data['order_number'] ?? null,
            'customer' => $data['customer'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'warehouse' => $data['warehouse'] ?? null,
            'assigned_to' => $data['assigned_to'] ?? null,
            'total_items' => $data['total_items'] ?? 0,
            'picked_items' => $data['picked_items'] ?? 0,
            'completed_percentage' => $data['completed_percentage'] ?? 0.0,
            'delivery_type' => $data['delivery_type'] ?? null,
            'flexxus_created_at' => $data['flexxus_created_at'] ?? null,
            'started_at' => $data['started_at'] ?? null,
            'completed_at' => $data['completed_at'] ?? null,
            'items' => $data['items'] ?? [],
            'alerts' => $data['alerts'] ?? [],
            'events' => $data['events'] ?? [],
        ];
    }
}
