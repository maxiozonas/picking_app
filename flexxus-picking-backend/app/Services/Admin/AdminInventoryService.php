<?php

namespace App\Services\Admin;

use App\Models\PickingItemProgress;
use App\Models\Warehouse;
use App\Services\Admin\Interfaces\AdminInventoryServiceInterface;
use App\Services\Picking\Interfaces\AdminPickingServiceInterface;
use App\Services\Picking\Interfaces\FlexxusProductServiceInterface;
use Illuminate\Support\Collection;

class AdminInventoryService implements AdminInventoryServiceInterface
{
    public function __construct(
        private FlexxusProductServiceInterface $productService,
        private AdminPickingServiceInterface $adminPickingService
    ) {}

    public function getInventory(array $filters = []): array
    {
        $warehouseId = $filters['warehouse_id'] ?? null;
        $perPage = min($filters['per_page'] ?? 20, 100);
        $page = max($filters['page'] ?? 1, 1);

        $allItems = $this->mergeProductSources($warehouseId);

        $sorted = $allItems->sortBy('product_code')->values();
        $totalItems = $sorted->count();
        $sliced = $sorted->slice(($page - 1) * $perPage, $perPage)->values();

        $warehouses = $warehouseId
            ? Warehouse::where('id', $warehouseId)->get()
            : Warehouse::where('is_active', true)->get();

        $productCodes = $sliced->pluck('product_code')->all();
        $ordersUsingCounts = $this->getOrdersUsingCounts($productCodes, $warehouses);

        $results = collect();

        foreach ($sliced as $item) {
            foreach ($warehouses as $warehouse) {
                if (! $warehouse->hasCompleteFlexxusCredentials()) {
                    continue;
                }

                $stockInfo = $this->productService->getProductStock($item['product_code'], $warehouse);

                $countKey = $item['product_code'].'_'.$warehouse->id;

                $results->push([
                    'product_code' => $item['product_code'],
                    'description' => $item['description'],
                    'warehouse_id' => $warehouse->id,
                    'warehouse_code' => $warehouse->code,
                    'warehouse_name' => $warehouse->name,
                    'stock_total' => $stockInfo['total'] ?? 0,
                    'stock_real' => $stockInfo['real'] ?? 0,
                    'stock_pending' => $stockInfo['pending'] ?? 0,
                    'location' => $stockInfo['location'] ?? null,
                    'orders_using' => $ordersUsingCounts[$countKey] ?? 0,
                ]);
            }
        }

        return [
            'data' => $results,
            'meta' => [
                'current_page' => $page,
                'last_page' => (int) ceil($totalItems / $perPage),
                'per_page' => $perPage,
                'total' => $totalItems,
            ],
        ];
    }

    public function searchProduct(string $productCode, ?int $warehouseId = null): Collection
    {
        $warehouses = $warehouseId
            ? Warehouse::where('id', $warehouseId)->get()
            : Warehouse::where('is_active', true)->get();

        $description = PickingItemProgress::where('product_code', $productCode)
            ->whereNotNull('description')
            ->value('description') ?? '';

        $ordersUsingCounts = $this->getOrdersUsingCounts([$productCode], $warehouses);

        $results = collect();

        foreach ($warehouses as $warehouse) {
            if (! $warehouse->hasCompleteFlexxusCredentials()) {
                continue;
            }

            $stockInfo = $this->productService->getProductStock($productCode, $warehouse);

            if ($stockInfo === null) {
                continue;
            }

            $countKey = $productCode.'_'.$warehouse->id;

            $results->push([
                'product_code' => $productCode,
                'description' => $description,
                'warehouse_id' => $warehouse->id,
                'warehouse_code' => $warehouse->code,
                'warehouse_name' => $warehouse->name,
                'stock_total' => $stockInfo['total'] ?? 0,
                'stock_real' => $stockInfo['real'] ?? 0,
                'stock_pending' => $stockInfo['pending'] ?? 0,
                'location' => $stockInfo['location'] ?? null,
                'orders_using' => $ordersUsingCounts[$countKey] ?? 0,
            ]);
        }

        return $results;
    }

    /**
     * Merge product codes from local in-progress orders and Flexxus pending orders.
     */
    private function mergeProductSources(?int $warehouseId): Collection
    {
        $localItems = PickingItemProgress::query()
            ->select('product_code', 'description')
            ->whereHas('order', function ($q) use ($warehouseId) {
                $q->whereIn('status', ['pending', 'in_progress']);
                if ($warehouseId) {
                    $q->where('warehouse_id', $warehouseId);
                }
            })
            ->groupBy('product_code', 'description')
            ->get()
            ->keyBy('product_code');

        $pendingItems = $this->adminPickingService->getPendingOrderItems(
            array_filter(['warehouse_id' => $warehouseId])
        );

        $allItems = collect();
        foreach ($localItems as $code => $item) {
            $allItems->put($code, [
                'product_code' => $code,
                'description' => $item->description ?? '',
            ]);
        }
        foreach ($pendingItems as $pending) {
            if (! $allItems->has($pending['product_code'])) {
                $allItems->put($pending['product_code'], [
                    'product_code' => $pending['product_code'],
                    'description' => $pending['description'] ?? '',
                ]);
            }
        }

        return $allItems;
    }

    /**
     * Get orders_using counts in a single query instead of N+1.
     *
     * @param  \Illuminate\Database\Eloquent\Collection  $warehouses
     * @return array<string, int> Keyed by "{product_code}_{warehouse_id}"
     */
    private function getOrdersUsingCounts(array $productCodes, $warehouses): array
    {
        if (empty($productCodes)) {
            return [];
        }

        $warehouseIds = $warehouses->pluck('id')->all();

        $counts = PickingItemProgress::query()
            ->select('product_code', 'picking_orders_progress.warehouse_id')
            ->selectRaw('COUNT(*) as count')
            ->join('picking_orders_progress', 'picking_items_progress.picking_order_progress_id', '=', 'picking_orders_progress.id')
            ->whereIn('product_code', $productCodes)
            ->whereIn('picking_orders_progress.status', ['pending', 'in_progress'])
            ->whereIn('picking_orders_progress.warehouse_id', $warehouseIds)
            ->groupBy('product_code', 'picking_orders_progress.warehouse_id')
            ->get();

        $result = [];
        foreach ($counts as $row) {
            $key = $row->product_code.'_'.$row->warehouse_id;
            $result[$key] = (int) $row->count;
        }

        return $result;
    }
}
