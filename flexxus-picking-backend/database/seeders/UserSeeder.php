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
            'can_override_warehouse' => true, // Admin puede hacer override
        ]);

        $admin->assignRole('admin');

        $empleado = User::create([
            'username' => 'operario1',
            'name' => 'Operario Depósito Central',
            'email' => 'operario1@picking.app',
            'password' => Hash::make('password'),
            'warehouse_id' => $warehouse->id, // Asignar al primer warehouse creado
            'role' => 'empleado',
            'is_active' => true,
            'can_override_warehouse' => false,
        ]);

        $empleado->assignRole('empleado');

        // Operarios por depósito (Multi-account Flexxus)
        $this->createOperarioIfWarehouseExists('operario_donbosco', 'Don Bosco', 'opdb@picking.app', '001');
        $this->createOperarioIfWarehouseExists('operario_rondeau', 'Rondeau', 'oprd@picking.app', '002');
        $this->createOperarioIfWarehouseExists('operario_socrates', 'Socrates', 'opsc@picking.app', '004');
    }

    private function createOperarioIfWarehouseExists(string $username, string $warehouseName, string $email, string $warehouseCode): void
    {
        $warehouse = Warehouse::where('code', $warehouseCode)->first();

        if (! $warehouse) {
            $this->command->warn("Warehouse {$warehouseCode} ({$warehouseName}) no encontrado. Omitiendo creación de {$username}.");

            return;
        }

        $user = User::create([
            'username' => $username,
            'name' => "Operario {$warehouseName}",
            'email' => $email,
            'password' => Hash::make('password'),
            'warehouse_id' => $warehouse->id,
            'role' => 'empleado',
            'is_active' => true,
            'can_override_warehouse' => false,
        ]);

        $user->assignRole('empleado');

        $this->command->info("Usuario {$username} creado para warehouse {$warehouseCode} ({$warehouseName})");
    }
}
