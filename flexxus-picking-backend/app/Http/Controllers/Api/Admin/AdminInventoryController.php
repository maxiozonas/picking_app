<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\InventoryItemResource;
use App\Models\PickingItemProgress;
use App\Models\Warehouse;
use App\Services\Picking\FlexxusPickingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminInventoryController extends Controller
{
    public function __construct(
        private FlexxusPickingService $flexxusService
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

        // Get distinct product codes from active (non-completed) orders
        $itemsQuery = PickingItemProgress::query()
            ->select('product_code', 'description')
            ->whereHas('order', function ($q) use ($warehouseId) {
                $q->whereIn('status', ['pending', 'in_progress']);
                if ($warehouseId) {
                    $q->where('warehouse_id', $warehouseId);
                }
            })
            ->groupBy('product_code', 'description')
            ->orderBy('product_code');

        $paginated = $itemsQuery->paginate($perPage);

        // Determine which warehouses to query stock for
        $warehouses = $warehouseId
            ? Warehouse::where('id', $warehouseId)->get()
            : Warehouse::where('is_active', true)->get();

        $results = collect();

        foreach ($paginated->items() as $item) {
            foreach ($warehouses as $warehouse) {
                $stockInfo = $this->flexxusService->getProductStock($item->product_code, $warehouse);

                // Count how many active order-items need this product in this warehouse
                $ordersUsing = PickingItemProgress::query()
                    ->where('product_code', $item->product_code)
                    ->whereHas('order', fn ($q) => $q
                        ->whereIn('status', ['pending', 'in_progress'])
                        ->where('warehouse_id', $warehouse->id)
                    )
                    ->count();

                $results->push([
                    'product_code'   => $item->product_code,
                    'description'    => $item->description ?? '',
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
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
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
