<?php

namespace App\Repositories\Flexxus;

use App\Models\Warehouse;
use Illuminate\Support\Collection;

interface WarehouseRepositoryInterface
{
    public function syncFromFlexxus(array $data): void;

    public function getActive(): Collection;

    public function findByCode(string $code): ?Warehouse;

    public function all(): Collection;
}
