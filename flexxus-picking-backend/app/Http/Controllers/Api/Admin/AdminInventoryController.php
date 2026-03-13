<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\InventoryItemResource;
use App\Services\Admin\Interfaces\AdminInventoryServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminInventoryController extends Controller
{
    public function __construct(
        private AdminInventoryServiceInterface $inventoryService
    ) {}

    /**
     * List stock levels for all product codes actively in picking orders.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = array_filter([
            'warehouse_id' => $request->integer('warehouse_id') ?: null,
            'page' => $request->integer('page') ?: null,
            'per_page' => $request->integer('per_page') ?: null,
        ], fn ($value) => $value !== null);

        $result = $this->inventoryService->getInventory($filters);

        return response()->json([
            'data' => InventoryItemResource::collection($result['data']),
            'meta' => $result['meta'],
        ]);
    }

    /**
     * Search stock for a specific product code across warehouses.
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'product_code' => ['required', 'string', 'max:50'],
            'warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
        ]);

        $productCode = trim($request->string('product_code'));
        $warehouseId = $request->integer('warehouse_id') ?: null;

        $results = $this->inventoryService->searchProduct($productCode, $warehouseId);

        return response()->json([
            'data' => InventoryItemResource::collection($results),
        ]);
    }
}
