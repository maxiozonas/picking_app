<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderResource extends JsonResource
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
            'items_count' => $progress->items_count ?? 0,
            'items_picked' => $progress->items_picked ?? $progress->items->where('status', 'completed')->count(),
            'started_at' => $progress->started_at?->toIso8601String(),
            'completed_at' => $progress->completed_at?->toIso8601String(),
            'created_at' => $progress->created_at?->toIso8601String(),
        ];
    }
}
