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
    public function getAvailableOrders(int $userId, array $filters = [], array $requestContext = []): LengthAwarePaginator;

    /**
     * Get order detail with items and stock info
     */
    public function getOrderDetail(string $orderNumber, int $userId, array $requestContext = []): array;

    /**
     * Start preparing an order
     */
    public function startOrder(string $orderNumber, int $userId, array $requestContext = []): PickingOrderProgress;

    /**
     * Mark item quantity as picked
     */
    public function pickItem(string $orderNumber, string $productCode, int $quantity, int $userId, array $requestContext = []): array;

    /**
     * Complete an order
     */
    public function completeOrder(string $orderNumber, int $userId, array $requestContext = []): PickingOrderProgress;

    /**
     * Create an alert
     */
    public function createAlert(array $data, int $userId, array $requestContext = []): PickingAlert;

    /**
     * Get alerts for admin
     */
    public function getAlerts(array $filters = []): LengthAwarePaginator;

    /**
     * Resolve an alert
     */
    public function resolveAlert(int $alertId, int $resolverId, string $notes, array $requestContext = []): PickingAlert;

    /**
     * Get stock information for a specific item in an order
     */
    public function getStockForItem(string $orderNumber, string $productCode, int $userId, array $requestContext = []): ?array;
}
