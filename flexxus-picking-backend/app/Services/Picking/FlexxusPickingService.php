<?php

namespace App\Services\Picking;

use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusOrderServiceInterface;
use App\Services\Picking\Interfaces\FlexxusProductServiceInterface;

/**
 * Backward-compatible delegator.
 *
 * New code should inject the specific interfaces instead:
 * - FlexxusOrderServiceInterface  (orders)
 * - FlexxusProductServiceInterface (stock)
 * - FlexxusDataFormatter (formatting)
 */
class FlexxusPickingService
{
    private FlexxusOrderServiceInterface $orderService;

    private FlexxusProductServiceInterface $productService;

    private FlexxusDataFormatter $formatter;

    public function __construct(
        FlexxusOrderServiceInterface $orderService,
        FlexxusProductServiceInterface $productService,
        FlexxusDataFormatter $formatter
    ) {
        $this->orderService = $orderService;
        $this->productService = $productService;
        $this->formatter = $formatter;
    }

    public function getOrdersByDateAndWarehouse(string $date, Warehouse $warehouse): array
    {
        return $this->orderService->getOrdersByDateAndWarehouse($date, $warehouse);
    }

    public function getOrderDetail(string $orderNumber, Warehouse $warehouse): array
    {
        return $this->orderService->getOrderDetail($orderNumber, $warehouse);
    }

    public function getProductStock(string $productCode, Warehouse $warehouse): ?array
    {
        return $this->productService->getProductStock($productCode, $warehouse);
    }

    public function formatOrderForList(array $flexxusOrder): array
    {
        return $this->formatter->formatOrderForList($flexxusOrder);
    }

    public function formatOrderItem(array $item, ?array $stockInfo): array
    {
        return $this->formatter->formatOrderItem($item, $stockInfo);
    }
}
