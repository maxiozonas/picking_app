<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\DashboardStatsResource;
use App\Models\PickingOrderProgress;
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

        // Get statistics
        $totalOrders = (clone $query)->count();
        $inProgressCount = (clone $query)->inProgress()->count();
        $completedCount = (clone $query)->completed()->count();

        // Get statistics grouped by warehouse
        $warehouseQuery = PickingOrderProgress::query();

        if ($request->has('warehouse_id')) {
            $warehouseQuery->byWarehouse($request->input('warehouse_id'));
        }

        $warehouseQuery->dateRange(
            $request->input('date_from'),
            $request->input('date_to')
        );

        $byWarehouse = $warehouseQuery
            ->with('warehouse')
            ->get()
            ->groupBy('warehouse_id')
            ->map(function ($orders) {
                $warehouse = $orders->first()->warehouse;

                return [
                    'warehouse_id' => $warehouse?->id,
                    'warehouse_code' => $warehouse?->code,
                    'warehouse_name' => $warehouse?->name,
                    'total_orders' => $orders->count(),
                    'in_progress_count' => $orders->where('status', 'in_progress')->count(),
                    'completed_count' => $orders->where('status', 'completed')->count(),
                ];
            })
            ->values();

        $stats = [
            'total_orders' => $totalOrders,
            'in_progress_count' => $inProgressCount,
            'completed_count' => $completedCount,
            'by_warehouse' => $byWarehouse,
        ];

        return new DashboardStatsResource($stats);
    }
}
