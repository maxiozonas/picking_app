# Fix: Admin User Management Endpoints

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure admin can properly manage users and assign warehouses to empleados with correct error handling.

**Architecture:**
- Admin can create, edit, delete users
- Admin can assign/change warehouse for empleados only
- Empleados have exactly 1 warehouse (primary)
- Proper error handling and validation

**Tech Stack:** Laravel 12, PHP 8.2

---

## Current Issues

1. **WarehouseController::assignToUser** - Doesn't check if user is empleado, doesn't set as primary warehouse_id
2. **WarehouseController::removeFromUser** - Similar issues
3. **UserService::assignWarehouse** - Checks for can_override_warehouse (deprecated concept)
4. **UserController update** - Doesn't properly handle clearing warehouses when changing to admin

---

### Task 1: Fix WarehouseController to properly assign warehouse to empleado

**Files:**
- Modify: `flexxus-picking-backend/app/Http/Controllers/Api/Admin/WarehouseController.php`

**Step 1: Fix assignToUser method**

Replace the entire method:

```php
public function assignToUser(int $userId, int $warehouseId): JsonResponse
{
    $user = User::findOrFail($userId);
    $warehouse = Warehouse::findOrFail($warehouseId);

    if ($user->role !== 'empleado') {
        return response()->json([
            'message' => 'Only employees can have warehouses assigned',
        ], 422);
    }

    $user->warehouse_id = $warehouse->id;
    $user->save();

    return response()->json([
        'message' => 'Warehouse assigned successfully',
        'data' => [
            'user_id' => $user->id,
            'warehouse_id' => $warehouse->id,
            'warehouse' => [
                'id' => $warehouse->id,
                'code' => $warehouse->code,
                'name' => $warehouse->name,
            ],
        ],
    ]);
}
```

**Step 2: Fix removeFromUser method**

```php
public function removeFromUser(int $userId, int $warehouseId): JsonResponse
{
    $user = User::findOrFail($userId);
    $warehouse = Warehouse::findOrFail($warehouseId);

    if ($user->role !== 'empleado') {
        return response()->json([
            'message' => 'Only employees can have warehouses modified',
        ], 422);
    }

    if ($user->warehouse_id === $warehouse->id) {
        return response()->json([
            'message' => 'Cannot remove primary warehouse. Assign a new warehouse first.',
        ], 422);
    }

    return response()->json([
        'message' => 'Warehouse removed successfully',
    ]);
}
```

**Step 3: Fix getUserWarehouse method**

```php
public function getUserWarehouse(int $userId): JsonResponse
{
    $user = User::findOrFail($userId);

    if ($user->role !== 'empleado') {
        return response()->json([
            'message' => 'Only employees have warehouses',
        ], 422);
    }

    if (!$user->warehouse) {
        return response()->json([
            'data' => [
                'warehouse' => null,
            ],
        ]);
    }

    return response()->json([
        'data' => [
            'warehouse' => [
                'id' => $user->warehouse->id,
                'code' => $user->warehouse->code,
                'name' => $user->warehouse->name,
                'client' => $user->warehouse->client,
                'branch' => $user->warehouse->branch,
                'is_active' => $user->warehouse->is_active,
            ],
        ],
    ]);
}
```

**Step 4: Run tests**

```bash
php artisan test
```

**Step 5: Commit**

```bash
git add app/Http/Controllers/Api/Admin/WarehouseController.php
git commit -m "fix: properly handle warehouse assignment for empleados"
```

---

### Task 2: Fix UserService to remove deprecated can_override_warehouse logic

**Files:**
- Modify: `flexxus-picking-backend/app/Services/Admin/UserService.php`

**Step 1: Fix assignWarehouse method**

Replace lines 94-109:

```php
public function assignWarehouse(int $userId, int $warehouseId): void
{
    $user = User::findOrFail($userId);
    $warehouse = Warehouse::findOrFail($warehouseId);

    if ($user->role !== 'empleado') {
        throw new \Exception('Only employees can have warehouses assigned');
    }

    $user->warehouse_id = $warehouse->id;
    $user->save();
}
```

**Step 2: Fix removeWarehouse method**

Replace lines 111-120:

```php
public function removeWarehouse(int $userId, int $warehouseId): void
{
    $user = User::findOrFail($userId);

    if ($user->role !== 'empleado') {
        throw new \Exception('Only employees can have warehouses modified');
    }

    if ($user->warehouse_id === $warehouseId) {
        throw new \Exception('Cannot remove primary warehouse. Assign a new warehouse first.');
    }
}
```

**Step 3: Run tests**

```bash
php artisan test
```

**Step 4: Commit**

```bash
git add app/Services/Admin/UserService.php
git commit -m "fix: remove deprecated can_override_warehouse logic"
```

---

### Task 3: Update UserController to handle warehouse properly on update

**Files:**
- Modify: `flexxus-picking-backend/app/Http/Controllers/Api/Admin/UserController.php`

**Step 1: Improve update method to handle role changes**

The update method should:
- If role changes to admin, clear warehouse_id
- If warehouse_id changes for empleado, update it properly

The current logic is mostly correct but we need to ensure it clears properly.

**Step 2: Run tests**

```bash
php artisan test
```

**Step 3: Commit**

```bash
git add app/Http/Controllers/Api/Admin/UserController.php
git commit -m "fix: ensure warehouse cleared when changing to admin role"
```

---

### Task 4: Verify all admin endpoints work correctly

**Step 1: Run full test suite**

```bash
php artisan test
```

**Step 2: Manual testing with curl**

Test creating a user:
```bash
curl -X POST http://localhost:8000/api/admin/users \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "name": "Test User",
    "email": "test@picking.app",
    "password": "password123",
    "role": "empleado",
    "warehouse_id": 1
  }'
```

Test assigning warehouse to empleado:
```bash
curl -X POST http://localhost:8000/api/admin/users/2/warehouses/1 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <token>"
```

Test assigning warehouse to admin (should fail):
```bash
curl -X POST http://localhost:8000/api/admin/users/1/warehouses/1 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <token>"
```

---

## Summary

After fixes:
- Admin can create users (empleado with warehouse_id required, admin without)
- Admin can edit users (including changing warehouse for empleados)
- Admin can delete users
- Admin can assign/change warehouse for empleados only
- Proper error messages for invalid operations
- No null fields in responses
