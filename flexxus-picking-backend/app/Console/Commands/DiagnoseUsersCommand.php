<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DiagnoseUsersCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'diagnose:users';

    /**
     * The console command description.
     */
    protected $description = 'Verifica el estado de usuarios, warehouses y credenciales Flexxus';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->line('=== DIAGNÓSTICO DE USUARIOS Y WAREHOUSES ===');
        $this->newLine();

        // 1. Verificar warehouses
        $this->line('📦 WAREHOUSES EN BASE DE DATOS:');
        $this->line(str_repeat('-', 50));

        $warehouses = Warehouse::all();

        if ($warehouses->isEmpty()) {
            $this->warn('⚠️  NO HAY WAREHOUSES EN LA BASE DE DATOS');
            $this->line("   Solución: Ejecuta 'php artisan db:seed --class=WarehouseLocalSeeder'");
        } else {
            foreach ($warehouses as $wh) {
                $hasCreds = $wh->hasCompleteFlexxusCredentials();
                $this->line("✓ ID: {$wh->id} | Código: {$wh->code} | Nombre: {$wh->name}");
                $this->line('  Credenciales Flexxus: '.($hasCreds ? 'SÍ ✓' : 'NO ❌'));
                $this->line('  Usuario Flexxus: '.($hasCreds ? 'CONFIGURADO' : 'NO CONFIGURADO'));
                $this->newLine();
            }
        }

        // 2. Verificar usuarios
        $this->newLine();
        $this->line('👥 USUARIOS EN BASE DE DATOS:');
        $this->line(str_repeat('-', 50));

        $users = User::with('warehouse')->get();

        if ($users->isEmpty()) {
            $this->warn('⚠️  NO HAY USUARIOS EN LA BASE DE DATOS');
            $this->line("   Solución: Ejecuta 'php artisan db:seed --class=UserSeeder'");
        } else {
            foreach ($users as $user) {
                $warehouseCode = $user->warehouse ? $user->warehouse->code : 'SIN ASIGNAR';
                $warehouseName = $user->warehouse ? $user->warehouse->name : 'N/A';
                $this->line("✓ ID: {$user->id} | Username: {$user->username} | Rol: {$user->role}");
                $this->line("  Warehouse: {$warehouseCode} ({$warehouseName})");
                $this->line('  Activo: '.($user->is_active ? 'SÍ ✓' : 'NO ❌'));
                $this->line("  Email: {$user->email}");
                $this->line('  Password Verificado: '.($user->password === Hash::make('password') ? 'NO (ya hasheado)' : 'SÍ (es password)'));
                $this->newLine();
            }
        }

        // 3. Verificar roles
        $this->newLine();
        $this->line('🔐 ROLES Y PERMISOS:');
        $this->line(str_repeat('-', 50));

        $roles = Role::all()->pluck('name');
        $this->line('Roles: '.$roles->implode(', '));

        $permissions = Permission::all()->pluck('name');
        $this->line('Permisos: '.$permissions->implode(', '));

        // 4. Verificar credenciales específicas
        $this->newLine();
        $this->line('🔑 CREDENCIALES FLEXXUS CONFIGURADAS:');
        $this->line(str_repeat('-', 50));

        $warehousesWithCreds = Warehouse::whereNotNull('flexxus_username')
            ->whereNotNull('flexxus_password')
            ->get();

        if ($warehousesWithCreds->isEmpty()) {
            $this->warn('⚠️  NO HAY CREDENCIALES FLEXXUS CONFIGURADAS');
            $this->line('   Solución: Ejecuta requests 05, 06, 07 de la colección Postman');
        } else {
            foreach ($warehousesWithCreds as $wh) {
                $this->line("✓ Warehouse: {$wh->code} ({$wh->name})");
                $this->line('  Usuario Flexxus: CONFIGURADO ✓');
                $this->line('  Password Flexxus: CONFIGURADO ✓');
                $this->newLine();
            }
        }

        // 5. Usuarios de prueba esperados
        $this->newLine();
        $this->line('🎯 USUARIOS DE PRUEBA ESPERADOS:');
        $this->line(str_repeat('-', 50));

        $expectedUsers = [
            'admin',
            'operario1',
            'operario_donbosco',
            'operario_rondeau',
            'operario_socrates',
        ];

        foreach ($expectedUsers as $username) {
            $user = User::where('username', $username)->first();
            if ($user) {
                $this->line("✓ {$username}: EXISTE (ID: {$user->id})");
            } else {
                $this->error("❌ {$username}: NO EXISTE - Debe crearse con seeder");
            }
        }

        $this->newLine();
        $this->line(str_repeat('=', 50));
        $this->info('FIN DEL DIAGNÓSTICO');
        $this->line(str_repeat('=', 50));

        return self::SUCCESS;
    }
}
