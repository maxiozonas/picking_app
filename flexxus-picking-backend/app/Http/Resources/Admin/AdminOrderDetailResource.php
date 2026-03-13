<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\PickingAlertResource;
use App\Models\PickingOrderProgress;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        if ($this->resource instanceof PickingOrderProgress) {
            return $this->transformModel();
        }

        return $this->transformFlexxusData();
    }

    private function transformModel(): array
    {
        $progress = $this->resource;

        return [
            'id' => $progress->id,
            'order_number' => $progress->order_number,
            'customer' => $progress->customer ?? null,
            'status' => $progress->status,
            'warehouse' => [
                'id' => $progress->warehouse?->id,
                'code' => $progress->warehouse?->code,
                'name' => $progress->warehouse?->name,
            ],
            'assigned_to' => [
                'id' => $progress->user?->id,
                'name' => $progress->user?->name,
            ],
            'total_items' => $progress->items_count ?? $progress->items->count(),
            'picked_items' => $progress->items->where('status', 'completed')->count(),
            'completed_percentage' => $progress->completed_percentage,
            'started_at' => $progress->started_at?->toIso8601String(),
            'completed_at' => $progress->completed_at?->toIso8601String(),
            'created_at' => $progress->created_at?->toIso8601String(),
            'items' => AdminOrderItemResource::collection($progress->items ?? collect()),
            'alerts' => PickingAlertResource::collection($progress->alerts ?? collect()),
            'events' => ($progress->events ?? collect())->map(fn ($e) => [
                'id' => $e->id,
                'event_type' => $e->event_type,
                'product_code' => $e->product_code,
                'quantity' => $e->quantity,
                'message' => $e->message,
                'user' => $e->relationLoaded('user')
                    ? ['id' => $e->user?->id, 'name' => $e->user?->name]
                    : null,
                'created_at' => $e->created_at?->toIso8601String(),
            ])->values()->all(),
        ];
    }

    private function transformFlexxusData(): array
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
            'started_at' => $data['started_at'] ?? null,
            'completed_at' => $data['completed_at'] ?? null,
            'created_at' => $data['created_at'] ?? null,
            'items' => $data['items'] ?? [],
            'alerts' => $data['alerts'] ?? [],
            'events' => $data['events'] ?? [],
        ];
    }
}
