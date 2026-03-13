<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\DashboardStatsResource;
use App\Services\Admin\Interfaces\AdminDashboardServiceInterface;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function __construct(
        private AdminDashboardServiceInterface $dashboardService
    ) {}

    public function stats(Request $request): DashboardStatsResource
    {
        $filters = array_filter([
            'warehouse_id' => $request->integer('warehouse_id') ?: null,
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
        ], fn ($value) => $value !== null);

        $stats = $this->dashboardService->getStats($filters);

        return new DashboardStatsResource($stats);
    }
}
