<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\WarehouseResource;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WarehouseController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $warehouses = Warehouse::active()->get();

        return WarehouseResource::collection($warehouses);
    }

    public function assignToUser(int $userId, int $warehouseId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $warehouse = Warehouse::findOrFail($warehouseId);

        if ($user->role !== 'empleado') {
            return response()->json([
                'message' => 'Only employees can have warehouses assigned',
            ], 422);
        }

        $user->warehouse_id = $warehouse->id;
        $user->save();

        return response()->json([
            'message' => 'Warehouse assigned successfully',
            'data' => [
                'user_id' => $user->id,
                'warehouse_id' => $warehouse->id,
                'warehouse' => [
                    'id' => $warehouse->id,
                    'code' => $warehouse->code,
                    'name' => $warehouse->name,
                ],
            ],
        ]);
    }

    public function removeFromUser(int $userId, int $warehouseId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $warehouse = Warehouse::findOrFail($warehouseId);

        if ($user->role !== 'empleado') {
            return response()->json([
                'message' => 'Only employees can have warehouses modified',
            ], 422);
        }

        if ($user->warehouse_id === $warehouse->id) {
            return response()->json([
                'message' => 'Cannot remove primary warehouse. Assign a new warehouse first.',
            ], 422);
        }

        return response()->json([
            'message' => 'Warehouse removed successfully',
        ]);
    }

    public function getUserWarehouse(int $userId): JsonResponse
    {
        $user = User::findOrFail($userId);

        if ($user->role !== 'empleado') {
            return response()->json([
                'message' => 'Only employees have warehouses',
            ], 422);
        }

        if (! $user->warehouse) {
            return response()->json([
                'data' => [
                    'warehouse' => null,
                ],
            ]);
        }

        return response()->json([
            'data' => [
                'warehouse' => [
                    'id' => $user->warehouse->id,
                    'code' => $user->warehouse->code,
                    'name' => $user->warehouse->name,
                    'client' => $user->warehouse->client,
                    'branch' => $user->warehouse->branch,
                    'is_active' => $user->warehouse->is_active,
                ],
            ],
        ]);
    }
}
