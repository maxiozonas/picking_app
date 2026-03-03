<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PickingOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'order_number' => $this->resource['order_number'] ?? null,
            'customer' => $this->resource['customer'] ?? null,
            'status' => $this->resource['status'] ?? 'pending',
            'assigned_to' => $this->resource['assigned_to'] ?? null,
            'items_count' => $this->resource['items_count'] ?? 0,
            'items_picked' => $this->resource['items_picked'] ?? 0,
            'created_at' => $this->resource['created_at'] ?? null,
            'started_at' => $this->resource['started_at'] ?? null,
            'warehouse' => [
                'id' => $this->resource['warehouse']['id'] ?? null,
                'code' => $this->resource['warehouse']['code'] ?? null,
                'name' => $this->resource['warehouse']['name'] ?? null,
            ],
            'total' => $this->resource['total'] ?? 0,
            'delivery_type' => $this->resource['delivery_type'] ?? null,
        ];
    }
}
