# Fix: Admins No Necesitan Warehouses

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Admins no tienen warehouses. Solo operarios (empleados) tienen exactamente 1 warehouse asignado por el admin.

**Architecture:** 
- Admins: `warehouse_id = null`, `can_override_warehouse = false`, no warehouses list
- Operarios: Exactamente 1 `warehouse_id`, no override capability

**Tech Stack:** Laravel 12, PHP 8.2

---

### Task 1: Update UserResource to hide all warehouse fields for admins

**Files:**
- Modify: `flexxus-picking-backend/app/Http/Resources/UserResource.php`

**Step 1: Modify UserResource to hide warehouse fields for admins**

Currently showing warehouse/warehouses for all users. Change to only show for empleados.

```php
// In app/Http/Resources/UserResource.php:
// Hide warehouse and warehouses for admins, show only for empleados
'warehouse' => $this->whenLoaded('warehouse', fn () => 
    $this->role === 'empleado' ? new WarehouseResource($this->warehouse) : null
),
'warehouses' => $this->whenLoaded('warehouses', fn () => 
    $this->can_override_warehouse 
        ? WarehouseResource::collection($this->warehouses) 
        : null
),
```

**Step 2: Run tests**

```bash
php artisan test
```

**Step 3: Commit**

```bash
git add flexxus-picking-backend/app/Http/Resources/UserResource.php
git commit -m "fix: hide warehouse fields for admin users"
```

---

### Task 2: Update UserService to require warehouse_id only for empleados

**Files:**
- Modify: `flexxus-picking-backend/app/Services/Admin/UserService.php`

**Step 1: Modify create to set warehouse_id null for admins**

In `create()` method, if role is admin, set warehouse_id to null:

```php
public function create(array $data): User
{
    $user = User::create([
        'username' => $data['username'],
        'name' => $data['name'],
        'email' => $data['email'],
        'password' => $data['password'],
        'role' => $data['role'] ?? 'empleado',
        'warehouse_id' => ($data['role'] ?? 'empleado') === 'empleado' 
            ? ($data['warehouse_id'] ?? null) 
            : null,
        'is_active' => $data['is_active'] ?? true,
        'can_override_warehouse' => false, // Always false
    ]);

    $user->assignRole($data['role'] ?? 'empleado');

    return $user;
}
```

**Step 2: Modify update to reset warehouse_id to null for admins**

In `update()` method, if role changes to admin, clear warehouse_id:

```php
public function update(int $id, array $data): User
{
    $user = User::findOrFail($id);

    $user->fill(array_filter($data, fn ($key) => $key !== 'password', ARRAY_FILTER_USE_KEY));

    // If role changed to admin, clear warehouse
    if (isset($data['role']) && $data['role'] === 'admin') {
        $user->warehouse_id = null;
    }

    if (isset($data['password'])) {
        $user->password = $data['password'];
    }

    if (isset($data['role'])) {
        $user->syncRoles($data['role']);
    }

    $user->save();

    return $user->fresh(['warehouse', 'warehouses']);
}
```

**Step 3: Run tests**

```bash
php artisan test
```

**Step 4: Commit**

```bash
git add flexxus-picking-backend/app/Services/Admin/UserService.php
git commit -m "fix: admins don't have warehouses, only empleados"
```

---

### Task 3: Update validation to make warehouse_id required only for empleados

**Files:**
- Modify: `flexxus-picking-backend/app/Http/Controllers/Api/Admin/UserController.php`

**Step 1: Update store validation**

```php
public function store(Request $request): JsonResponse
{
    $validated = $request->validate([
        'username' => 'required|string|unique:users,username',
        'name' => 'required|string',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:6',
        'role' => 'nullable|string|in:admin,empleado',
        'warehouse_id' => 'required_if:role,empleado|nullable|exists:warehouses,id',
        'can_override_warehouse' => 'nullable|boolean', // Will be ignored, always false
        'is_active' => 'nullable|boolean',
    ]);

    // Force can_override_warehouse to false
    $validated['can_override_warehouse'] = false;

    $user = $this->userService->create($validated);

    return (new UserResource($user))->response()->setStatusCode(201);
}
```

