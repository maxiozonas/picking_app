<?php

namespace App\Services\Admin;

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
}
