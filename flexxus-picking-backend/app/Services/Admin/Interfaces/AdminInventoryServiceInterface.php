<?php

namespace App\Services\Admin\Interfaces;

use Illuminate\Support\Collection;

interface AdminInventoryServiceInterface
{
    /**
     * List stock levels for product codes in active picking orders, grouped by warehouse.
     *
     * @param  array{warehouse_id?: int, page?: int, per_page?: int}  $filters
     * @return array{data: Collection, meta: array}
     */
    public function getInventory(array $filters = []): array;

    /**
     * Search stock for a specific product code across warehouses.
     */
    public function searchProduct(string $productCode, ?int $warehouseId = null): Collection;
}
