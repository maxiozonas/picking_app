<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\WarehouseResource;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Admin\WarehouseServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WarehouseController extends Controller
{
    public function __construct(
        private WarehouseServiceInterface $warehouseService
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $warehouses = Warehouse::active()->get();

        return WarehouseResource::collection($warehouses);
    }

    public function assignToUser(int $userId, int $warehouseId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $warehouse = Warehouse::findOrFail($warehouseId);

        $this->warehouseService->assignToUser($user, $warehouse);

        return response()->json([
            'message' => 'Warehouse assigned successfully',
            'data' => new WarehouseResource($warehouse),
        ]);
    }

    public function removeFromUser(int $userId, int $warehouseId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $warehouse = Warehouse::findOrFail($warehouseId);

        $this->warehouseService->removeFromUser($user, $warehouse);

        return response()->json([
            'message' => 'Warehouse removed successfully',
        ]);
    }

    public function getUserWarehouse(int $userId): JsonResponse
    {
        $user = User::findOrFail($userId);

        $warehouse = $this->warehouseService->getUserWarehouse($user);

        return response()->json([
            'data' => $warehouse ? new WarehouseResource($warehouse) : null,
        ]);
    }

    public function updateFlexxusCredentials(Request $request, int $warehouseId): JsonResponse
    {
        $warehouse = Warehouse::findOrFail($warehouseId);

        $validated = $request->validate([
            'flexxus_url' => ['required', 'url'],
            'flexxus_username' => ['required', 'string'],
            'flexxus_password' => ['required', 'string'],
        ]);

        $this->warehouseService->updateFlexxusCredentials($warehouse, $validated);

        return response()->json([
            'message' => 'Warehouse Flexxus credentials updated successfully',
            'data' => $this->warehouseService->getCredentialStatus($warehouse->fresh()),
        ]);
    }

    public function clearFlexxusCredentials(int $warehouseId): JsonResponse
    {
        $warehouse = Warehouse::findOrFail($warehouseId);

        $this->warehouseService->clearFlexxusCredentials($warehouse);

        return response()->json([
            'message' => 'Warehouse Flexxus credentials cleared successfully',
            'data' => $this->warehouseService->getCredentialStatus($warehouse->fresh()),
        ]);
    }
}
