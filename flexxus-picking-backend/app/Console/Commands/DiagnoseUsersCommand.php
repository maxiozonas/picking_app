<?php

/**
 * Script de diagnóstico para verificar usuarios y warehouses
 * Uso: php artisan diagnose:users
 */

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Support\Facades\Hash;

echo "=== DIAGNÓSTICO DE USUARIOS Y WAREHOUSES ===\n\n";

// 1. Verificar warehouses
echo "📦 WAREHOUSES EN BASE DE DATOS:\n";
echo str_repeat('-', 50)."\n";

$warehouses = Warehouse::all();

if ($warehouses->isEmpty()) {
    echo "⚠️  NO HAY WAREHOUSES EN LA BASE DE DATOS\n";
    echo "   Solución: Ejecuta 'php artisan db:seed --class=WarehouseLocalSeeder'\n";
} else {
    foreach ($warehouses as $wh) {
        $hasCreds = $wh->hasCompleteFlexxusCredentials();
        echo "✓ ID: {$wh->id} | Código: {$wh->code} | Nombre: {$wh->name}\n";
        echo '  Credenciales Flexxus: '.($hasCreds ? 'SÍ ✓' : 'NO ❌')."\n";
        if ($hasCreds) {
            echo "  Usuario Flexxus: CONFIGURADO\n";
        } else {
            echo "  Usuario Flexxus: NO CONFIGURADO\n";
        }
        echo "\n";
    }
}

// 2. Verificar usuarios
echo "\n👥 USUARIOS EN BASE DE DATOS:\n";
echo str_repeat('-', 50)."\n";

$users = User::with('warehouse')->get();

if ($users->isEmpty()) {
    echo "⚠️  NO HAY USUARIOS EN LA BASE DE DATOS\n";
    echo "   Solución: Ejecuta 'php artisan db:seed --class=UserSeeder'\n";
} else {
    foreach ($users as $user) {
        $warehouseCode = $user->warehouse ? $user->warehouse->code : 'SIN ASIGNAR';
        $warehouseName = $user->warehouse ? $user->warehouse->name : 'N/A';
        echo "✓ ID: {$user->id} | Username: {$user->username} | Rol: {$user->role}\n";
        echo "  Warehouse: {$warehouseCode} ({$warehouseName})\n";
        echo '  Activo: '.($user->is_active ? 'SÍ ✓' : 'NO ❌')."\n";
        echo "  Email: {$user->email}\n";
        echo '  Password Verificado: '.($user->password === Hash::make('password') ? 'NO (ya hasheado)' : 'SÍ (es password)')."\n";
        echo "\n";
    }
}

// 3. Verificar roles
echo "\n🔐 ROLES Y PERMISOS:\n";
echo str_repeat('-', 50)."\n";

$roles = \Spatie\Permission\Models\Role::all()->pluck('name');
echo 'Roles: '.$roles->implode(', ')."\n";

$permissions = \Spatie\Permission\Models\Permission::all()->pluck('name');
echo 'Permisos: '.$permissions->implode(', ')."\n";

// 4. Verificar credenciales específicas
echo "\n🔑 CREDENCIALES FLEXXUS CONFIGURADAS:\n";
echo str_repeat('-', 50)."\n";

$warehousesWithCreds = Warehouse::whereNotNull('flexxus_username')
    ->whereNotNull('flexxus_password')
    ->get();

if ($warehousesWithCreds->isEmpty()) {
    echo "⚠️  NO HAY CREDENCIALES FLEXXUS CONFIGURADAS\n";
    echo "   Solución: Ejecuta requests 05, 06, 07 de la colección Postman\n";
} else {
    foreach ($warehousesWithCreds as $wh) {
        echo "✓ Warehouse: {$wh->code} ({$wh->name})\n";
        echo "  Usuario Flexxus: CONFIGURADO ✓\n";
        echo "  Password Flexxus: CONFIGURADO ✓\n";
        echo "\n";
    }
}

// 5. Usuarios de prueba esperados
echo "\n🎯 USUARIOS DE PRUEBA ESPERADOS:\n";
echo str_repeat('-', 50)."\n";

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
        echo "✓ {$username}: EXISTE (ID: {$user->id})\n";
    } else {
        echo "❌ {$username}: NO EXISTE - Debe crearse con seeder\n";
    }
}

echo "\n".str_repeat('=', 50)."\n";
echo "FIN DEL DIAGNÓSTICO\n";
echo str_repeat('=', 50)."\n";
