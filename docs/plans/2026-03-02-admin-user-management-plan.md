# Admin User Management API Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Implementar API completa para que administradores gestionen usuarios (empleados) y asignen depósitos.

**Architecture:** 
- Spatie Permission para roles y permisos
- API Resources para transformar respuestas
- Service Layer para lógica de negocio
- Validación con Form Requests

**Tech Stack:** Laravel 12, Spatie Permission, Sanctum

---

## Prerequisites

1. Instalar Spatie Permission:
```bash
composer require spatie/laravel-permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan migrate
```

2. Agregar rol por defecto al crear usuario

---

## Task 1: Instalar y configurar Spatie Permission

**Files:**
- Modify: `flexxus-picking-backend/composer.json` (si es necesario)
- Modify: `flexxus-picking-backend/app/Providers/AppServiceProvider.php`
- Modify: `flexxus-picking-backend/app/Models/User.php`

**Step 1: Instalar Spatie Permission**

```bash
cd flexxus-picking-backend && composer require spatie/laravel-permission
```

**Step 2: Publicar configuración**

```bash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

**Step 3: Configurar AppServiceProvider**

En el método `boot()` agregar:
```php
\Spatie\Permission\Models\Role::observe(\App\Observers\RoleObserver::class);
```

**Step 4: Actualizar User model**

Agregar el trait y configuración de roles:
```php
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;
    
    // ...existing code...
}
```

**Step 5: Configurar permission en auth.php**

```php
// config/auth.php
'providers' => [
    'users' => [
        'driver' => 'eloquent',
        'model' => App\Models\User::class,
    ],
],
```

**Step 6: Run tests**

```bash
cd flexxus-picking-backend && php artisan test
```

Expected: All tests pass (puede fallar temporalmente)

**Step 7: Commit**

```bash
git add . && git commit -m "feat: install and configure Spatie Permission"
```

---

## Task 2: Agregar campo role a users

**Files:**
- Modify: `flexxus-picking-backend/database/migrations/0001_01_01_000000_create_users_table.php`
- Modify: `flexxus-picking-backend/app/Models/User.php`
- Modify: `flexxus-picking-backend/database/factories/UserFactory.php`
- Modify: `flexxus-picking-backend/database/seeders/UserSeeder.php`

**Step 1: Modificar migración de users**

Agregar después de `is_active`:
```php
$table->string('role')->default('empleado')->comment('admin|empleado');
```

**Step 2: Modificar User.php**

Agregar a $fillable:
```php
'role',
```

Agregar a casts:
```php
'role' => 'string',
```

**Step 3: Modificar UserFactory**

Agregar a definition():
```php
'role' => 'empleado',
```

**Step 4: Modificar UserSeeder**

Actualizar la creación de usuarios para incluir rol:
```php
$user->assignRole('empleado');
// o
$user->assignRole('admin');
```

**Step 5: Fresh migrate**

```bash
php artisan migrate:fresh --seed
```

**Step 6: Run tests**

```bash
cd flexxus-picking-backend && php artisan test
```

**Step 7: Commit**

```bash
git add . && git commit -m "feat: add role field to users"
```

---

## Task 3: Crear API Resource para User

**Files:**
- Create: `flexxus-picking-backend/app/Http/Resources/UserResource.php`
- Create: `flexxus-picking-backend/app/Http/Resources/UserCollection.php`

**Step 1: Crear UserResource**

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'warehouse' => $this->whenLoaded('warehouse', fn() => new WarehouseResource($this->warehouse)),
            'warehouses' => $this->whenLoaded('warehouses', fn() => WarehouseResource::collection($this->warehouses)),
            'can_override_warehouse' => $this->can_override_warehouse,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toDateString(),
            'updated_at' => $this->updated_at?->toDateString(),
        ];
    }
}
```

**Step 2: Crear WarehouseResource (si no existe)**

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WarehouseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'client' => $this->client,
            'branch' => $this->branch,
            'is_active' => $this->is_active,
        ];
    }
}
```

**Step 3: Commit**

```bash
git add . && git commit -m "feat: add User and Warehouse API Resources"
```

---

## Task 4: Crear UserService

**Files:**
- Create: `flexxus-picking-backend/app/Services/Admin/UserService.php`
- Create: `flexxus-picking-backend/app/Services/Admin/UserServiceInterface.php`

**Step 1: Escribir test primero**

```php
// tests/Unit/Services/Admin/UserServiceTest.php

<?php

namespace Tests\Unit\Services\Admin;

