<?php

namespace App\Services\Picking\Interfaces;

use App\Models\Warehouse;

interface FlexxusProductServiceInterface
{
    /**
     * Get stock information for a product in a specific warehouse.
     *
     * @return array|null Stock info with keys: warehouse, total, real, pending, location, is_local
     */
    public function getProductStock(string $productCode, Warehouse $warehouse): ?array;

    /**
     * Get stock for multiple products in parallel using Http::pool().
     *
     * @param  string[]  $productCodes
     * @return array<string, array|null> Keyed by product code
     */
    public function getProductStockBatch(array $productCodes, Warehouse $warehouse): array;
}
