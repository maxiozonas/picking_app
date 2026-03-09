<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class WarehouseLocalSeeder extends Seeder
{
    public function run(): void
    {
        $warehouses = [
            [
                'code' => '001',
                'name' => 'Don Bosco',
                'is_active' => true,
            ],
            [
                'code' => '002',
                'name' => 'Rondeau',
                'is_active' => true,
            ],
            [
                'code' => '004',
                'name' => 'Socrates',
                'is_active' => true,
            ],
        ];

        foreach ($warehouses as $warehouse) {
            Warehouse::firstOrCreate(
                ['code' => $warehouse['code']],
                $warehouse
            );

            $this->command->info("Warehouse {$warehouse['code']} ({$warehouse['name']}) creado/actualizado.");
        }
    }
}