use App\Models\User;
use App\Services\Admin\UserService;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    private UserService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new UserService();
    }

    public function test_can_get_all_users_with_filters(): void
    {
        User::factory()->count(3)->create();

        $result = $this->service->getAll([]);

        $this->assertCount(3, $result);
    }

    public function test_can_filter_users_by_role(): void
    {
        User::factory()->create(['role' => 'admin']);
        User::factory()->create(['role' => 'empleado']);

        $result = $this->service->getAll(['role' => 'admin']);

        $this->assertCount(1, $result);
    }

    public function test_can_create_user(): void
    {
        $data = [
            'username' => 'newuser',
            'name' => 'New User',
            'email' => 'new@test.com',
            'password' => 'password123',
            'role' => 'empleado',
        ];

        $user = $this->service->create($data);

        $this->assertEquals('newuser', $user->username);
        $this->assertTrue($user->hasRole('empleado'));
    }

    public function test_can_update_user(): void
    {
        $user = User::factory()->create();

        $result = $this->service->update($user->id, ['name' => 'Updated Name']);

        $this->assertEquals('Updated Name', $result->name);
    }

    public function test_can_delete_user(): void
    {
        $user = User::factory()->create();

        $this->service->delete($user->id);

        $this->assertDeleted($user);
    }
}
```

**Step 2: Run test to verify it fails**

```bash
cd flexxus-picking-backend && php artisan test --filter=UserServiceTest
```

Expected: FAIL (class not found)

**Step 3: Crear UserServiceInterface**

```php
<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface UserServiceInterface
{
    public function getAll(array $filters): LengthAwarePaginator;
    public function findById(int $id): ?User;
    public function create(array $data): User;
    public function update(int $id, array $data): User;
    public function delete(int $id): void;
    public function assignWarehouse(int $userId, int $warehouseId): void;
    public function removeWarehouse(int $userId, int $warehouseId): void;
}
```

**Step 4: Implementar UserService**

```php
<?php

namespace App\Services\Admin;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class UserService implements UserServiceInterface
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = User::query()
            ->with(['warehouse', 'warehouses']);

        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        return $query->paginate(15);
    }

    public function findById(int $id): ?User
    {
        return User::with(['warehouse', 'warehouses'])->find($id);
    }

    public function create(array $data): User
    {
        $user = User::create([
            'username' => $data['username'],
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $data['role'] ?? 'empleado',
            'warehouse_id' => $data['warehouse_id'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'can_override_warehouse' => $data['can_override_warehouse'] ?? false,
        ]);

        $user->assignRole($data['role'] ?? 'empleado');

        return $user;
    }

    public function update(int $id, array $data): User
    {
        $user = User::findOrFail($id);

        $user->fill(array_filter($data, fn($key) => $key !== 'password', ARRAY_FILTER_USE_KEY));

        if (isset($data['password'])) {
            $user->password = $data['password'];
        }

        if (isset($data['role'])) {
            $user->syncRoles($data['role']);
        }

        $user->save();

        return $user->fresh(['warehouse', 'warehouses']);
    }

    public function delete(int $id): void
    {
        $user = User::findOrFail($id);
        $user->delete();
    }

    public function assignWarehouse(int $userId, int $warehouseId): void
    {
        $user = User::findOrFail($userId);
        $warehouse = Warehouse::findOrFail($warehouseId);

        $user->warehouses()->syncWithoutDetaching([$warehouse->id]);

        if (!$user->warehouse_id) {
            $user->warehouse_id = $warehouse->id;
            $user->save();
        }
    }

    public function removeWarehouse(int $userId, int $warehouseId): void
    {
        $user = User::findOrFail($userId);
        $user->warehouses()->detach($warehouseId);

        if ($user->warehouse_id == $warehouseId) {
            $user->warehouse_id = $user->warehouses()->first()?->id;
            $user->save();
        }
    }
}
```

**Step 5: Run tests**

```bash
cd flexxus-picking-backend && php artisan test --filter=UserServiceTest
```

Expected: PASS

**Step 6: Commit**

```bash
git add . && git commit -m "feat: add UserService for admin operations"
```

---

## Task 5: Crear UserController con permisos

**Files:**
- Create: `flexxus-picking-backend/app/Http/Controllers/Api/Admin/UserController.php`
- Modify: `flexxus-picking-backend/routes/api.php`

**Step 1: Escribir tests de feature**

```php
// tests/Feature/Admin/UserManagementTest.php

