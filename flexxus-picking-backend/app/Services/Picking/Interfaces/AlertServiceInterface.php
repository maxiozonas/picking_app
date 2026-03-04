<?php

namespace App\Services\Picking\Interfaces;

use App\Models\PickingAlert;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Alert Service Interface
 *
 * Defines contract for managing picking alerts and discrepancies.
 * Handles creation, resolution, and notification of stock-related issues.
 */
interface AlertServiceInterface
{
    /**
     * Create a new alert for a picking order
     *
     * @param  array  $data  Alert data ['order_number', 'alert_type', 'severity', 'message', 'context']
     * @param  User  $reporter  User reporting the alert
     * @return PickingAlert Created alert
     */
    public function createAlert(array $data, User $reporter): PickingAlert;

    /**
     * Resolve an alert
     *
     * @param  int  $alertId  Alert ID
     * @param  User  $resolver  User resolving the alert
     * @param  string|null  $resolutionNote  Optional resolution notes
     * @return PickingAlert Updated alert
     */
    public function resolveAlert(int $alertId, User $resolver, ?string $resolutionNote = null): PickingAlert;

    /**
     * Get alerts for an order
     *
     * @param  string  $orderNumber  Order number
     * @return array Array of PickingAlert
     */
    public function getAlertsForOrder(string $orderNumber): array;

    /**
     * Get paginated alerts with filters
     *
     * @param  User  $user  User making the request
     * @param  array  $filters  Filters ['warehouse_id', 'is_resolved', 'severity', 'alert_type']
     * @param  int  $perPage  Items per page
     * @return LengthAwarePaginator Paginated alerts
     */
    public function getPaginatedAlerts(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get unresolved high-priority alerts
     *
     * @param  int  $warehouseId  Warehouse ID
     * @return array Array of unresolved high-severity alerts
     */
    public function getHighPriorityAlerts(int $warehouseId): array;

    /**
     * Check if order has unresolved critical alerts
     *
     * @param  string  $orderNumber  Order number
     * @return bool True if has unresolved critical alerts
     */
    public function hasCriticalAlerts(string $orderNumber): bool;

    /**
     * Auto-create alert from validation failure
     *
     * @param  string  $orderNumber  Order number
     * @param  string  $itemCode  Item code
     * @param  string  $reason  Reason for alert (e.g., 'stock_insufficient', 'over_pick_attempt')
     * @param  array  $context  Additional context
     * @param  int|null  $userId  User ID (null for system-generated)
     * @return PickingAlert Created alert
     */
    public function createValidationAlert(string $orderNumber, string $itemCode, string $reason, array $context, ?int $userId = null): PickingAlert;
}
