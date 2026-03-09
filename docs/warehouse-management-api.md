# Admin Warehouse Management API

## Overview

The Admin Warehouse Management API provides endpoints for administrators to manage warehouse assignments and Flexxus credentials for employees.

**Base URL:** `/api/admin`

**Authentication:** Requires Bearer token with admin role

**Authorization:** All endpoints require `role: admin`

---

## Warehouse Assignment Endpoints

### Get User Warehouse

Retrieve the current warehouse assignment for an employee.

```http
GET /api/admin/users/{user}/warehouses
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `user` | integer | Yes | User ID |

**Response (200 OK):**

```json
{
  "data": {
    "warehouse": {
      "id": 1,
      "code": "CENTRO",
      "name": "Depósito Centro",
      "client": "CLIENT_A",
      "branch": "MATRIZ",
      "is_active": true
    }
  }
}
```

**Response (404 Not Found):**

```json
{
  "message": "No query results for model [App\\Models\\User] {id}"
}
```

---

### Assign Warehouse to User

Assign a warehouse to an employee. This sets the employee's primary warehouse.

```http
POST /api/admin/users/{user}/warehouses/{warehouse}
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `user` | integer | Yes | User ID (must have role: empleado) |
| `warehouse` | integer | Yes | Warehouse ID |

**Response (200 OK):**

```json
{
  "message": "Warehouse assigned successfully",
  "data": {
    "user_id": 42,
    "warehouse_id": 1,
    "warehouse": {
      "id": 1,
      "code": "CENTRO",
      "name": "Depósito Centro"
    }
  }
}
```

**Response (422 Unprocessable Entity):**

```json
{
  "message": "Only employees can have warehouses assigned"
}
```

**Side Effects:**
- Sets `user.warehouse_id` to the specified warehouse
- Clears `user.override_expires_at` (removes any temporary overrides)
- Employee will immediately see orders from the new warehouse

---

### Remove Warehouse from User

Remove a warehouse assignment from an employee.

```http
DELETE /api/admin/users/{user}/warehouses/{warehouse}
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `user` | integer | Yes | User ID |
| `warehouse` | integer | Yes | Warehouse ID |

**Response (200 OK):**

```json
{
  "message": "Warehouse removed successfully"
}
```

**Response (422 Unprocessable Entity):**

```json
{
  "message": "Cannot remove primary warehouse. Assign a new warehouse first."
}
```

**Note:** You cannot remove the primary warehouse assignment. The employee must always have exactly one warehouse assigned.

---

## Warehouse Flexxus Credentials Endpoints

### List All Warehouses

Get a list of all active warehouses with their credential status.

```http
GET /api/admin/warehouses
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": 1,
      "code": "CENTRO",
      "name": "Depósito Centro",
      "client": "CLIENT_A",
      "branch": "MATRIZ",
      "is_active": true,
      "has_flexxus_credentials": true
    },
    {
      "id": 2,
      "code": "NORTE",
      "name": "Depósito Norte",
      "client": "CLIENT_A",
      "branch": "NORTE",
      "is_active": true,
      "has_flexxus_credentials": false
    }
  ]
}
```

---

### Update Warehouse Flexxus Credentials

Set or update the Flexxus ERP credentials for a specific warehouse.

```http
PUT /api/admin/warehouses/{warehouse}/flexxus-credentials
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `warehouse` | integer | Yes | Warehouse ID |

**Request Body:**

```json
{
  "flexxus_url": "https://flexxus.example.com",
  "flexxus_username": "warehouse_user",
  "flexxus_password": "secure_password"
}
```

**Validation Rules:**

- `flexxus_url`: Required, valid URL
- `flexxus_username`: Required, string
- `flexxus_password`: Required, string

**Response (200 OK):**

```json
{
  "message": "Warehouse Flexxus credentials updated successfully",
  "data": {
    "id": 1,
    "code": "CENTRO",
    "name": "Depósito Centro",
    "has_flexxus_credentials": true
  }
}
```

**Security Notes:**
- Credentials are encrypted using Laravel's encryption (APP_KEY)
- Credentials are stored in the database (`warehouses` table)
- Each warehouse can have different Flexxus credentials
- The `flexxus_password` is encrypted using the `encrypted` cast

**Side Effects:**
- Updates `warehouse.flexxus_url`
- Updates `warehouse.flexxus_username` (encrypted)
- Updates `warehouse.flexxus_password` (encrypted)
- Flexxus API calls for this warehouse will use these credentials immediately

---

### Clear Warehouse Flexxus Credentials

Remove Flexxus credentials from a warehouse.

```http
DELETE /api/admin/warehouses/{warehouse}/flexxus-credentials
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `warehouse` | integer | Yes | Warehouse ID |

**Response (200 OK):**

```json
{
  "message": "Warehouse Flexxus credentials cleared successfully",
  "data": {
    "id": 1,
    "code": "CENTRO",
    "name": "Depósito Centro",
    "has_flexxus_credentials": false
  }
}
```

**Side Effects:**
- Sets `flexxus_url`, `flexxus_username`, and `flexxus_password` to NULL
- Warehouse will fall back to global config credentials (if configured)
- Useful for migrating credentials back to .env or for testing

**Backward Compatibility:**

When a warehouse has no credentials configured (NULL), the FlexxusClient automatically falls back to global configuration:

```php
// config/flexxus.php
'username' => env('FLEXXUS_USERNAME'),
'password' => env('FLEXXUS_PASSWORD'),
'url' => env('FLEXXUS_URL'),
```

This allows gradual migration from global credentials to per-warehouse credentials without downtime.

---

## Error Responses

All endpoints follow the standard error response format:

### 401 Unauthorized

```json
{
  "message": "Unauthenticated."
}
```

### 403 Forbidden

```json
{
  "message": "This action is unauthorized."
}
```

### 404 Not Found

```json
{
  "message": "No query results for model [App\\Models\\Warehouse] {id}"
}
```

### 422 Unprocessable Entity

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "flexxus_url": ["The flexxus url field is required."],
    "flexxus_username": ["The flexxus username field is required."]
  }
}
```

---

## Related Documentation

- [Warehouse Override Mechanism](./warehouse-override-mechanism.md)
- [Multi-Account Flexxus Architecture](./flexxus-multi-account-architecture.md)
- [Flexxus Credentials Migration Guide](./flexxus-credentials-migration.md)
