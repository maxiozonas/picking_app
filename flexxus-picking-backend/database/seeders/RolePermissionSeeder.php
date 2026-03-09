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
            Permission::firstOrCreate(['name' => $permission]);
        }

        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $empleadoRole = Role::firstOrCreate(['name' => 'empleado']);

        $adminRole->givePermissionTo(Permission::all());
    }
}