<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Warehouse;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $empleado;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->admin->givePermissionTo('admin.users.list', 'admin.users.create', 'admin.users.edit', 'admin.users.delete', 'admin.users.assign');
        
        $this->empleado = User::factory()->create(['role' => 'empleado']);
    }

    public function test_admin_can_list_users(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(200);
    }

    public function test_admin_can_create_user(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/admin/users', [
            'username' => 'newuser',
            'name' => 'New User',
            'email' => 'new@test.com',
            'password' => 'password123',
            'role' => 'empleado',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['username' => 'newuser']);
    }

    public function test_admin_can_update_user(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($this->admin);

        $response = $this->putJson("/api/admin/users/{$user->id}", [
            'name' => 'Updated Name',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('Updated Name', $user->fresh()->name);
    }

    public function test_admin_can_delete_user(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($this->admin);

        $response = $this->deleteJson("/api/admin/users/{$user->id}");

        $response->assertStatus(200);
        $this->assertDeleted($user);
    }

    public function test_empleado_cannot_access_admin_endpoints(): void
    {
        Sanctum::actingAs($this->empleado);

        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(403);
    }
}
```

**Step 2: Run test to verify it fails**

```bash
cd flexxus-picking-backend && php artisan test --filter=UserManagementTest
```

Expected: FAIL (404)

**Step 3: Crear UserController**

```php
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Admin\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['role', 'warehouse_id', 'is_active', 'search']);
        $users = $this->userService->getAll($filters);
        
        return UserResource::collection($users);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => 'required|string|unique:users,username',
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string|in:admin,empleado',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'can_override_warehouse' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $user = $this->userService->create($validated);
        
        return (new UserResource($user))->response()->setStatusCode(201);
    }

    public function show(int $id): UserResource
    {
        $user = $this->userService->findById($id);
        
        return new UserResource($user);
    }

    public function update(Request $request, int $id): UserResource
    {
        $validated = $request->validate([
            'username' => 'sometimes|string|unique:users,username,' . $id,
            'name' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'role' => 'sometimes|string|in:admin,empleado',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'can_override_warehouse' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $user = $this->userService->update($id, $validated);
        
        return new UserResource($user);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->userService->delete($id);
        
        return response()->json(['message' => 'User deleted successfully']);
    }
}
```

**Step 4: Agregar rutas**

```php
// routes/api.php - actualizar

use App\Http\Controllers\Api\Admin\UserController;

// ...existing routes...

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    // Warehouse endpoints (existing)
    Route::post('/users/{user}/warehouses/{warehouse}', [WarehouseController::class, 'assignToUser']);
    Route::delete('/users/{user}/warehouses/{warehouse}', [WarehouseController::class, 'removeFromUser']);
    Route::get('/users/{user}/warehouses', [WarehouseController::class, 'getUserWarehouse']);
    
    // User CRUD
    Route::apiResource('users', UserController::class)->parameters(['users' => 'user']);
    
    // Warehouses list
    Route::get('/warehouses', [WarehouseController::class, 'index']);
});
```

**Step 5: Run tests**

```bash
cd flexxus-picking-backend && php artisan test --filter=UserManagementTest
```

**Step 6: Commit**

```bash
git add . && git commit -m "feat: add UserController with CRUD and permissions"
```

---

## Task 6: Seeders para roles y permisos

**Files:**
- Create: `flexxus-picking-backend/database/seeders/RolePermissionSeeder.php`

**Step 1: Crear seeder**

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Permisos
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

        // Roles
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'sanctum']);
        $empleadoRole = Role::firstOrCreate(['name' => 'empleado', 'guard_name' => 'sanctum']);

        // Asignar todos los permisos a admin
        $adminRole->givePermissionTo(Permission::all());

        // Empleado no tiene permisos de admin
    }
}
```

**Step 2: Agregar a DatabaseSeeder**

```php
// database/seeders/DatabaseSeeder.php
$this->call([
    // ...existing
    RolePermissionSeeder::class,
    // ...
]);
```

**Step 3: Run seeder**

```bash
php artisan db:seed --class=RolePermissionSeeder
```

**Step 4: Commit**

```bash
git add . && git commit -m "feat: add roles and permissions seeders"
```

---

## Task 7: Agregar middleware de permisos

**Files:**
- Modify: `flexxus-picking-backend/app/Http/Kernel.php` (o `bootstrap/app.php`)

**Step 1: Registrar middleware**

En Laravel 11+ (bootstrap/app.php):
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
        'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
    ]);
})
```

**Step 2: Actualizar rutas para usar middleware**

```php
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    // ...
});
```

**Step 3: Commit**

```bash
git add . && git commit -m "feat: add role middleware to routes"
```

---

## Task 8: Integration tests finales

**Step 1: Run all tests**

```bash
cd flexxus-picking-backend && php artisan test
```

**Step 2: Probar endpoints manualmente**

```bash
# Login como admin
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Listar usuarios
curl http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer TOKEN"

# Crear usuario
curl -X POST http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","name":"New User","email":"new@test.com","password":"password"}'
```

**Step 3: Commit final**

```bash
git add . && git commit -m "feat: complete admin user management API"
```

---

## Resumen de archivos

### Nuevos
- `app/Services/Admin/UserService.php`
- `app/Services/Admin/UserServiceInterface.php`
- `app/Http/Resources/UserResource.php`
- `app/Http/Resources/UserCollection.php`
- `app/Http/Resources/WarehouseResource.php`
- `app/Http/Controllers/Api/Admin/UserController.php`
- `database/seeders/RolePermissionSeeder.php`
- Tests correspondientes

### Modificados
- `app/Models/User.php` (HasRoles)
- `routes/api.php`
- `composer.json` (spatie)
- Migration users (role)
- Factories y Seeders

---

## Uso

```bash
# Sincronizar depósitos
php artisan flexxus:sync-warehouses

# Listar usuarios con filtros
GET /api/admin/users?role=empleado&is_active=true&search=juan

# Crear usuario
POST /api/admin/users
{
  "username": "juan",
  "name": "Juan Pérez",
  "email": "juan@test.com",
  "password": "password123",
  "role": "empleado",
  "warehouse_id": 1
}

# Asignar depósito
POST /api/admin/users/1/warehouses/2

# Quitar depósito
DELETE /api/admin/users/1/warehouses/2
```
