<?php

namespace App\Services\Picking\Interfaces;

use App\Http\Clients\Flexxus\FlexxusClient;
use App\Models\Warehouse;

interface FlexxusClientFactoryInterface
{
    /**
     * Create a FlexxusClient instance configured with warehouse-specific credentials.
     *
     * @param  Warehouse  $warehouse  The warehouse to get credentials from
     * @return FlexxusClient Configured client instance
     */
    public function createForWarehouse(Warehouse $warehouse): FlexxusClient;
}
