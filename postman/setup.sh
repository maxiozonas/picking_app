#!/bin/bash

# Script de preparación para testing con Postman
# Uso: ./postman-setup.sh

echo "🚀 Preparando entorno para testing con Postman..."
echo ""

# 1. Limpiar y recrear BD
echo "📊 Paso 1: Migraciones fresh..."
cd flexxus-picking-backend
php artisan migrate:fresh --seed

echo ""
echo "✅ Migraciones completadas"
echo ""

# 2. Verificar warehouses creados
echo "📦 Paso 2: Verificando warehouses..."
php artisan db:table warehouses

echo ""
echo "✅ Verificación de warehouses completada"
echo ""

# 3. Crear usuarios de prueba
echo "👤 Paso 3: Creando usuarios de prueba..."

# Admin (ya creado por seeder, pero verificamos)
php artisan tinker --execute="
\$admin = User::where('username', 'admin')->first();
if (!\$admin) {
    \$admin = User::factory()->admin()->create([
        'username' => 'admin',
        'name' => 'Admin User',
        'email' => 'admin@example.com',
    ]);
    echo 'Admin creado: ID ' . \$admin->id . PHP_EOL;
} else {
    echo 'Admin ya existe: ID ' . \$admin->id . PHP_EOL;
}
"

# Operario Rondeau
php artisan tinker --execute="
\$wh = \App\Models\Warehouse::where('code', '002')->first();
\$op = \App\Models\User::where('username', 'operador_rondeau')->first();
if (!\$op) {
    \$op = \App\Models\User::factory()->create([
        'username' => 'operador_rondeau',
        'name' => 'Operario Rondeau',
        'email' => 'operador.rondeau@example.com',
        'warehouse_id' => \$wh->id,
        'role' => 'empleado',
    ]);
    \$op->assignRole('empleado');
    echo 'Operario Rondeau creado: ID ' . \$op->id . PHP_EOL;
} else {
    echo 'Operario Rondeau ya existe: ID ' . \$op->id . PHP_EOL;
    \$op->update(['warehouse_id' => \$wh->id]);
}
"

# Operario Don Bosco
php artisan tinker --execute="
\$wh = \App\Models\Warehouse::where('code', '001')->first();
\$op = \App\Models\User::where('username', 'operador_donbosco')->first();
if (!\$op) {
    \$op = \App\Models\User::factory()->create([
        'username' => 'operador_donbosco',
        'name' => 'Operario Don Bosco',
        'email' => 'operador.donbosco@example.com',
        'warehouse_id' => \$wh->id,
        'role' => 'empleado',
    ]);
    \$op->assignRole('empleado');
    echo 'Operario Don Bosco creado: ID ' . \$op->id . PHP_EOL;
} else {
    echo 'Operario Don Bosco ya existe: ID ' . \$op->id . PHP_EOL;
    \$op->update(['warehouse_id' => \$wh->id]);
}
"

echo ""
echo "✅ Usuarios de prueba creados"
echo ""

# 4. Verificar roles y permisos
echo "🔐 Paso 4: Verificando roles y permisos..."
php artisan tinker --execute="
echo 'Roles: ' . \Spatie\Permission\Models\Role::pluck('name')->implode(', ') . PHP_EOL;
echo 'Permisos: ' . \Spatie\Permission\Models\Permission::pluck('name')->implode(', ') . PHP_EOL;
"

echo ""
echo "✅ Roles y permisos verificados"
echo ""

# 5. Iniciar servidor
echo "🌐 Paso 5: Iniciando servidor de desarrollo..."
echo ""
echo "Servidor iniciando en http://localhost:8000"
echo "Presiona Ctrl+C para detener"
echo ""
php artisan serve

echo ""
echo "✅ Entorno listo para testing con Postman!"
echo ""
echo "📋 Credenciales de prueba:"
echo "   Admin:"
echo "     Username: admin"
echo "     Password: password"
echo ""
echo "   Operario Rondeau:"
echo "     Username: operador_rondeau"
echo "     Password: password"
echo ""
echo "   Operario Don Bosco:"
echo "     Username: operador_donbosco"
echo "     Password: password"
