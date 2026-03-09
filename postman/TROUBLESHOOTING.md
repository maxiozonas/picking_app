# 🔧 Solución de Problemas - Login y Token

## 🐛 Problemas Reportados

1. **"Credenciales inválidas"** al loguearse como operario
2. **"Invalid token"** al acceder a `/api/admin/warehouses` después de loguearse como admin

---

## 🔍 Diagnóstico y Solución

### **Paso 1: Ejecutar Diagnóstico**

```bash
cd flexxus-picking-backend
php artisan diagnose:users
```

Esto mostrará:
- ✅ ¿Qué warehouses existen?
- ✅ ¿Qué usuarios existen?
- ✅ ¿Qué usuarios faltan?
- ✅ ¿Las credenciales Flexxus están configuradas?

---

### **Paso 2: Reconstruir Base de Datos (Si es necesario)**

Si el diagnóstico muestra que faltan warehouses o usuarios:

```bash
cd flexxus-picking-backend

# Limpiar y recrear todo
php artisan migrate:fresh

# Ejecutar seeders en orden correcto
php artisan db:seed

# Verificar nuevamente
php artisan diagnose:users
```

**¿Qué hace esto?**
- ✅ Crea warehouses 001, 002, 004 localmente (sin depender de Flexxus API)
- ✅ Crea usuarios admin, operario_donbosco, operario_rondeau, operario_socrates
- ✅ Crea roles y permisos
- ✅ Asigna warehouses a operarios

---

### **Paso 3: Verificar Credenciales de App**

**Usuario Admin:**
```
Username: admin
Password: password
```

**Operarios:**
```
Username: operario_donbosco
Password: password
Warehouse: 001 (Don Bosco)

Username: operario_rondeau
Password: password
Warehouse: 002 (Rondeau)

Username: operario_socrates
Password: password
Warehouse: 004 (Socrates)
```

---

### **Paso 4: Probar Login Directo**

Si login falla, verificar el hash del password:

```bash
php artisan tinker

# Verificar si el password es correcto
$user = \App\Models\User::where('username', 'admin')->first();
\Hash::check('password', $user->password); // Debe retornar true

# Si retorna false, resetear el password
$user->password = \Hash::make('password');
$user->save();
```

---

### **Paso 5: Verificar Token de Admin**

Si después de login el token no funciona:

**Opción A: Verificar variable de colección en Postman**
1. Ejecuta Request 01 (Login Admin)
2. Abre "Console" en Postman (abajo a la derecha)
3. Verifica que la variable `admin_token` se seteó

**Opción B: Token manual**
Si la variable no se setea, copia el token de la respuesta manualmente:
1. Ejecuta Request 01 (Login Admin)
2. Copia el token de la respuesta: `"token": "eyJ0eXAiOi..."`
3. Pégalo en la variable `admin_token` de la colección

**Opción C: Verificar configuración de Sanctum**
```bash
php artisan config:show sanctum
```

---

### **Paso 6: Verificar Servidor Corriendo**

```bash
# Asegúrate que el servidor esté corriendo
php artisan serve

# Debería mostrar: Server running on [http://127.0.0.1:8000]
```

---

## 🎯 Soluciones Específicas

### **Problema: "Credenciales inválidas" en Operarios**

**Causa 1: Usuario no existe**
```bash
php artisan diagnose:users
# Si no aparece operario_donbosco o operario_rondeau:
php artisan db:seed --class=UserSeeder
```

**Causa 2: Password incorrecto**
```bash
php artisan tinker
$user = \App\Models\User::where('username', 'operario_rondeau')->first();
$user->password = \Hash::make('password');
$user->save();
```

**Causa 3: Usuario inactivo**
```bash
php artisan tinker
$user = \App\Models\User::where('username', 'operario_rondeau')->first();
$user->is_active = true;
$user->save();
```

---

### **Problema: "Invalid token" en Admin Endpoints**

**Causa 1: Token expiró**
- Solución: Ejecutar nuevamente Request 01 (Login Admin)

**Causa 2: Token no se guardó en variable**
- Solución: Copiar token manualmente desde response (ver Paso 5)

**Causa 3: Middleware de autenticación no configurado**
- Verificar que las rutas tienen `auth:sanctum` middleware
- Verificar que `config/sanctum.php` tiene `stateful` = true

---

## ✅ Checklist Completo de Solución

- [ ] Ejecutar `php artisan diagnose:users`
- [ ] Ejecutar `php artisan migrate:fresh --seed`
- [ ] Verificar que aparecen 3 warehouses (001, 002, 004)
- [ ] Verificar que aparecen 5 usuarios (admin, operario1, operario_donbosco, operario_rondeau, operario_socrates)
- [ ] Ejecutar Request 01 (Login Admin) - Debe retornar 200
- [ ] Ejecutar Request 02 (Login Operario Rondeau) - Debe retornar 200
- [ ] Ejecutar Request 04 (Listar Warehouses) - Debe retornar 200
- [ ] Verificar que tests de Postman pasan (checks verdes)

---

## 🔧 Comandos Útiles

```bash
# Diagnóstico completo
php artisan diagnose:users

# Ver usuarios en BD
php artisan db:table users

# Ver warehouses en BD
php artisan db:table warehouses

# Ver roles y permisos
php artisan tinker --execute="echo \Spatie\Permission\Models\Role::with('permissions')->get()->toJson(JSON_PRETTY_PRINT);"

# Limpiar cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Probar login manual
php artisan tinker --execute="
\$user = \App\Models\User::where('username', 'admin')->first();
echo 'Password check: ' . (\Illuminate\Support\Facades\Hash::check('password', \$user->password) ? 'CORRECTO' : 'INCORRECTO') . PHP_EOL;
"

# Crear admin fresh
php artisan tinker --execute="
\$admin = \App\Models\User::updateOrCreate(
    ['username' => 'admin'],
    [
        'name' => 'Admin',
        'email' => 'admin@picking.app',
        'password' => \Illuminate\Support\Facades\Hash::make('password'),
        'role' => 'admin',
        'is_active' => true,
        'can_override_warehouse' => true,
    ]
);
\$admin->assignRole('admin');
echo 'Admin creado/actualizado: ID ' . \$admin->id . PHP_EOL;
"
```

---

## 🚀 Flujo Completo de Prueba

```bash
# 1. Diagnóstico
php artisan diagnose:users

# 2. Fresh setup
php artisan migrate:fresh --seed

# 3. Verificar usuarios
php artisan db:table users --columns=id,username,role,warehouse_id

# 4. Verificar warehouses
php artisan db:table warehouses --columns=id,code,name,flexxus_username

# 5. Iniciar servidor
php artisan serve

# 6. Probar en Postman
# - Request 01: Login Admin
# - Request 02: Login Operario Rondeau
# - Request 04: Listar Warehouses
```

---

## 📞 Si Nada Funciona

1. **Verificar logs**: `php artisan pail`
2. **Verificar configuración**: `php artisan config:show app.debug`
3. **Verificar migraciones**: `php artisan migrate:status`
4. **Verificar entorno**: `php artisan env` (verificar APP_ENV, DB_CONNECTION)

---

**¿Problema resuelto?** Si después de esto sigues teniendo problemas, ejecuta `php artisan diagnose:users` y compárteme el output. 🔍
