<?php

namespace Database\Seeders;

use App\Services\Flexxus\WarehouseServiceInterface;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    public function __construct(
        private WarehouseServiceInterface $warehouseService
    ) {}

    public function run(): void
    {
        $this->warehouseService->syncFromFlexxus();
    }
}
