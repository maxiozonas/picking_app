# Design: Auth System with Warehouse Override

**Date:** 2026-03-02
**Author:** OpenCode AI Agent
**Status:** Approved
**Phase:** Fase 1 - Login + Auth + Warehouse Management

## Overview

Sistema de autenticación local independiente con gestión de depósitos y capacidades de override temporal. Implementa el patrón Service Layer con Repositories para separación de responsabilidades.

## Architecture Pattern

**Enfoque A: Monolito Modular con Service Layer**

```
Request → Controller → Service → Repository → Model → DB
         ↓            ↓         ↓
    Validation   Business Logic   Data Access
```

## Data Model

### Users Table

**Schema:**
```php
$table->id();
$table->string('username')->unique();
$table->string('name');
$table->string('email')->unique();
$table->foreignId('warehouse_id')->nullable()->constrained()->nullOnDelete();
$table->boolean('is_active')->default(true);
$table->boolean('can_override_warehouse')->default(false); // NEW
$table->timestamp('last_login_at')->nullable();
$table->timestamp('override_expires_at')->nullable(); // NEW
$table->timestamps();
$table->rememberToken();
```

**Relationships:**
- `warehouse()`: BelongsTo Warehouse (depósito principal)
- `overrideWarehouse()`: BelongsTo Warehouse (depósito temporal activo)
- `availableWarehouses()`: BelongsToMany (si tiene permisos de override)

### Warehouses Table

**Schema:**
```php
$table->id();
$table->string('code')->unique();       // Código de Flexxus (ej: "DEPO-CEN")
$table->string('name');                  // Nombre descriptivo
$table->string('flexxus_id')->nullable(); // ID en sistema Flexxus
$table->boolean('is_active')->default(true);
$table->timestamps();
```

### User_Warehouse Table (Pivot - Override Permissions)

**Schema:**
```php
$table->id();
$table->foreignId('user_id')->constrained()->cascadeOnDelete();
$table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
$table->timestamps();

$table->unique(['user_id', 'warehouse_id']);
```

**Purpose:** Define qué depósitos adicionales puede acceder un usuario con `can_override_warehouse = true`.

## API Endpoints

### POST /api/auth/login

**Request:**
```json
{
  "username": "operario1",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "1|xxxxxxxxxxxxxxxxxxxxx",
    "user": {
      "id": 1,
      "username": "operario1",
      "name": "Juan Pérez",
      "can_override_warehouse": false,
      "override_expires_at": null,
      "current_warehouse": {
        "id": 1,
        "code": "DEPO-CEN",
        "name": "Depósito Central"
      },
      "available_warehouses": [
        {
          "id": 1,
          "code": "DEPO-CEN",
          "name": "Depósito Central"
        }
      ]
    }
  }
}
```

**Error Responses:**

401 - Invalid credentials:
```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "errors": {
    "username": ["Estas credenciales no coinciden con nuestros registros."]
  }
}
```

403 - Inactive user:
```json
{
  "success": false,
  "message": "Usuario inactivo. Contacte al administrador."
}
```

### GET /api/auth/me

**Auth Required:** Yes (Bearer token)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "operario1",
      "name": "Juan Pérez",
      "can_override_warehouse": false,
      "override_expires_at": "2026-03-02T18:00:00.000000Z",
      "current_warehouse": {
        "id": 2,
        "code": "DEPO-NOR",
        "name": "Depósito Norte",
        "is_override": true
      },
      "available_warehouses": [
        {"id": 1, "code": "DEPO-CEN", "name": "Depósito Central"},
        {"id": 2, "code": "DEPO-NOR", "name": "Depósito Norte"}
      ]
    }
  }
}
```

**Logic:**
- `current_warehouse`: Retorna `warehouse_id` (principal) o el override si está activo
- `is_override`: Flag indicando si es un depósito temporal
- `available_warehouses`: Solo si `can_override_warehouse = true`

### POST /api/auth/logout

**Auth Required:** Yes (Bearer token)

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

### POST /api/auth/override-warehouse

**Auth Required:** Yes (Bearer token)
**Permission Required:** `can_override_warehouse = true`

**Request:**
```json
{
  "warehouse_id": 2,
  "duration_minutes": 120
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "override_expires_at": "2026-03-02T18:00:00.000000Z",
    "current_warehouse": {
      "id": 2,
      "code": "DEPO-NOR",
      "name": "Depósito Norte"
    }
  }
}
```

**Validations:**
- User must have `can_override_warehouse = true`
- `warehouse_id` must be in `available_warehouses`
- `duration_minutes`: Optional, default 60, max 480 (8 hours)

## Service Layer

### AuthService Interface

```php
namespace App\Services\Auth;

