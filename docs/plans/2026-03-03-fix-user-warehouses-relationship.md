# Fix Missing `warehouses` Relationship in User Model

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add missing `warehouses()` relationship to User model to fix "undefined relationship" errors in admin endpoints.

**Architecture:** Add a simple alias method `warehouses()` that points to the existing `availableWarehouses()` relationship in the User model.

**Tech Stack:** Laravel 12, Eloquent ORM

---

## Root Cause Analysis

The User model defines `availableWarehouses()` relationship (line 53-57), but:
- `UserService.php` uses `$user->warehouses()` (lines 93, 104, 107)
- `UserResource.php` uses `$this->warehouses` (line 19)
- These call the non-existent relationship `warehouses()`

**Solution:** Add a `warehouses()` method that aliases `availableWarehouses()`.

---

### Task 1: Add `warehouses()` Relationship to User Model

**Files:**
- Modify: `flexxus-picking-backend/app/Models/User.php`

**Step 1: Write the failing test**

Create a test to verify the relationship exists:

```bash
# First, verify the bug exists by running a test that uses warehouses relationship
php artisan test --filter="test_user_has_warehouses_relationship" 2>&1 | head -30
```

Or run the actual API endpoint to see the error:

```bash
# Test GET /api/admin/users (will fail with relationship error)
curl -X GET http://localhost:8000/api/admin/users \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <token>"
```

**Step 2: Add the warehouses() relationship**

Modify `flexxus-picking-backend/app/Models/User.php`:

Add this method after line 57 (after `availableWarehouses()` method):

```php
public function warehouses(): BelongsToMany
{
    return $this->availableWarehouses();
}
```

**Step 3: Verify the fix works**

Run the tests:

```bash
php artisan test
```

Expected: All tests pass.

**Step 4: Commit**

```bash
git add flexxus-picking-backend/app/Models/User.php
git commit -m "fix: add warehouses() relationship alias to User model"
```

---

### Task 2: Verify All Admin Endpoints Work

**Step 1: Test each endpoint**

```bash
# Test GET /api/admin/users
curl -X GET http://localhost:8000/api/admin/users \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <token>"

# Test GET /api/admin/users/1
curl -X GET http://localhost:8000/api/admin/users/1 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <token>"

# Test PUT /api/admin/users/1 (with valid data)
curl -X PUT http://localhost:8000/api/admin/users/1 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

Expected: All return valid JSON (not 500 error).

**Step 2: Run full test suite**

```bash
php artisan test
```

Expected: All 136+ tests pass.

---

## Summary

This is a one-line fix: add a `warehouses()` method that aliases the existing `availableWarehouses()` relationship. The bug was simply a naming mismatch between the model and the service/resource code.
