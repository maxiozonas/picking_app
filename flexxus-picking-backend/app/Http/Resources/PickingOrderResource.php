<?php

namespace App\Http\Resources;

use App\Models\PickingOrderProgress;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PickingOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isModel = $this->resource instanceof PickingOrderProgress;

        if ($isModel) {
            return $this->transformModel();
        }

        return $this->transformArray();
    }

    private function transformModel(): array
    {
        $progress = $this->resource;

        try {
            $parsed = \App\Services\Picking\OrderNumberParser::parse($progress->order_number);
            $orderType = $parsed['order_type'];
            $orderNumber = $parsed['order_number'];
        } catch (\InvalidArgumentException $e) {
            $orderType = $progress->order_type ?? 'NP';
            $orderNumber = $progress->order_number;
        }

        return [
            'order_type' => $orderType,
            'order_number' => $orderNumber,
            'customer' => null,
            'status' => $progress->status,
            'assigned_to' => $progress->user ? [
                'id' => $progress->user->id,
                'name' => $progress->user->name,
            ] : [
                'id' => null,
                'name' => null,
            ],
            'items_count' => $progress->items->count(),
            'items_picked' => $progress->items->where('status', 'completed')->count(),
            'created_at' => $progress->created_at?->toIso8601String(),
            'started_at' => $progress->started_at?->toIso8601String() ?? '',
            'warehouse' => [
                'id' => $progress->warehouse?->id,
                'code' => $progress->warehouse?->code,
                'name' => $progress->warehouse?->name,
            ],
            'total' => null,
            'delivery_type' => null,
        ];
    }

    private function transformArray(): array
    {
        $assignedTo = $this->resource['assigned_to'] ?? null;
        $startedAt = $this->resource['started_at'] ?? '';

        return [
            'order_type' => $this->resource['order_type'] ?? 'NP',
            'order_number' => $this->resource['order_number'] ?? null,
            'customer' => $this->resource['customer'] ?? null,
            'status' => $this->resource['status'] ?? 'pending',
            'assigned_to' => $assignedTo ?? [
                'id' => null,
                'name' => null,
            ],
            'items_count' => $this->resource['items_count'] ?? 0,
            'items_picked' => $this->resource['items_picked'] ?? 0,
            'created_at' => $this->resource['created_at'] ?? null,
            'started_at' => $startedAt,
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
