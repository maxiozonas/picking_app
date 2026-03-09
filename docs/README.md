# Documentation Index

Welcome to the Picking App documentation. This directory contains comprehensive guides for the warehouse-flexxus-credentials implementation.

## 📚 Documentation

### API Documentation

- **[Warehouse Management API](./warehouse-management-api.md)**
  - Admin endpoints for warehouse assignment
  - Flexxus credential management endpoints
  - Request/response examples
  - Error handling

### Architecture & Design

- **[Multi-Account Flexxus Architecture](./flexxus-multi-account-architecture.md)**
  - Factory pattern for warehouse-scoped clients
  - Token caching strategy
  - Security and encryption details
  - Performance considerations

### Features & Mechanisms

- **[Warehouse Override Mechanism](./warehouse-override-mechanism.md)**
  - Admin override via `X-Warehouse-Override` header
  - Simplified operator model (no `original_warehouse_id`)
  - Temporary override vs permanent assignment
  - Security and authorization

### Migration Guides

- **[Flexxus Credentials Migration](./flexxus-credentials-migration.md)** (Coming Soon)
  - Migrating from global .env credentials to per-warehouse credentials
  - Step-by-step migration process
  - Rollback procedures

## 🔑 Key Concepts

### Simplified Warehouse Model

The system now uses a simplified operator warehouse model:

**Before (Complex):**
```
users table:
- warehouse_id (current assignment)
- original_warehouse_id (permanent assignment) ❌ REMOVED
- override_expires_at (temporary override)
```

**After (Simple):**
```
users table:
- warehouse_id (current assignment)
- override_expires_at (temporary override)
```

### Multi-Account Flexxus

Each warehouse can have its own Flexxus ERP credentials:

```php
// Warehouse model
$warehouse->flexxus_url        // e.g., "https://centro.flexxus.com"
$warehouse->flexxus_username   // Encrypted at rest
$warehouse->flexxus_password   // Encrypted at rest
```

### Admin Override

Admins can temporarily override their warehouse context per-request:

```http
GET /api/picking/orders
X-Warehouse-Override: 2
Authorization: Bearer {admin_token}
```

## 🚀 Quick Start

### For Developers

1. Read the [Multi-Account Flexxus Architecture](./flexxus-multi-account-architecture.md) to understand the system design
2. Review the [Warehouse Management API](./warehouse-management-api.md) for integration examples
3. Check [AGENTS.md](../AGENTS.md) for coding conventions and patterns

### For Administrators

1. Start with [Warehouse Management API](./warehouse-management-api.md) to learn how to manage warehouses
2. Use the [Flexxus Credentials Migration](./flexxus-credentials-migration.md) guide when setting up credentials
3. Reference the [Warehouse Override Mechanism](./warehouse-override-mechanism.md) for admin operations

## 📖 Additional Resources

- **[AGENTS.md](../AGENTS.md)** - Development guide for coding agents and contributors
- **[README.md](../README.md)** - Project overview and setup instructions

## 🏗️ Project Structure

```
picking.app/
├── docs/                          # This directory
│   ├── warehouse-management-api.md
│   ├── flexxus-multi-account-architecture.md
│   ├── warehouse-override-mechanism.md
│   └── README.md (this file)
├── flexxus-picking-backend/       # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/Admin/
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   ├── Services/
│   │   │   ├── Admin/
│   │   │   └── Picking/
│   │   └── Exceptions/
│   ├── database/
│   │   └── migrations/
│   └── tests/
│       ├── Unit/
│       └── Feature/
└── AGENTS.md                      # Coding conventions
```

## 📝 Version History

### v1.1.0 (2026-03-09) - Multi-Account Flexxus & Simplified Warehouse Model

**Added:**
- Per-warehouse Flexxus credentials management
- Admin warehouse override mechanism via `X-Warehouse-Override` header
- WarehouseService layer for credential operations
- Comprehensive documentation

**Removed:**
- `original_warehouse_id` field from users table (simplified model)

**Improved:**
- Security: Credentials encrypted at rest
- Flexibility: Multi-tenant warehouse support
- Performance: Per-warehouse token caching

---

**Last Updated:** 2026-03-09
**Documentation Version:** 1.1.0
**Framework:** Laravel 12 (PHP 8.2+)
