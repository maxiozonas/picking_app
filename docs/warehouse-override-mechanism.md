# Warehouse Override Mechanism

## Overview

The Warehouse Override Mechanism allows administrators to temporarily override an employee's assigned warehouse for API requests. This enables admins to perform actions on behalf of employees in different warehouses without permanently changing their assignment.

**Use Cases:**
- Admin testing orders in different warehouses
- Cross-warehouse troubleshooting
- Temporary warehouse coverage during absences
- Multi-warehouse management from a single admin account

---

## How It Works

### Normal Flow (Without Override)

```
Employee Request → API → Uses user.warehouse_id → Filters data by warehouse
```

### Override Flow (With Admin Override)

```
Admin Request → WarehouseOverrideMiddleware → Extracts override → Sets in request context → API uses override warehouse ID
```

---

## Implementation Details

### Middleware: `WarehouseOverrideMiddleware`

**Location:** `app/Http/Middleware/WarehouseOverrideMiddleware.php`

**Applied to:** All API routes under `/api`

**Execution Order:** Early in middleware stack (before authentication)

### Detection Methods

The override warehouse ID can be provided via:

1. **HTTP Header (Preferred):**

```http
X-Warehouse-Override: 2
```

2. **Query Parameter:**

```http
GET /api/picking/orders?override_warehouse_id=2
```

**Priority:** Header takes precedence over query parameter if both are provided.

### Validation

- Override value must be a valid integer
- Invalid values are silently ignored (no error thrown)
- Must be authenticated as a user with admin privileges
- The override warehouse ID is stored in `request->attributes->get('override_warehouse_id')`

---

## Usage Examples

### cURL Examples

**Using Header (Recommended):**

```bash
curl -X GET https://api.example.com/api/picking/orders \
  -H "Authorization: Bearer {admin_token}" \
  -H "X-Warehouse-Override: 2"
```

**Using Query Parameter:**

```bash
curl -X GET https://api.example.com/api/picking/orders?override_warehouse_id=2 \
  -H "Authorization: Bearer {admin_token}"
```

### JavaScript/axios Example

```javascript
const response = await axios.get('/api/picking/orders', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Warehouse-Override': '2'
  }
});
```

---

## Authorization

### Who Can Use Override?

Only users with the **admin role** can use the warehouse override mechanism.

**Authorization Check:**

```php
// In controllers or services
if ($user->role !== 'admin') {
    throw new UnauthorizedOperationException(
        'warehouse_override',
        ['user_id' => $user->id, 'role' => $user->role]
    );
}
```

**Security Implications:**

