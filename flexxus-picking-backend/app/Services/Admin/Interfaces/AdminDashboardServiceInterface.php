<?php

namespace App\Services\Admin\Interfaces;

interface AdminDashboardServiceInterface
{
    /**
     * Get dashboard statistics with optional warehouse and date range filters.
     *
     * @param  array{warehouse_id?: int, date_from?: string, date_to?: string}  $filters
     * @return array{total_orders: int, in_progress_count: int, completed_count: int, by_warehouse: array}
     */
    public function getStats(array $filters = []): array;
}
