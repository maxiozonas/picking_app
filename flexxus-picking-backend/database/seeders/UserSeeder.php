<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'empleado', 'guard_name' => 'web']);

        $warehouse = Warehouse::first();

        if (! $warehouse) {
            $warehouse = Warehouse::create([
                'code' => 'DEFAULT',
                'name' => 'Depósito Default',
                'is_active' => true,
            ]);
        }

        $admin = User::create([
            'username' => 'admin',
            'name' => 'Administrador',
            'email' => 'admin@picking.app',
            'password' => Hash::make('password'),
            'warehouse_id' => null,
            'role' => 'admin',
            'is_active' => true,
            'can_override_warehouse' => false,
        ]);

        $admin->assignRole('admin');

        $empleado = User::create([
            'username' => 'operario1',
            'name' => 'Operario Depósito Central',
            'email' => 'operario1@picking.app',
            'password' => Hash::make('password'),
            'warehouse_id' => $warehouse->id,
            'role' => 'empleado',
            'is_active' => true,
            'can_override_warehouse' => false,
        ]);

        $empleado->assignRole('empleado');
    }
}