- Regular employees (role: `empleado`) **CANNOT** override their warehouse
- Attempts by non-admins are ignored (middleware doesn't throw error for security)
- All override actions are logged in application logs

---

## Integration with Controllers

### Recommended Pattern

Controllers should check for override in the request context:

```php
public function index(Request $request)
{
    $user = $request->user();
    $warehouseId = $this->getEffectiveWarehouseId($request, $user);

    // Use $warehouseId for filtering
    $orders = $this->pickingService->getOrdersByWarehouse($warehouseId);

    return PickingOrderResource::collection($orders);
}

private function getEffectiveWarehouseId(Request $request, User $user): int
{
    // Check for admin override
    $overrideId = $request->attributes->get('override_warehouse_id');

    if ($overrideId !== null && $user->role === 'admin') {
        return $overrideId;
    }

    // Fall back to user's assigned warehouse
    return $user->warehouse_id;
}
```

---

## Simplified Operator Model

### Before (Complex - With `original_warehouse_id`)

```php
// users table
- warehouse_id (current assignment)
- original_warehouse_id (permanent assignment) // REMOVED
- override_expires_at (temporary override expiration)

// Confusing: which warehouse is "real"?
```

### After (Simple - Only `warehouse_id`)

```php
// users table
- warehouse_id (current assignment)
- override_expires_at (temporary override expiration)

// Clear: warehouse_id is always the current warehouse
```

**Benefits of Simplified Model:**

1. **Single Source of Truth:** Only `warehouse_id` determines the employee's warehouse
2. **No Confusion:** No ambiguity about which warehouse is "permanent" vs "temporary"
3. **Simpler Queries:** No joins or conditions on `original_warehouse_id`
4. **Easier Testing:** One field to test instead of two
5. **Better Performance:** Fewer database columns and joins

**Temporary Override Mechanism (for Employees):**

```php
// Set temporary override (expires in 24 hours)
$user->update([
    'warehouse_id' => $newWarehouseId,
    'override_expires_at' => now()->addHours(24),
]);

// Check if override is active
if ($user->override_expires_at && $user->override_expires_at->isPast()) {
    // Revert to original warehouse
    $user->update([
        'warehouse_id' => $originalWarehouseId,
        'override_expires_at' => null,
    ]);
}
```

**Admin Override (Per-Request):**

```http
// Admin can override per-request without modifying database
GET /api/picking/orders
X-Warehouse-Override: 2
```

---

## Error Handling

### Invalid Override Values

```php
// These are silently ignored (no override applied)
X-Warehouse-Override: "abc"        // Not an integer
X-Warehouse-Override: "2.5"        // Not a whole number
X-Warehouse-Override: ""           // Empty string
```

### Non-Admin Users

If a non-admin user attempts to use override:

```http
// Employee request (ignored)
GET /api/picking/orders
X-Warehouse-Override: 2

// Response: Uses employee's own warehouse (warehouse_id)
// No error thrown (security best practice)
```

### Non-Existent Warehouse

If the override warehouse ID doesn't exist:

```php
// The service layer will throw a 404
// Example: Warehouse::findOrFail($overrideId)
// Response: 404 Not Found
```

---

## Logging and Auditing

### Application Logs

All override attempts are logged:

```
[2026-03-09 12:34:56] local.INFO: Warehouse override used
  user_id: 1
  override_warehouse_id: 2
  original_warehouse_id: 1
  endpoint: /api/picking/orders
```

### Audit Trail

For compliance and debugging, consider adding:

```php
// In app/Services/AuditService.php
public function logWarehouseOverride(User $user, int $overrideWarehouseId, string $endpoint)
{
    AuditLog::create([
        'user_id' => $user->id,
        'action' => 'warehouse_override',
        'details' => [
            'override_warehouse_id' => $overrideWarehouseId,
            'original_warehouse_id' => $user->warehouse_id,
            'endpoint' => $endpoint,
        ],
        'ip_address' => request()->ip(),
        'user_agent' => request()->userAgent(),
    ]);
}
```

---

## Testing

### Example Test Case

```php
public function test_admin_can_override_warehouse_via_header()
{
    // Arrange
    $admin = User::factory()->admin()->create(['warehouse_id' => 1]);
    $warehouse2 = Warehouse::factory()->create(['id' => 2]);

    // Act
    $response = $this->actingAs($admin)
        ->withHeader('X-Warehouse-Override', '2')
        ->getJson('/api/picking/orders');

    // Assert
    $response->assertStatus(200);
    // Orders should be from warehouse 2, not admin's warehouse (1)
}

public function test_employee_cannot_override_warehouse()
{
    // Arrange
    $employee = User::factory()->empleado()->create(['warehouse_id' => 1]);

    // Act
    $response = $this->actingAs($employee)
        ->withHeader('X-Warehouse-Override', '2')
        ->getJson('/api/picking/orders');

    // Assert
    $response->assertStatus(200);
    // Orders should be from employee's warehouse (1), override ignored
}
```

---

## Migration from `original_warehouse_id`

If your system previously used `original_warehouse_id`:

1. **Database Migration:**

```php
// Run this migration
Schema::table('users', function (Blueprint $table) {
    $table->dropForeign(['original_warehouse_id']);
    $table->dropColumn('original_warehouse_id');
});
```

2. **Code Updates:**

- Remove all references to `$user->original_warehouse_id`
- Update queries to use only `warehouse_id`
- Use admin override mechanism for per-request overrides

3. **Data Migration (if needed):**

```php
// If you had important data in original_warehouse_id
foreach (User::whereNotNull('original_warehouse_id')->get() as $user) {
    // Decide: keep warehouse_id or revert to original_warehouse_id?
    // Usually warehouse_id is correct (it's the current assignment)
    // original_warehouse_id is just historical context
}
```

---

## Related Documentation

- [Admin Warehouse Management API](./warehouse-management-api.md)
- [Multi-Account Flexxus Architecture](./flexxus-multi-account-architecture.md)
- [Security and Authorization](./security-authorization.md)
