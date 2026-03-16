<?php

namespace App\Services\Picking\Interfaces;

use App\Models\Warehouse;

interface FlexxusOrderServiceInterface
{
    /**
     * Get expedition orders from Flexxus for a specific date and warehouse.
     *
     * @return array List of expedition orders with delivery info
     */
    public function getOrdersByDateAndWarehouse(string $date, Warehouse $warehouse, bool $forceRefresh = false): array;

    /**
     * Get order detail from Flexxus.
     *
     * @return array Order detail including DETALLE items
     */
    public function getOrderDetail(string $orderNumber, Warehouse $warehouse): array;

    /**
     * Resolve delivery metadata for an order.
     *
     * @return array{delivery_type: string|null}|null
     */
    public function getOrderDeliveryMetadata(string $orderNumber, Warehouse $warehouse): ?array;
}
