<?php

namespace App\Services\Flexxus;

use Illuminate\Support\Collection;

interface WarehouseServiceInterface
{
    public function syncFromFlexxus(): bool;

    public function getActive(): Collection;

    public function all(): Collection;
}
