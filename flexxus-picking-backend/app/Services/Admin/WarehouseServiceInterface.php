<?php

namespace App\Services\Admin;

use App\Models\Warehouse;

interface WarehouseServiceInterface
{
    /**
     * Get credential status for a warehouse (redacted, no secrets)
     *
     * @return array{id: int, code: string, name: string, has_flexxus_credentials: bool}
     */
    public function getCredentialStatus(Warehouse $warehouse): array;

    /**
     * Update Flexxus credentials for a warehouse
     *
     * @param  array{flexxus_url: string, flexxus_username: string, flexxus_password: string}  $credentials
     */
    public function updateFlexxusCredentials(Warehouse $warehouse, array $credentials): void;

    /**
     * Clear Flexxus credentials for a warehouse
     */
    public function clearFlexxusCredentials(Warehouse $warehouse): void;
}
