<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PickingOrderDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = $this->resource;

        return [
            'order_number' => $data['order_number'] ?? null,
            'customer_name' => $data['customer_name'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'total_items' => $data['total_items'] ?? 0,
            'picked_items' => $data['picked_items'] ?? 0,
            'completed_percentage' => $data['completed_percentage'] ?? 0,
            'started_at' => $data['started_at'] ?? null,
            'completed_at' => $data['completed_at'] ?? null,
            'items' => PickingOrderItemResource::collection($data['items'] ?? collect()),
        ];
    }
}
