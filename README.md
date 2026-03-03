# 🏗️ Flexxus Picking App

[![Tests](https://img.shields.io/badge/tests-141%20passing-brightgreen)](tests/)
[![Laravel](https://img.shields.io/badge/Laravel-12.x-red.svg)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2%2B-blue.svg)](https://php.net)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Sistema completo de gestión de pedidos **picking** para corralones (construcción) con integración en tiempo real a **Flexxus ERP**.

> **Propósito:** Permitir a empleados de depósito ver, preparar y completar pedidos de retiro en sucursal con validación de stock en tiempo real.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Development](#-development)
- [Documentation](#-documentation)

---

## 🎯 Overview

Este sistema resuelve el problema de **preparación de pedidos** en un corralón de construcción, donde:

- 📦 **Clientes retiran en sucursal** (EXPEDICION)
- 🏭 **Múltiples depósitos** con stock separado
- 👥 **Operarios asignados** a depósitos específicos
- ✅ **Validación de stock** en tiempo real vía Flexxus API
- 📱 **Interfaz móvil** para preparación de pedidos in-situ

**Arquitectura Híbrida:**
```
Flexxus API (ERP) ←───────┐
     ↓                      │
   Read-only                │
     ↓                      │
  Pedidos/Stock      ←──────┘
                          ↓
                   Laravel Backend
                   (Local Progress)
                          ↓
                   React Native Mobile
```

---

## ✨ Features

### Backend (Laravel API)
- ✅ **Autenticación con Sanctum** - Token-based API auth
- ✅ **Gestión de usuarios** - Admins y Operarios con roles
- ✅ **Asignación de depósitos** - 1 operario = 1 depósito
- ✅ **Picking Orders API** - Listado, filtros, búsqueda
- ✅ **Orden Detail API** - Items con ubicaciones y stock
- ✅ **Start Order** - Crea registros de progreso
- ✅ **Pick Item** - Marca items como completados
- ✅ **Complete Order** - Valida y finaliza pedidos
- ✅ **Alert System** - Reporta problemas en tiempo real
- ✅ **Integración Flexxus** - Client HTTP con retry logic
- ✅ **141 tests passing** - Cobertura completa

### Mobile (React Native)
- 🚧 **En desarrollo** - Estructura inicial lista

---

## 🏗️ Architecture

### Service Layer Pattern
```
┌─────────────┐
│  Controller │ ← HTTP Request/Response (delgado)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ FormRequest │ ← Validación de datos
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Service   │ ← Lógica de negocio (interface + impl)
└──────┬──────┘
       │
       ├──────────────────┐
       ↓                  ↓
┌─────────────┐   ┌──────────────┐
│  Repository │   │ Flexxus API  │ ← External service
└─────────────┘   └──────────────┘
       │
       ↓
┌─────────────┐
│    Model    │ ← Eloquent ORM
└─────────────┘
```

### Key Design Principles
- **Interface Segregation** - Services implementan interfaces
- **Dependency Injection** - Constructor injection
- **Single Responsibility** - 1 responsabilidad por clase
- **Open/Closed** - Abierto a extensión, cerrado a modificación
- **API Resources** - Transformación de respuestas
- **TDD** - Tests antes de implementación

---

## 🛠️ Tech Stack

### Backend
```
Laravel 12 (PHP 8.2+)
├── Sanctum (API Auth)
├── Spatie Permissions (Roles/Permissions)
├── Guzzle (HTTP Client)
├── MySQL / SQLite
└── PHPUnit (Testing)
```

### Mobile
```
React Native + Expo
└── (En desarrollo)
```

---

## 📁 Project Structure

```
picking_app/
├── flexxus-picking-backend/     # Laravel API REST
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/    # API endpoints
│   │   │   ├── Requests/           # Form validation
│   │   │   └── Resources/          # API resources
│   │   ├── Services/               # Business logic
│   │   ├── Models/                 # Eloquent models
│   │   └── Exceptions/             # Custom exceptions
│   ├── tests/                     # 141 tests
│   ├── database/                  # Migrations + Seeders
│   └── routes/                    # API routes
│
├── flexxus-picking-mobile/      # React Native (Expo)
│   └── (Próximamente)
│
├── docs/                        # Project documentation
│   ├── plans/                   # Implementation plans
│   └── prueba-picking-concept/  # Proof of concept
│
├── AGENTS.md                    # Agent coding guidelines
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **PHP 8.2+**
- **Composer**
- **MySQL** (XAMPP / Laragon)
- **Node.js 18+** (para mobile)

### Backend Setup

```bash
# 1. Navigate to backend
cd flexxus-picking-backend

# 2. Install dependencies
composer install

# 3. Copy environment file
cp .env.example .env

# 4. Generate application key
php artisan key:generate

# 5. Configure database in .env
# Edit .env and set:
# DB_DATABASE=picking_app
# DB_USERNAME=root
# DB_PASSWORD=your_password

# 6. Run migrations with seed data
php artisan migrate:fresh --seed

# 7. Start development server
php artisan serve

# Backend running on: http://localhost:8000
```

### Mobile Setup

```bash
# 1. Navigate to mobile
cd flexxus-picking-mobile

# 2. Install dependencies
npm install

# 3. Start Expo
npx expo start

# Scan QR code with Expo Go app
```

---

## ⚙️ Configuration

### Environment Variables (.env)

**Required variables:**
```env
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
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:8000,localhost:19000,127.0.0.1:8000

# App
APP_NAME="Flexxus Picking"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
```

> ⚠️ **Security:** Nunca commitear `.env` al repositorio. Usar `.env.example` como template.

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:8000/api
Production:  https://your-domain.com/api
```

### Authentication Flow

```bash
# 1. Login
POST /api/auth/login
Body: {
  "username": "admin",
  "password": "password"
}
Response: {
  "user": {...},
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

# 2. Use token in subsequent requests
GET /api/picking/orders
Headers: {
  "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Main Endpoints

#### Authentication
```
POST   /api/auth/login              # Login & get token
POST   /api/auth/logout             # Logout (invalidate token)
GET    /api/auth/me                 # Get current user
```

#### Picking Orders
```
GET    /api/picking/orders                      # List orders
GET    /api/picking/orders?status=all           # Filter by status
GET    /api/picking/orders?search=NP%20123456   # Search by order number
GET    /api/picking/orders/{order_number}       # Order detail (with items)
POST   /api/picking/orders/{order_number}/start # Start picking
POST   /api/picking/orders/{order_number}/items/{product_code}/pick  # Pick item
POST   /api/picking/orders/{order_number}/complete                 # Complete order
```

#### Alerts
```
GET    /api/picking/alerts            # List alerts
POST   /api/picking/alerts            # Create alert
PATCH  /api/picking/alerts/{id}       # Resolve alert
```

#### Admin (Admin role required)
```
GET    /api/admin/users               # List users
POST   /api/admin/users               # Create user
PATCH  /api/admin/users/{id}          # Update user
POST   /api/admin/users/{id}/warehouse  # Assign warehouse
```

### Response Format

**Success Response:**
```json
{
  "data": [
    {
      "id": 1,
      "order_number": "NP 123456",
      "customer": "Constructoria ABC",
      "status": "in_progress",
      "items_picked": 3,
      "total_items": 5,
      "assigned_to": {
        "id": 2,
        "name": "Juan Pérez"
      }
    }
  ]
}
```

**Error Response:**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "quantity": [
      "The quantity must be at least 1."
    ]
  }
}
```

---

## 🧪 Testing

### Run All Tests
```bash
php artisan test
# Output: OK (141 tests, 456 assertions)
```

### Run Specific Test
```bash
# Single test method
php artisan test --filter test_picking_order_belongs_to_user

# Specific test class
php artisan test tests/Unit/Services/PickingServiceTest.php

# Feature tests only
php artisan test tests/Feature/
```

### Test Coverage
```bash
# With Xdebug installed
php artisan test --coverage
```

### Test Data
- **141 tests** covering all functionality
- **456 assertions** validating behavior
- **Factories** for realistic test data
- **RefreshDatabase** for isolated tests

---

## 💻 Development

### Code Style
```bash
# Format code with Laravel Pint
php artisan pint

# Check without modifying
php artisan pint --test
```

### Database
```bash
# Fresh start (WARNING: deletes data)
php artisan migrate:fresh --seed

# Rollback last migration
php artisan migrate:rollback

# View specific table
php artisan db:table picking_orders_progress
```

### Logs
```bash
# Real-time logs
php artisan pail

# Tail specific log
tail -f storage/logs/laravel.log
```

### Routes
```bash
# List all API routes
php artisan route:list --path=api

# List picking routes
php artisan route:list --path=picking
```

---

## 📖 Documentation

### Project Documentation
- [AGENTS.md](AGENTS.md) - Guía para agentes de codificación
- [docs/plans/](docs/plans/) - Planes de implementación detallados
- [docs/CHEATSHEET_ENDPOINTS.md](docs/CHEATSHEET_ENDPOINTS.md) - Referencia rápida de endpoints

### Key Architecture Documents
- [docs/GUIA_DESARROLLO_COMPLETA.md](docs/GUIA_DESARROLLO_COMPLETA.md) - Guía completa de desarrollo
- [docs/DECISION_AUTENTICACION_DIRECTIVOS.md](docs/DECISION_AUTENTICACION_DIRECTIVOS.md) - Decisiones de arquitectura

### API Testing
- [docs/POSTMAN_TESTING_GUIDE.md](docs/POSTMAN_TESTING_GUIDE.md) - Guía de testing con Postman
- Ver Postman Collection en `docs/`

---

## 🔐 Security

- ✅ **Sanctum Tokens** - Token-based authentication
- ✅ **Role-based Access** - Spatie Permissions
- ✅ **Input Validation** - Form Requests
- ✅ **SQL Injection Protection** - Eloquent ORM
- ✅ **CORS Configuration** - Configured for mobile app
- ✅ **Environment Variables** - No credentials in code

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Write tests first (TDD)
4. Implement feature
5. Run tests (`php artisan test`)
6. Format code (`php artisan pint`)
7. Commit changes
8. Push to branch (`git push origin feature/AmazingFeature`)
9. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Maximiliano Ozonas** - *Initial work* - [maxiozonas](https://github.com/maxiozonas)

---

## 🙏 Acknowledgments

- **Flexxus** - ERP system integration
- **Laravel** - Amazing PHP framework
- **Expo** - React Native development platform

---

## 📞 Support

For support, email support@example.com or open an issue in this repository.

---

**Built with ❤️ for the construction industry**
