<?php

namespace App\Services\Picking\Interfaces;

use Illuminate\Pagination\LengthAwarePaginator;

interface AdminPickingServiceInterface
{
    /**
     * Get all orders from Flexxus that haven't been started yet
     *
     * @param  array  $filters  {
     *
     * @type int $warehouse_id REQUIRED Filter by warehouse ID
     * @type string|null $date_from Start date (Y-m-d)
     * @type string|null $date_to End date (Y-m-d)
     * @type string|null $search Search in order_number or customer
     * @type string|null $status Filter by status (default: 'pending')
     * @type int $per_page Items per page (default: 15)
     * @type int $page Page number (default: 1)
     *           }
     *
     * @return LengthAwarePaginator Paginated pending orders
     */
    public function getPendingOrders(array $filters = []): LengthAwarePaginator;

    /**
     * Force refresh pending orders from Flexxus (clears cache)
     *
     * @param  array  $filters  {
     *
     * @type int $warehouse_id REQUIRED Warehouse to refresh
     * @type string|null $date_from Date to refresh
     *                   }
     *
     * @return LengthAwarePaginator Fresh pending orders
     */
    public function refreshPendingOrders(array $filters = []): LengthAwarePaginator;

    /**
     * Get pending order counts for dashboard statistics
     *
     * @param  array  $filters  {
     *
     * @type int|null $warehouse_id Filter by warehouse ID
     * @type string|null $date_from Start date
     * @type string|null $date_to End date
     *                   }
     *
     * @return array {
     *
     * @type int $total Total pending orders
     * @type array $by_warehouse Breakdown by warehouse ID
     *             }
     */
    public function getPendingCounts(array $filters = []): array;

    /**
     * Get the full detail of a pending (unstarted) order from Flexxus.
     * Returns null if not found in any active warehouse.
     */
    public function getPendingOrderDetail(string $orderNumber): ?array;

    /**
     * Get unique product codes from pending Flexxus orders.
     * Returns a collection of ['product_code' => string, 'description' => string].
     */
    public function getPendingOrderItems(array $filters = []): \Illuminate\Support\Collection;
}
