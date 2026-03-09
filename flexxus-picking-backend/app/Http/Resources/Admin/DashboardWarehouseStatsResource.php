<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardWarehouseStatsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'warehouse_id' => $this->resource['warehouse_id'] ?? null,
            'warehouse_code' => $this->resource['warehouse_code'] ?? null,
            'warehouse_name' => $this->resource['warehouse_name'] ?? null,
            'total_orders' => $this->resource['total_orders'] ?? 0,
            'in_progress_count' => $this->resource['in_progress_count'] ?? 0,
            'completed_count' => $this->resource['completed_count'] ?? 0,
        ];
    }
}
