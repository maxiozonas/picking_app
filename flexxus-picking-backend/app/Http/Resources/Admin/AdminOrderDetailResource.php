<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\PickingAlertResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
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
            'completed_percentage' => $this->calculateCompletedPercentage($progress),
            'started_at' => $progress->started_at?->toIso8601String(),
            'completed_at' => $progress->completed_at?->toIso8601String(),
            'created_at' => $progress->created_at?->toIso8601String(),
            'items' => AdminOrderItemResource::collection($progress->items ?? collect()),
            'alerts' => PickingAlertResource::collection($progress->alerts ?? collect()),
            'events' => ($progress->events ?? collect())->map(fn ($e) => [
                'id'           => $e->id,
                'event_type'   => $e->event_type,
                'product_code' => $e->product_code,
                'quantity'     => $e->quantity,
                'message'      => $e->message,
                'user'         => $e->relationLoaded('user')
                    ? ['id' => $e->user?->id, 'name' => $e->user?->name]
                    : null,
                'created_at'   => $e->created_at?->toIso8601String(),
            ])->values()->all(),
        ];
    }

    private function calculateCompletedPercentage($progress): float
    {
        $totalItems = $progress->items->count();

        if ($totalItems === 0) {
            return 0.0;
        }

        $pickedItems = $progress->items->where('status', 'completed')->count();

        return round(($pickedItems / $totalItems) * 100, 1);
    }
}
