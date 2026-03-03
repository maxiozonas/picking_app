<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'admin.users.list',
            'admin.users.create',
            'admin.users.edit',
            'admin.users.delete',
            'admin.users.assign',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'sanctum']);
        }

        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'sanctum']);
        $empleadoRole = Role::firstOrCreate(['name' => 'empleado', 'guard_name' => 'sanctum']);

        $adminRole->givePermissionTo(Permission::all());
    }
}
