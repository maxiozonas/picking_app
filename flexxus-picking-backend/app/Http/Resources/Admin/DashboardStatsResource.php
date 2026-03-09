<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardStatsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'total_orders' => $this->resource['total_orders'] ?? 0,
            'in_progress_count' => $this->resource['in_progress_count'] ?? 0,
            'completed_count' => $this->resource['completed_count'] ?? 0,
            'by_warehouse' => DashboardWarehouseStatsResource::collection(
                $this->resource['by_warehouse'] ?? collect()
            ),
        ];
    }
}
