<?php

namespace App\Services\Picking;

use App\Exceptions\Picking\WarehouseMismatchException;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\WarehouseExecutionContextResolverInterface;

class WarehouseExecutionContextResolver implements WarehouseExecutionContextResolverInterface
{
    public function resolveForUser(User $user, array $requestContext = []): WarehouseExecutionContext
    {
        $isAdmin = $user->hasRole('admin');
        $warehouse = $this->getWarehouse($user, $requestContext, $isAdmin);
        $isOverride = $this->isOverride($user, $requestContext, $isAdmin, $warehouse);

        return new WarehouseExecutionContext(
            warehouseId: $warehouse->id,
            warehouseCode: $warehouse->code,
            userId: $user->id,
            isOverride: $isOverride,
            correlationToken: (string) str()->uuid()
        );
    }

    public function resolveForUserId(int $userId, array $requestContext = []): WarehouseExecutionContext
    {
        $user = User::with('warehouse')->findOrFail($userId);

        return $this->resolveForUser($user, $requestContext);
    }

    private function getWarehouse(User $user, array $requestContext, bool $isAdmin): Warehouse
    {
        $assignedWarehouse = $user->warehouse;

        if (! $assignedWarehouse) {
            throw new WarehouseMismatchException('', $user->id, 0, [
                'reason' => 'User does not have a warehouse assigned',
                'request_context_ignored' => $requestContext,
            ]);
        }

        $overrideWarehouseId = $requestContext['override_warehouse_id'] ?? null;

        if ($overrideWarehouseId === null || ! $isAdmin) {
            return $assignedWarehouse;
        }

        if (! $user->hasAccessToWarehouse($overrideWarehouseId)) {
            throw new WarehouseMismatchException('', $user->id, $overrideWarehouseId, [
                'reason' => 'Admin does not have access to requested override warehouse',
                'requested_warehouse_id' => $overrideWarehouseId,
            ]);
        }

        return Warehouse::findOrFail($overrideWarehouseId);
    }

    private function isOverride(User $user, array $requestContext, bool $isAdmin, Warehouse $resolvedWarehouse): bool
    {
        $hasActiveOverride = $user->override_expires_at && $user->override_expires_at->isFuture();

        if ($isAdmin && isset($requestContext['override_warehouse_id'])) {
            return true;
        }

        return $isAdmin && $hasActiveOverride;
    }
}
