<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PickingOrderDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = $this->resource;
        $assignedTo = $data['assigned_to'] ?? null;
        $startedAt = $data['started_at'] ?? null;

        return [
            'order_type' => $data['order_type'] ?? 'NP',
            'order_number' => $data['order_number'] ?? null,
            'customer_name' => $data['customer_name'] ?? null,
            'warehouse' => $data['warehouse'] ?? null,
            'total' => $data['total'] ?? 0,
            'status' => $data['status'] ?? 'pending',
            'total_items' => $data['total_items'] ?? 0,
            'picked_items' => $data['picked_items'] ?? 0,
            'completed_percentage' => $data['completed_percentage'] ?? 0,
            'started_at' => $startedAt,
            'completed_at' => $data['completed_at'] ?? null,
            'assigned_to' => $assignedTo ?? [
                'id' => null,
                'name' => null,
            ],
            'items' => PickingOrderItemResource::collection($data['items'] ?? collect()),
            'alerts' => PickingAlertResource::collection(collect($data['alerts'] ?? [])),
            'events' => $data['events'] ?? [],
        ];
    }
}
