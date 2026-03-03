<?php

namespace App\Services\Picking;

use App\Models\PickingAlert;
use App\Models\PickingOrderProgress;
use Illuminate\Pagination\LengthAwarePaginator;

interface PickingServiceInterface
{
    /**
     * Get available picking orders for the user (today only, EXPEDICION type)
     */
    public function getAvailableOrders(int $userId, array $filters = []): LengthAwarePaginator;

    /**
     * Get order detail with items and stock info
     */
    public function getOrderDetail(string $orderNumber, int $userId): array;

    /**
     * Start preparing an order
     */
    public function startOrder(string $orderNumber, int $userId): PickingOrderProgress;

    /**
     * Mark item quantity as picked
     */
    public function pickItem(string $orderNumber, string $productCode, int $quantity, int $userId): array;

    /**
     * Complete an order
     */
    public function completeOrder(string $orderNumber, int $userId): PickingOrderProgress;

    /**
     * Create an alert
     */
    public function createAlert(array $data, int $userId): PickingAlert;

    /**
     * Get alerts for admin
     */
    public function getAlerts(array $filters = []): LengthAwarePaginator;

    /**
     * Resolve an alert
     */
    public function resolveAlert(int $alertId, int $resolverId, string $notes): PickingAlert;
}