**Step 2: Update update validation**

```php
public function update(Request $request, int $id): JsonResponse
{
    $validated = $request->validate([
        'username' => 'sometimes|string|unique:users,username,'.$id,
        'name' => 'sometimes|string',
        'email' => 'sometimes|email|unique:users,email,'.$id,
        'password' => 'sometimes|string|min:6',
        'role' => 'sometimes|string|in:admin,empleado',
        'warehouse_id' => 'nullable|exists:warehouses,id', // Nullable, will be cleared for admins
        'can_override_warehouse' => 'nullable|boolean', // Will be ignored
        'is_active' => 'nullable|boolean',
    ]);

    // Force can_override_warehouse to false
    $validated['can_override_warehouse'] = false;

    $user = $this->userService->update($id, $validated);

    return new UserResource($user);
}
```

**Step 3: Run tests**

```bash
php artisan test
```

**Step 4: Commit**

```bash
git add flexxus-picking-backend/app/Http/Controllers/Api/Admin/UserController.php
git commit -m "fix: validate warehouse_id required only for empleados"
```

---

### Task 4: Verify the fix works

**Step 1: Test creating admin user (should have no warehouse)**

```bash
curl -X POST http://localhost:8000/api/admin/users \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin2",
    "name": "Admin Dos",
    "email": "admin2@picking.app",
    "password": "password123",
    "role": "admin"
  }'

# Response should have: warehouse: null, warehouses: null
```

**Step 2: Test creating empleado (should require warehouse_id)**

```bash
curl -X POST http://localhost:8000/api/admin/users \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "operario2",
    "name": "Operario Dos",
    "email": "operario2@picking.app",
    "password": "password123",
    "role": "empleado",
    "warehouse_id": 1
  }'

# Should work with warehouse_id
```

**Step 3: Test creating empleado without warehouse_id (should fail)**

```bash
curl -X POST http://localhost:8000/api/admin/users \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "operario3",
    "name": "Operario Tres",
    "email": "operario3@picking.app",
    "password": "password123",
    "role": "empleado"
  }'

# Should return validation error: warehouse_id is required
```

**Step 4: Run full test suite**

```bash
php artisan test
```

---

### Task 5: Update Postman Collection

**Files:**
- Modify: `docs/Picking-App-API.postman_collection.json`

**Step 1: Find the Postman collection file**

```bash
ls -la docs/*.json
```

**Step 2: Update Create User request examples**

In the Postman collection, find the "Create User" request in Admin folder:

1. **Admin user example** - Remove `warehouse_id` and `can_override_warehouse`:
```json
{
    "username": "admin",
    "name": "Administrador",
    "email": "admin@picking.app",
    "password": "password123",
    "role": "admin"
}
```

2. **Empleado user example** - Include `warehouse_id`, no `can_override_warehouse`:
```json
{
    "username": "operario1",
    "name": "Operario Depósito Central",
    "email": "operario1@picking.app",
    "password": "password123",
    "role": "empleado",
    "warehouse_id": 1
}
```

**Step 3: Remove endpoint for assigning warehouses**

Remove or deprecate these endpoints as they're no longer needed:
- `POST /api/admin/users/{id}/warehouses/{warehouse_id}`
- `DELETE /api/admin/users/{id}/warehouses/{warehouse_id}`
- `GET /api/admin/users/{id}/warehouses`

Add a note in the collection description explaining that:
- Admins don't have warehouses
- Empleados have exactly 1 warehouse assigned at creation
- The warehouses assignment endpoints are deprecated

**Step 4: Commit**

```bash
git add docs/Picking-App-API.postman_collection.json
git commit -m "docs: update Postman collection for new user-warehouse model"
```

---

## Summary

- Admins: No warehouse, no override, no warehouses list
- Empleados: Exactly 1 warehouse, no override, no warehouses list
- can_override_warehouse: Always false (ignored in requests)