interface AuthServiceInterface
{
    /**
     * Authenticate user and generate token
     */
    public function login(string $username, string $password): array;

    /**
     * Revoke current user token
     */
    public function logout(User $user): void;

    /**
     * Get current user data with warehouse context
     */
    public function me(User $user): array;

    /**
     * Set temporary warehouse override
     */
    public function overrideWarehouse(
        User $user,
        int $warehouseId,
        int $durationMinutes
    ): array;

    /**
     * Clear warehouse override
     */
    public function clearOverride(User $user): void;

    /**
     * Check if user has access to warehouse
     */
    public function canAccessWarehouse(User $user, int $warehouseId): bool;
}
```

### AuthRepository Interface

```php
namespace App\Repositories\Auth;

interface AuthRepositoryInterface
{
    public function findByUsername(string $username): ?User;
    public function updateLastLogin(User $user): void;
    public function setWarehouseOverride(User $user, int $warehouseId, \DateTime $expiresAt): void;
    public function clearWarehouseOverride(User $user): void;
    public function getAvailableWarehouses(User $user): \Illuminate\Support\Collection;
}
```

## Middleware

### WarehouseContext

**Purpose:** Inject `current_warehouse` en requests autenticados.

**Behavior:**
```php
// Validates override expiration
if ($user->override_expires_at && $user->override_expires_at->isPast()) {
    $user->update(['override_expires_at' => null, 'warehouse_id' => $user->warehouse_id]);
}

// Adds to request
$request->merge(['current_warehouse_id' => $user->current_warehouse_id]);
```

## Validation Rules

### LoginRequest
```php
'username' => 'required|string|max:255',
'password' => 'required|string|min:6',
```

### OverrideWarehouseRequest
```php
'warehouse_id' => 'required|integer|exists:warehouses,id',
'duration_minutes' => 'nullable|integer|min:15|max:480',
```

## Business Logic

### Login Flow

1. Validate request
2. Find user by username
3. Check if user is active (`is_active = true`)
4. Verify password
5. Create Sanctum token
6. Update `last_login_at`
7. Return token + user + warehouse data

### Override Warehouse Flow

1. Validate user has `can_override_warehouse = true`
2. Validate warehouse is in `available_warehouses`
3. Calculate expiration (default 60 min, max 8 hours)
4. Store override in `override_expires_at` field
5. Return new warehouse context

### Auto-Expire Override

- Middleware checks `override_expires_at` on each authenticated request
- If expired: clear override, revert to `warehouse_id`

## Security Considerations

1. **Token Expiration:** Sanctum tokens can be set to expire (recommended: 8 hours)
2. **Override Timeout:** Default 60 min, max 8 hours
3. **Password Hashing:** Laravel default bcrypt
4. **Rate Limiting:** Implement throttle on login endpoint (5 attempts per minute)
5. **Audit Trail:** Log login/logout/override events (future: `picking_events` table)

## Database Indexes

```sql
-- Performance optimization
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_warehouse ON users(warehouse_id);
CREATE INDEX idx_users_override_expires ON users(override_expires_at);
CREATE INDEX idx_user_warehouse ON user_warehouse(user_id, warehouse_id);
```

## Future Enhancements

- Multi-factor authentication (MFA)
- Role-based permissions (RBAC)
- Session management (multiple concurrent logins)
- OAuth2 integration (optional, per brief)
- Audit trail with `picking_events` table

## Dependencies

- Laravel Sanctum: API token authentication
- Laravel 12: Framework
- MySQL: Database (XAMPP)

## Testing Strategy

**Unit Tests:**
- AuthService::login() with valid credentials
- AuthService::login() with invalid credentials
- AuthService::login() with inactive user
- AuthService::overrideWarehouse() permissions check
- AuthRepository::findByUsername()

**Feature Tests:**
- POST /api/auth/login success case
- POST /api/auth/login invalid credentials
- GET /api/auth/me with warehouse override
- POST /api/auth/override-warehouse authorization
- Middleware auto-expire override

## Success Criteria

✅ User can authenticate with username/password
✅ Inactive users cannot login
✅ Token returned works for authenticated requests
✅ User context includes warehouse information
✅ Users with override permission can switch warehouses
✅ Override expires automatically
✅ Clear separation between Service and Repository layers
✅ All endpoints documented and tested
