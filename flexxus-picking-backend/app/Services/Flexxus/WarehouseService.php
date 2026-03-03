<?php

namespace App\Services\Flexxus;

use App\Http\Clients\Flexxus\FlexxusClientInterface;
use App\Repositories\Flexxus\WarehouseRepositoryInterface;
use Illuminate\Support\Collection;

class WarehouseService implements WarehouseServiceInterface
{
    public function __construct(
        private FlexxusClientInterface $flexxusClient,
        private WarehouseRepositoryInterface $warehouseRepository
    ) {}

    public function syncFromFlexxus(): bool
    {
        $warehouses = $this->flexxusClient->getWarehouses();
        $this->warehouseRepository->syncFromFlexxus($warehouses);

        return true;
    }

    public function getActive(): Collection
    {
        return $this->warehouseRepository->getActive();
    }

    public function all(): Collection
    {
        return $this->warehouseRepository->all();
    }
}
