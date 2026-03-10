<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\InventoryItemResource;
use App\Models\PickingItemProgress;
use App\Models\Warehouse;
use App\Services\Picking\FlexxusPickingService;
use App\Services\Picking\Interfaces\AdminPickingServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminInventoryController extends Controller
{
    public function __construct(
        private FlexxusPickingService $flexxusService,
        private AdminPickingServiceInterface $adminPickingService
    ) {}

    /**
     * List stock levels for all product codes actively in picking orders.
     * Grouped by warehouse so admins can see cross-depot stock.
     *
     * GET /admin/inventory?warehouse_id=1&page=1&per_page=20
     */
    public function index(Request $request): JsonResponse
    {
        $warehouseId = $request->integer('warehouse_id') ?: null;
        $perPage = min($request->integer('per_page', 20), 100);

        // 1. Get product codes from locally started orders (PickingItemProgress)
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

        // 2. Get product codes from Flexxus pending orders (not yet started locally)
        $pendingItems = $this->adminPickingService->getPendingOrderItems(
            array_filter(['warehouse_id' => $warehouseId])
        );

        // 3. Merge both sources, local items take priority for description
        $allItems = collect();
        foreach ($localItems as $code => $item) {
            $allItems->put($code, [
                'product_code' => $code,
                'description' => $item->description ?? '',
            ]);
        }
        foreach ($pendingItems as $pending) {
            if (!$allItems->has($pending['product_code'])) {
                $allItems->put($pending['product_code'], [
                    'product_code' => $pending['product_code'],
                    'description' => $pending['description'] ?? '',
                ]);
            }
        }

        // 4. Sort and paginate manually
        $sorted = $allItems->sortBy('product_code')->values();
        $page = max(1, $request->integer('page', 1));
        $sliced = $sorted->slice(($page - 1) * $perPage, $perPage)->values();
        $totalItems = $sorted->count();

        // 5. Determine which warehouses to query stock for
        $warehouses = $warehouseId
            ? Warehouse::where('id', $warehouseId)->get()
            : Warehouse::where('is_active', true)->get();

        $results = collect();

        foreach ($sliced as $item) {
            foreach ($warehouses as $warehouse) {
                $stockInfo = $this->flexxusService->getProductStock($item['product_code'], $warehouse);

                $ordersUsing = PickingItemProgress::query()
                    ->where('product_code', $item['product_code'])
                    ->whereHas('order', fn ($q) => $q
                        ->whereIn('status', ['pending', 'in_progress'])
                        ->where('warehouse_id', $warehouse->id)
                    )
                    ->count();

                $results->push([
                    'product_code'   => $item['product_code'],
                    'description'    => $item['description'],
                    'warehouse_id'   => $warehouse->id,
                    'warehouse_code' => $warehouse->code,
                    'warehouse_name' => $warehouse->name,
                    'stock_total'    => $stockInfo['total'] ?? 0,
                    'stock_real'     => $stockInfo['real'] ?? 0,
                    'stock_pending'  => $stockInfo['pending'] ?? 0,
                    'location'       => $stockInfo['location'] ?? null,
                    'orders_using'   => $ordersUsing,
                ]);
            }
        }

        return response()->json([
            'data' => InventoryItemResource::collection($results),
            'meta' => [
                'current_page' => $page,
                'last_page'    => (int) ceil($totalItems / $perPage),
                'per_page'     => $perPage,
                'total'        => $totalItems,
            ],
        ]);
    }

    /**
     * Search stock for a specific product code across warehouses.
     *
     * GET /admin/inventory/search?product_code=04535&warehouse_id=1
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'product_code' => ['required', 'string', 'max:50'],
            'warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
        ]);

        $productCode = trim($request->string('product_code'));
        $warehouseId = $request->integer('warehouse_id') ?: null;

        $warehouses = $warehouseId
            ? Warehouse::where('id', $warehouseId)->get()
            : Warehouse::where('is_active', true)->get();

        $results = collect();

        foreach ($warehouses as $warehouse) {
            $stockInfo = $this->flexxusService->getProductStock($productCode, $warehouse);

            if ($stockInfo === null) {
                continue;
            }

            $results->push([
                'product_code'   => $productCode,
                'description'    => PickingItemProgress::where('product_code', $productCode)
                    ->whereNotNull('description')
                    ->value('description') ?? '',
                'warehouse_id'   => $warehouse->id,
                'warehouse_code' => $warehouse->code,
                'warehouse_name' => $warehouse->name,
                'stock_total'    => $stockInfo['total'] ?? 0,
                'stock_real'     => $stockInfo['real'] ?? 0,
                'stock_pending'  => $stockInfo['pending'] ?? 0,
                'location'       => $stockInfo['location'] ?? null,
                'orders_using'   => PickingItemProgress::where('product_code', $productCode)
                    ->whereHas('order', fn ($q) => $q
                        ->whereIn('status', ['pending', 'in_progress'])
                        ->where('warehouse_id', $warehouse->id)
                    )
                    ->count(),
            ]);
        }

        return response()->json([
            'data' => InventoryItemResource::collection($results),
        ]);
    }
}
