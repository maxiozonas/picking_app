<?php

namespace App\Services\Picking;

use App\Exceptions\Picking\WarehouseFlexxusCredentialsMissingException;
use App\Http\Clients\Flexxus\FlexxusClient;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;

class FlexxusClientFactory implements FlexxusClientFactoryInterface
{
    public function createForWarehouse(Warehouse $warehouse): FlexxusClient
    {
        if (! $warehouse->hasCompleteFlexxusCredentials()) {
            throw new WarehouseFlexxusCredentialsMissingException($warehouse);
        }

        $baseUrl = $warehouse->flexxus_url;
        $username = $warehouse->flexxus_username;
        $password = $warehouse->flexxus_password;
        $deviceInfo = config('flexxus.device_info');

        $cacheSuffix = $warehouse->code;

        return new FlexxusClient(
            $baseUrl,
            $username,
            $password,
            $deviceInfo,
            $cacheSuffix
        );
    }
}
