# Fix: Operarios Solo Un Warehouse - No Override

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure operarios (empleados) have only ONE warehouse and cannot override. Only admins can have multiple warehouses and override capability.

**Architecture:** 
- Operarios: Solo `warehouse_id`, `can_override_warehouse = false`, lista `warehouses` vacía/oculta
- Admins: `can_override_warehouse = true`, múltiples warehouses en lista

**Tech Stack:** Laravel 12, PHP 8.2

---

## Current Issue

User created shows:
- `warehouse`: DON BOSCO (id 1)
- `warehouses`: [RONDEAU (id 2), GILISHOP (id 3)]
- `can_override_warehouse`: false

This is wrong - operarios should NOT have extra warehouses in the list.

---

### Task 1: Hide warehouses list when user cannot override

**Files:**
- Modify: `flexxus-picking-backend/app/Http/Resources/UserResource.php`

**Step 1: Modify UserResource to only show warehouses when can_override_warehouse is true**

```php
// In app/Http/Resources/UserResource.php, modify line 19:
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
git commit -m "fix: hide warehouses list for users without override permission"
```

---

### Task 2: Prevent assigning extra warehouses to empleados

**Files:**
- Modify: `flexxus-picking-backend/app/Http/Controllers/Api/Admin/UserController.php`
- Modify: `flexxus-picking-backend/app/Services/Admin/UserService.php`

**Step 1: Add authorization check in assignWarehouse endpoint**

First, check if there's an endpoint for assigning warehouses:

```bash
grep -r "assignWarehouse" flexxus-picking-backend/app/Http/Controllers/Api/Admin/
```

**Step 2: Modify UserService::assignWarehouse to prevent for empleados**

In `UserService.php`, add check:

```php
public function assignWarehouse(int $userId, int $warehouseId): void
{
    $user = User::findOrFail($userId);
    $warehouse = Warehouse::findOrFail($warehouseId);

    // Only allow for admins with can_override_warehouse
    if (!$user->can_override_warehouse) {
        throw new \Exception('Only users with override permission can have multiple warehouses');
    }

    $user->warehouses()->syncWithoutDetaching([$warehouse->id]);
}
```

**Step 3: Run tests**

```bash
php artisan test
```

**Step 4: Commit**

```bash
git add flexxus-picking-backend/app/Services/Admin/UserService.php
git commit -m "fix: prevent assigning warehouses to users without override permission"
```

---

### Task 3: Clean up existing data (optional - manual)

If existing users have extra warehouses incorrectly, admin needs to clean up via:
- `DELETE /api/admin/users/{id}/warehouses/{warehouse_id}` for each extra warehouse

---

### Task 4: Verify the fix works

**Step 1: Test with operario user**

```bash
# Create a new user with role empleado and warehouse_id
curl -X POST http://localhost:8000/api/admin/users \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "operario_test",
    "name": "Operario Test",
    "email": "operario_test@picking.app",
    "password": "password123",
    "role": "empleado",
    "warehouse_id": 1
  }'

# Get user detail - should NOT have warehouses array or it should be empty
curl -X GET http://localhost:8000/api/admin/users/<id> \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <admin_token>"
```

Expected: `warehouses` should be `null` or not present.

**Step 2: Test trying to assign warehouse to operario (should fail)**

```bash
curl -X POST http://localhost:8000/api/admin/users/<id>/warehouses/2 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <admin_token>"

Expected: 403 or error message

# Run full test suite
php artisan test

Expected: All tests pass
```

---

## Summary

This fix ensures:
1. Operarios only see their primary warehouse (field `warehouse`)
2. Operarios cannot have extra warehouses assigned
3. The `warehouses` list is hidden for users without override permission
4. Only admins can have multiple warehouses and override capability
