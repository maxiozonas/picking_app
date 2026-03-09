# 🔧 Flexxus Picking Backend

[![Tests](https://img.shields.io/badge/tests-141%20passing-brightgreen)](../../tests/)
[![Laravel](https://img.shields.io/badge/Laravel-12.x-red.svg)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2%2B-blue.svg)](https://php.net)

Backend API REST con **Laravel 12** para el sistema de gestión de pedidos picking. Integración en tiempo real con **Flexxus ERP** para validación de stock y sincronización de pedidos.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Development](#-development)

---

## 🎯 Overview

Este backend proporciona una **API REST completa** para la aplicación móvil de picking. Se conecta al ERP Flexxus para obtener datos de pedidos y stock en tiempo real, mientras mantiene una base de datos local para rastrear el progreso de preparación de pedidos.

### Key Responsibilities

- 🔐 **Autenticación de usuarios** con Laravel Sanctum
- 📦 **Gestión de pedidos** de retiro en sucursal (EXPEDICION)
- 🏭 **Asignación de depósitos** a operarios
- ✅ **Seguimiento de progreso** de preparación de pedidos
- 🔍 **Validación de stock** en tiempo real vía Flexxus API
- 🚨 **Sistema de alertas** para reportar problemas
- 👥 **Gestión de usuarios** (Admin y Operarios)

---

## ✨ Features

### Authentication & Authorization
- ✅ Token-based authentication con **Laravel Sanctum**
- ✅ Role-based access control con **Spatie Permissions**
- ✅ Login/logout/me endpoints
- ✅ Warehouse override para admins

### Picking Orders Management
- ✅ Listado de pedidos con filtros (status, search)
- ✅ Detalle de pedido con items completos
- ✅ Iniciar preparación de pedido
- ✅ Marcar items como completados
- ✅ Validar y completar pedido
- ✅ Sistema de alertas integrado

### Flexxus Integration
- ✅ **HTTP Client** con retry logic
- ✅ **Warehouses sync** - Sincronización de depósitos
- ✅ **Orders by date** - Pedidos por fecha y depósito
- ✅ **Order detail** - Detalle completo con items
- ✅ **Stock validation** - Validación de stock en tiempo real

### Code Quality
- ✅ **141 tests** pasando
- ✅ **Service Layer Pattern** para lógica de negocio
- ✅ **Form Request Validation** para validación
- ✅ **API Resources** para transformación de respuestas
- ✅ **PSR-12 compliance** con Laravel Pint

---

## 🏗️ Architecture

### Service Layer Pattern

```
┌─────────────────────────────────────────────┐
│              Controller                      │
│    (HTTP Request/Response - Delgado)         │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│           Form Request                       │
│        (Validation Logic)                    │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│             Service                          │
│      (Business Logic - Interface + Impl)     │
└───┬───────────────────────────┬─────────────┘
    │                           │
    ↓                           ↓
┌─────────────────┐     ┌──────────────────┐
│   Repository    │     │   Flexxus API    │
│  (Local Data)   │     │  (External ERP)  │
└─────────────────┘     └──────────────────┘
    │
    ↓
┌─────────────────┐
│      Model      │
│  (Eloquent ORM) │
└─────────────────┘
```

### Directory Structure

```
app/
├── Http/
│   ├── Controllers/Api/
│   │   ├── AuthController.php           # Auth endpoints
│   │   ├── PickingController.php        # Picking endpoints
│   │   └── Admin/
│   │       ├── UserController.php       # User management
│   │       └── WarehouseController.php  # Warehouse assignment
│   ├── Requests/
│   │   ├── LoginRequest.php             # Auth validation
│   │   └── Picking/
│   │       ├── StartOrderRequest.php    # Start order validation
│   │       ├── PickItemRequest.php      # Pick item validation
│   │       └── CompleteOrderRequest.php # Complete order validation
│   └── Resources/
│       ├── AuthResource.php             # Auth response
│       ├── PickingOrderResource.php     # Order response
│       ├── PickingOrderDetailResource.php
│       └── PickingOrderItemResource.php # Item response
│
├── Services/
│   ├── Auth/
│   │   ├── AuthService.php              # Auth logic
│   │   └── AuthServiceInterface.php     # Auth contract
│   ├── Picking/
│   │   ├── PickingService.php           # Picking logic
│   │   ├── PickingServiceInterface.php  # Picking contract
│   │   └── FlexxusPickingService.php    # Flexxus integration
│   └── Admin/
│       ├── UserService.php              # User management logic
│       └── UserServiceInterface.php
│
├── Models/
│   ├── User.php                         # User model
│   ├── Warehouse.php                    # Warehouse model
│   ├── PickingOrderProgress.php         # Order progress
│   ├── PickingItemProgress.php          # Item progress
│   └── PickingAlert.php                 # Alerts
│
└── Exceptions/
    ├── AuthenticationValidationException.php
    └── AuthorizationValidationException.php
```

---

## 📦 Requirements

- **PHP 8.2+**
- **Composer 2.x**
- **MySQL 8.0+** (or SQLite for development)
- **Extensions**: BCMath, Ctype, cURL, DOM, Fileinfo, JSON, Mbstring, OpenSSL, PCRE, PDO, Tokenizer, XML

---

## 🚀 Installation

> **Quick Start for XAMPP Users**: Follow the [Local Setup Guide (XAMPP MySQL)](docs/local-setup-xampp-mysql.md) for detailed step-by-step instructions.

### 1. Clone Repository
```bash
git clone https://github.com/maxiozonas/picking_app.git
cd picking_app/flexxus-picking-backend
```

### 2. Install Dependencies
```bash
composer install
```

### 3. Environment Setup
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Database Configuration

**For XAMPP MySQL local development**, see [Local Setup Guide (XAMPP MySQL)](docs/local-setup-xampp-mysql.md).

Edit `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=picking_app
DB_USERNAME=root
DB_PASSWORD=
```

> ⚠️ **XAMPP Default**: XAMPP MySQL uses `root` username with empty password by default.

### 5. Run Migrations
```bash
php artisan migrate:fresh --seed
```

This will create:
- ✅ Users table (admin + operarios)
- ✅ Warehouses table
- ✅ Picking orders progress table
- ✅ Picking items progress table
- ✅ Picking alerts table
- ✅ Roles and permissions

### 6. Start Development Server
```bash
php artisan serve
```

Backend running on: **http://localhost:8000**

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# App
APP_NAME="Flexxus Picking Backend"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=picking_app
DB_USERNAME=root
DB_PASSWORD=your_password_here

# Flexxus API Integration
FLEXXUS_API_URL=https://apiapp.flexxus.com.ar/v2
FLEXXUS_API_USERNAME=your_flexxus_username
FLEXXUS_API_PASSWORD=your_flexxus_password

# Sanctum (API Authentication)
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:8000,localhost:19000,localhost:19001,127.0.0.1:8000

# Cache
CACHE_STORE=database

# Session
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=debug
```

> ⚠️ **Security Warning**: Never commit `.env` file to version control. Use `.env.example` as template.

### Flexxus API Configuration

The system requires valid Flexxus API credentials. Configure in `.env`:

```env
FLEXXUS_API_URL=https://apiapp.flexxus.com.ar/v2
FLEXXUS_API_USERNAME=your_username
FLEXXUS_API_PASSWORD=your_password
```

The Flexxus client is configured in `config/flexxus.php`:

```php
return [
    'api_url' => env('FLEXXUS_API_URL'),
    'username' => env('FLEXXUS_API_USERNAME'),
    'password' => env('FLEXXUS_API_PASSWORD'),
    'timeout' => 30,
    'retry_times' => 3,
    'retry_sleep' => 100,
];
```

---

## 📚 API Endpoints

### Base URL
```
Development: http://localhost:8000/api
Production:  https://your-domain.com/api
```

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}

Response 200:
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "warehouse": null
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}

Response 200:
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin",
  "warehouse": null
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}

Response 200:
{
  "message": "Successfully logged out"
}
```

### Picking Orders Endpoints

#### List Orders
```http
GET /api/picking/orders
Authorization: Bearer {token}

Query Parameters:
  - status: all|pending|in_progress|completed (default: pending,in_progress)
  - search: NP 123456 (search by order number)
  - page: 1 (pagination)

Response 200:
{
  "data": [
    {
      "id": 1,
      "order_number": "NP 123456",
      "customer": "Constructoria ABC",
      "status": "pending",
      "items_picked": 0,
      "total_items": 5,
      "assigned_to": null,
      "created_at": "2026-03-03T12:00:00.000000Z"
    }
  ]
}
```

#### Order Detail
```http
GET /api/picking/orders/{order_number}
Authorization: Bearer {token}

Response 200:
{
  "id": 1,
  "order_number": "NP 123456",
  "customer": "Constructoria ABC",
  "status": "pending",
  "items": [
    {
      "product_code": "MAT001",
      "description": "Cemento 50kg",
      "quantity": 10,
      "picked_quantity": 0,
      "warehouse": "RONDEAU",
      "location": "A-12-3",
      "lot": "LOT-2026-001",
      "stock": 150
    }
  ]
}
```

#### Start Order
```http
POST /api/picking/orders/{order_number}/start
Authorization: Bearer {token}

Response 200:
{
  "message": "Order started successfully",
  "order": {...}
}
```

#### Pick Item
```http
POST /api/picking/orders/{order_number}/items/{product_code}/pick
Authorization: Bearer {token}

{
  "quantity": 5,
  "mark_as_completed": false
}

Response 200:
{
  "message": "Item updated successfully",
  "item": {...}
}
```

#### Complete Order
```http
POST /api/picking/orders/{order_number}/complete
Authorization: Bearer {token}

Response 200:
{
  "message": "Order completed successfully",
  "order": {...}
}

Error 422 (incomplete items):
{
  "message": "Cannot complete order with incomplete items. Missing: MAT001, MAT002"
}
```

### Alerts Endpoints

#### List Alerts
```http
GET /api/picking/alerts
Authorization: Bearer {token}

Response 200:
{
  "data": [
    {
      "id": 1,
      "order_number": "NP 123456",
      "type": "stock_issue",
      "message": "Stock insufficient",
      "resolved": false
    }
  ]
}
```

#### Create Alert
```http
POST /api/picking/alerts
Authorization: Bearer {token}

{
  "order_number": "NP 123456",
  "type": "stock_issue",
  "message": "Stock insufficient for MAT001"
}

Response 201:
{
  "alert": {...}
}
```

#### Resolve Alert
```http
PATCH /api/picking/alerts/{id}
Authorization: Bearer {token}

{
  "resolved": true
}

Response 200:
{
  "alert": {...}
}
```

### Admin Endpoints (Admin Role Required)

#### List Users
```http
GET /api/admin/users
Authorization: Bearer {token}

Response 200:
{
  "data": [...]
}
```

#### Create User
```http
POST /api/admin/users
Authorization: Bearer {token}

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "role": "operario",
  "warehouse_id": 1
}

Response 201:
{
  "user": {...}
}
```

#### Assign Warehouse
```http
POST /api/admin/users/{id}/warehouse
Authorization: Bearer {token}

{
  "warehouse_id": 2
}

Response 200:
{
  "message": "Warehouse assigned successfully"
}
```

---

## 🧪 Testing

### Run All Tests
```bash
php artisan test
```

Output:
```
PASS  Tests\Unit\Services\PickingServiceTest
✓ Picking service can get available orders
✓ Picking service starts order and creates items
✓ Picking service picks item with correct quantity
✓ Picking service detects when all items are completed
✓ Picking service completes order
✓ Picking service validates incomplete order
✓ ... and more

PASS  Tests\Feature\Picking\PickingControllerTest
✓ It can list picking orders
✓ It can start picking order
✓ It can pick item
✓ It can complete order
✓ ... and more

Tests:    141 passed
Duration: 15.23s
```

### Run Specific Test Suite
```bash
# Unit tests only
php artisan test tests/Unit/

# Feature tests only
php artisan test tests/Feature/

# Specific test class
php artisan test tests/Unit/Services/PickingServiceTest.php

# Single test method
php artisan test --filter test_picking_order_belongs_to_user
```

### Test Coverage
```bash
# Requires Xdebug installed
php artisan test --coverage
```

### Testing Utilities
```bash
# Reset database with seed data
php artisan migrate:fresh --seed

# View specific table
php artisan db:table picking_orders_progress
```

---

## 💻 Development

### Code Quality

```bash
# Format code with Laravel Pint
php artisan pint

# Check without modifying
php artisan pint --test
```

### Database Management

```bash
# Fresh start (WARNING: deletes all data)
php artisan migrate:fresh --seed

# Rollback last migration
php artisan migrate:rollback

# Check migration status
php artisan migrate:status
```

### Development Server

```bash
# Start Laravel server
php artisan serve

# Custom port
php artisan serve --port=8080
```

### Logs

```bash
# Real-time log monitoring
php artisan pail

# Tail specific log file
tail -f storage/logs/laravel.log
```

### Routes

```bash
# List all routes
php artisan route:list

# List API routes only
php artisan route:list --path=api

# List picking routes
php artisan route:list --path=picking
```

### Cache Management

```bash
# Clear all caches
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear

# Cache configuration
php artisan config:cache
```

---

## 📖 Additional Documentation

- [AGENTS.md](../../AGENTS.md) - Guía completa para agentes de codificación
- [docs/plans/](../../docs/plans/) - Planes de implementación detallados
- [docs/CHEATSHEET_ENDPOINTS.md](../../docs/CHEATSHEET_ENDPOINTS.md) - Referencia rápida de endpoints

---

## 🔐 Security Best Practices

- ✅ Never commit `.env` files
- ✅ Use strong passwords for production
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated (`composer update`)
- ✅ Enable CSRF protection
- ✅ Validate all user input (Form Requests)
- ✅ Use prepared statements (Eloquent ORM)
- ✅ Implement rate limiting
- ✅ Log authentication attempts

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `APP_ENV=production` and `APP_DEBUG=false`
- [ ] Set strong `APP_KEY`
- [ ] Configure production database
- [ ] Set correct `APP_URL`
- [ ] Configure `SANCTUM_STATEFUL_DOMAINS`
- [ ] Set up SSL certificate
- [ ] Configure CORS for mobile app domain
- [ ] Set up queue worker (`php artisan queue:work`)
- [ ] Set up task scheduling (`php artisan schedule:work`)
- [ ] Run `php artisan config:cache`
- [ ] Run `php artisan route:cache`
- [ ] Run `php artisan view:cache`

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **Maximiliano Ozonas** - [maxiozonas](https://github.com/maxiozonas)

---

## 🙏 Acknowledgments

- **Laravel** - The PHP Framework for Web Artisans
- **Laravel Sanctum** - Lightweight API Authentication
- **Spatie Permissions** - Role/Permission management
- **Guzzle** - PHP HTTP Client
- **Flexxus** - ERP System Integration

---

**Built with ❤️ using Laravel 12**
