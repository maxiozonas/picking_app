<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\DashboardStatsResource;
use App\Models\PickingOrderProgress;
use App\Models\Warehouse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * Get dashboard statistics.
     */
    public function stats(Request $request): DashboardStatsResource
    {
        $query = PickingOrderProgress::query();

        // Apply warehouse filter if provided
        if ($request->has('warehouse_id')) {
            $query->byWarehouse($request->input('warehouse_id'));
        }

        // Apply date range filter if provided
        $query->dateRange(
            $request->input('date_from'),
            $request->input('date_to')
        );

        // Get totals using a single aggregated query
        $totals = (clone $query)
            ->selectRaw("
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
            ")
            ->first();

        // Get per-warehouse breakdown using GROUP BY SQL — avoids loading all rows into memory
        $byWarehouseRaw = (clone $query)
            ->selectRaw("
                warehouse_id,
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
            ")
            ->groupBy('warehouse_id')
            ->get();

        // Fetch warehouse details in a single query
        $warehouseIds = $byWarehouseRaw->pluck('warehouse_id')->filter()->unique()->values()->all();
        $warehouses = Warehouse::whereIn('id', $warehouseIds)->get()->keyBy('id');

        $byWarehouse = $byWarehouseRaw->map(function ($row) use ($warehouses) {
            $warehouse = $warehouses->get($row->warehouse_id);

            return [
                'warehouse_id'       => $row->warehouse_id,
                'warehouse_code'     => $warehouse?->code,
                'warehouse_name'     => $warehouse?->name,
                'total_orders'       => (int) $row->total_orders,
                'in_progress_count'  => (int) $row->in_progress_count,
                'completed_count'    => (int) $row->completed_count,
            ];
        })->values();

        $stats = [
            'total_orders'      => (int) ($totals->total_orders ?? 0),
            'in_progress_count' => (int) ($totals->in_progress_count ?? 0),
            'completed_count'   => (int) ($totals->completed_count ?? 0),
            'by_warehouse'      => $byWarehouse,
        ];

        return new DashboardStatsResource($stats);
    }
}
