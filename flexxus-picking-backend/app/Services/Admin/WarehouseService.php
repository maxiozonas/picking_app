<?php

namespace App\Services\Admin;

use App\Exceptions\Admin\WarehouseAssignmentException;
use App\Models\User;
use App\Models\Warehouse;

class WarehouseService implements WarehouseServiceInterface
{
    public function getCredentialStatus(Warehouse $warehouse): array
    {
        return [
            'id' => $warehouse->id,
            'code' => $warehouse->code,
            'name' => $warehouse->name,
            'has_flexxus_credentials' => $warehouse->hasCompleteFlexxusCredentials(),
        ];
    }

    public function updateFlexxusCredentials(Warehouse $warehouse, array $credentials): void
    {
        $warehouse->update($credentials);
    }

    public function clearFlexxusCredentials(Warehouse $warehouse): void
    {
        $warehouse->update([
            'flexxus_url' => null,
            'flexxus_username' => null,
            'flexxus_password' => null,
        ]);
    }

    public function assignToUser(User $user, Warehouse $warehouse): void
    {
        if ($user->role !== 'empleado') {
            throw new WarehouseAssignmentException(
                'Only employees can have warehouses assigned',
                ['user_id' => $user->id, 'warehouse_id' => $warehouse->id]
            );
        }

        $user->warehouse_id = $warehouse->id;
        $user->override_expires_at = null;
        $user->save();
    }

    public function removeFromUser(User $user, Warehouse $warehouse): void
    {
        if ($user->role !== 'empleado') {
            throw new WarehouseAssignmentException(
                'Only employees can have warehouses modified',
                ['user_id' => $user->id, 'warehouse_id' => $warehouse->id]
            );
        }

        if ($user->warehouse_id === $warehouse->id) {
            throw new WarehouseAssignmentException(
                'Cannot remove primary warehouse. Assign a new warehouse first.',
                ['user_id' => $user->id, 'warehouse_id' => $warehouse->id]
            );
        }
    }

    public function getUserWarehouse(User $user): ?Warehouse
    {
        if ($user->role !== 'empleado') {
            throw new WarehouseAssignmentException(
                'Only employees have warehouses',
                ['user_id' => $user->id]
            );
        }

        return $user->warehouse;
    }
}
