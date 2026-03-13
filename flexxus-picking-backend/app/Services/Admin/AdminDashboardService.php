<?php

namespace App\Services\Admin;

use App\Models\PickingOrderProgress;
use App\Models\Warehouse;
use App\Services\Admin\Interfaces\AdminDashboardServiceInterface;

class AdminDashboardService implements AdminDashboardServiceInterface
{
    public function getStats(array $filters = []): array
    {
        $query = PickingOrderProgress::query();

        if (isset($filters['warehouse_id'])) {
            $query->byWarehouse($filters['warehouse_id']);
        }

        $query->dateRange(
            $filters['date_from'] ?? null,
            $filters['date_to'] ?? null
        );

        $totals = (clone $query)
            ->selectRaw("
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
            ")
            ->first();

        $byWarehouseRaw = (clone $query)
            ->selectRaw("
                warehouse_id,
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
            ")
            ->groupBy('warehouse_id')
            ->get();

        $warehouseIds = $byWarehouseRaw->pluck('warehouse_id')->filter()->unique()->values()->all();
        $warehouses = Warehouse::whereIn('id', $warehouseIds)->get()->keyBy('id');

        $byWarehouse = $byWarehouseRaw->map(function ($row) use ($warehouses) {
            $warehouse = $warehouses->get($row->warehouse_id);

            return [
                'warehouse_id' => $row->warehouse_id,
                'warehouse_code' => $warehouse?->code,
                'warehouse_name' => $warehouse?->name,
                'total_orders' => (int) $row->total_orders,
                'in_progress_count' => (int) $row->in_progress_count,
                'completed_count' => (int) $row->completed_count,
            ];
        })->values();

        return [
            'total_orders' => (int) ($totals->total_orders ?? 0),
            'in_progress_count' => (int) ($totals->in_progress_count ?? 0),
            'completed_count' => (int) ($totals->completed_count ?? 0),
            'by_warehouse' => $byWarehouse,
        ];
    }
}
