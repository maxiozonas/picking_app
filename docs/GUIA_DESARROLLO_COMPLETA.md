# Guía de Desarrollo - Flexxus Picking App

**Fecha:** 2026-03-02
**Versión:** 1.0
**Autor:** OpenCode AI Agent
**Estado:** Documento de Arquitectura y Desarrollo

---

## Resumen Ejecutivo

Este documento describe la arquitectura y estrategia de desarrollo para la aplicación de armado de pedidos de un corralón que utiliza Flexxus como ERP. La solución consta de 3 componentes principales:

1. **API Laravel** - Backend intermediario con DB propia
2. **App Móvil (React Native)** - Para empleados de depósito
3. **CMS Admin** - Panel web para administradores y métricas

**Contexto del Negocio:**
- Corralón de materiales de construcción
- Los clientes retiran material en el depósito (EXPEDICIÓN)
- Operarios arman pedidos basándose en Notas de Pedido (NP)
- Flexxus es el ERP pero no tiene funcionalidad de picking/armado

---

## Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Decisión de Autenticación](#decisión-de-autenticación)
3. [Integración con Flexxus](#integración-con-flexxus)
4. [Componente 1: API Laravel](#componente-1-api-laravel)
5. [Componente 2: App Móvil](#componente-2-app-móvil)
6. [Componente 3: CMS Admin](#componente-3-cms-admin)
7. [Base de Datos Propia](#base-de-datos-propia)
8. [Flujos de Usuario](#flujos-de-usuario)
9. [Endpoints de Flexxus a Utilizar](#endpoints-de-flexxus-a-utilizar)
10. [Plan de Implementación](#plan-de-implementación)

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                     ARQUITECTURA DEL SISTEMA                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────────┐      ┌──────────────┐
│   App Móvil  │ ◄──► │  API Laravel     │ ◄──► │   Flexxus    │
│  (Operarios)  │      │  (Backend + DB)  │      │    API v2    │
│  React Native │      │    Sanctum Auth  │      │  (CARLOSR)   │
└──────────────┘      └──────────────────┘      └──────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   CMS Admin      │
                       │  (Web Panel)     │
                       │  Laravel Nova   │
                       └──────────────────┘
```

**Principios de Diseño:**

1. **Backend Laravel como proxy:** Todas las llamadas a Flexxus pasan por Laravel
2. **Base de datos propia:** Estado de picking, usuarios, auditoría
3. **Login local independiente:** No depende de cuentas de Flexxus
4. **Sincronización selectiva:** Solo datos necesarios, con caché

---

## Decisión de Autenticación

### Análisis: Cuentas Flexxus vs Login Local

**Pregunta original:**
> ¿Debemos crear una cuenta de Flexxus para cada empleado o usar una sola cuenta compartida?

**Decisión TOMADA:** Login Local Independiente ✅

**Fundamento:**

| Aspecto | Login Local (Elegido) | Cuentas Flexxus |
|---------|---------------------|-----------------|
| Implementación | Inmediata (2-3 semanas) | Depende de gestión externa |
| Control | Total | Limitado a permisos Flexxus |
| Independencia | No depende de terceros | Depende de que Flexxus cree cuentas |
| Trazabilidad | Completa en DB propia | En Flexxus |
| Costos | Sin costos adicionales | Posibles costos de licencias |
| Seguridad | Credenciales en servidor | Tokens en dispositivos móviles |

**Implementación:**

- Cada operario tiene cuenta en tabla `users` (DB local)
- Backend usa credenciales compartidas (CARLOSR/W250) para Flexxus
- App móvil se autentica con JWT de Laravel Sanctum
- Auditoría completa en tabla `picking_events`

**Documentación completa:** Ver `docs/plans/2026-03-02-auth-strategy-analysis.md`

---

## Integración con Flexxus

### Credenciales Compartidas

```env
# .env
FLEXXUS_URL=https://pruebagiliycia.procomisp.com.ar
FLEXXUS_USERNAME=CARLOSR
FLEXXUS_PASSWORD=W250
FLEXXUS_DEVICE_INFO={"model":"0","platform":"0","uuid":"4953457348957348975","version":"0","manufacturer":"0"}
```

### Patrón de Comunicación

```
App Móvil → Backend Laravel → Flexxus API
   (1)           (2)              (3)

(1) JSON Web Token (Sanctum)
(2) Bearer Token Flexxus (cacheado)
(3) Credenciales CARLOSR/W250
```

**Importante:**
- Token de Flexxus se cachea en Redis (1 hora)
- Auto-refresh con refreshToken
- Retry automático en caso de error 401

---

## Componente 1: API Laravel

### Responsabilidades

1. **Autenticación local:** Login, logout, tokens
2. **Gestión de depósitos:** Sincronización desde Flexxus
3. **Pedidos y Picking:** Estado local de armado
4. **Proxy a Flexxus:** Llamadas a API de Flexxus con caché
5. **WebSockets:** Notificaciones en tiempo real
6. **API para Móvil:** Endpoints REST para operarios
7. **API para CMS:** Endpoints para panel admin

### Stack Tecnológico

```yaml
Framework: Laravel 12
PHP: 8.2+
Auth: Laravel Sanctum
Database: MySQL (XAMPP)
Cache: Redis
Queue: Redis + Supervisor
WebSocket: Laravel Echo Server + Pusher
Admin Panel: Laravel Nova
```

### Estructura de Directorios

```
flexxus-picking-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── Mobile/
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   ├── PickingController.php
│   │   │   │   │   └── WarehouseController.php
│   │   │   │   └── Admin/
│   │   │   │       ├── UserController.php
│   │   │   │       └── MetricsController.php
│   │   │   └── Controller.php
│   │   ├── Clients/
│   │   │   └── Flexxus/
│   │   │       ├── FlexxusClient.php
│   │   │       └── FlexxusClientInterface.php
│   │   ├── Middleware/
│   │   │   ├── WarehouseContext.php
│   │   │   └── JsonResponse.php
│   │   └── Requests/
│   │       ├── LoginRequest.php
│   │       └── StartPickingRequest.php
│   ├── Services/
│   │   ├── Auth/
│   │   │   ├── AuthService.php
│   │   │   └── AuthServiceInterface.php
│   │   ├── Flexxus/
│   │   │   ├── WarehouseService.php
│   │   │   ├── OrderService.php
│   │   │   └── DeliveryTypeService.php
│   │   └── Picking/
│   │       ├── PickingService.php
│   │       └── PickingSyncService.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Warehouse.php
│   │   ├── Picking.php
│   │   ├── PickingItem.php
│   │   ├── PickingEvent.php
│   │   └── DeliveryType.php
│   ├── Repositories/
│   │   ├── AuthRepository.php
│   │   ├── WarehouseRepository.php
│   │   └── PickingRepository.php
│   └── Jobs/
│       ├── SyncWarehousesJob.php
│       ├── SyncOrdersJob.php
│       └── SyncDeliveryTypesJob.php
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── api.php
│   └── channels.php
└── config/
    └── flexxus.php
```

### API Endpoints

#### Autenticación

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

#### Móvil - Operarios

```
GET    /api/mobile/pickings/expedition
GET    /api/mobile/pickings/{id}
POST   /api/mobile/pickings/{id}/start
POST   /api/mobile/pickings/{id}/items/{line}/pick
POST   /api/mobile/pickings/{id}/complete
GET    /api/mobile/stock?warehouse_id=001
GET    /api/mobile/products/{id}/location
```

#### Admin - CMS

```
GET    /api/admin/pickings
GET    /api/admin/pickings/{id}
GET    /api/admin/users
GET    /api/admin/metrics/dashboard
GET    /api/admin/metrics/low-stock
GET    /api/admin/notifications
```

---

## Componente 2: App Móvil

### Responsabilidades

1. **Login de operarios:** Username/password local
2. **Lista de pedidos:** Solo NP con EXPEDICIÓN de su depósito
3. **Toma de pedido:** Lock del pedido para el operario
4. **Armado por línea:** Marcar productos como preparados
5. **Ver ubicaciones:** Mostrar dónde está cada producto
6. **Finalización:** Completar armado y cerrar pedido
7. **Offline mode:** Funcionalidad básica sin conexión

### Stack Tecnológico

```yaml
Framework: React Native 0.83
Platform: Expo 55
Navigation: React Navigation 7
State: Zustand 5
HTTP: Axios 1.13
Storage: AsyncStorage
```

### Estructura de Directorios

```
flexxus-picking-mobile/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── picking/
│   │   │   ├── PickingListScreen.tsx
│   │   │   ├── PickingDetailScreen.tsx
│   │   │   ├── ProductListScreen.tsx
│   │   │   └── CompletePickingScreen.tsx
│   │   └── profile/
│   │       └── ProfileScreen.tsx
│   ├── components/
│   │   ├── PickingCard.tsx
│   │   ├── ProductItem.tsx
│   │   ├── LocationBadge.tsx
│   │   └── QuantityPicker.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── picking.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── pickingStore.ts
│   │   └── warehouseStore.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── usePicking.ts
│   ├── types/
│   │   ├── api.ts
│   │   └── models.ts
│   └── utils/
│       ├── locationParser.ts
│       └── validators.ts
├── app.json
└── package.json
```

### Pantallas Principales

#### 1. Login Screen
```tsx
// src/screens/auth/LoginScreen.tsx
- Username input
- Password input
- Login button
- "Olvidé mi contraseña"
```

#### 2. Picking List Screen
```tsx
// src/screens/picking/PickingListScreen.tsx
- Lista de NP con EXPEDICIÓN
- Filtros: Pendientes / En Armado / Completados
- Pull to refresh
- Badge: Cantidad de productos
```

#### 3. Picking Detail Screen
```tsx
// src/screens/picking/PickingDetailScreen.tsx
- Header: Cliente, fecha, observations
- Lista de productos
- Ubicación parseada (Sector / Pasillo / Estante)
- Cantidad: Pedida / Preparada / Pendiente
- Checkbox para marcar línea
- Botón: "Completar Armado"
```

#### 4. Product Location Screen
```tsx
// src/screens/picking/ProductLocationScreen.tsx
- Mapa del depósito (opcional)
- Ubicación destacada: "A-01-15"
- Distancia estimada (si hay mapa)
- Botón: "Llegué a ubicación"
```

### State Management (Zustand)

```typescript
// src/store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  warehouse: Warehouse | null;
  login: (username, password) => Promise<void>;
  logout: () => void;
}

// src/store/pickingStore.ts
interface PickingState {
  pickings: Picking[];
  currentPicking: Picking | null;
  fetchPickings: () => Promise<void>;
  startPicking: (id) => Promise<void>;
  pickItem: (line, quantity) => Promise<void>;
  completePicking: () => Promise<void>;
}
```

### Offline Support

```typescript
// Persistir datos localmente
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache de pickings
await AsyncStorage.setItem('pickings', JSON.stringify(pickings));

// Detectar conexión
const netInfo = await NetInfo.fetch();
if (netInfo.isConnected) {
  // Sincronizar con backend
} else {
  // Modo offline
}
```

---

## Componente 3: CMS Admin

### Responsabilidades

1. **Gestión de usuarios:** Crear, editar, eliminar operarios
2. **Asignación de depósitos:** Qué operario trabaja en qué depósito
3. **Dashboard de métricas:** Pedidos armados, rendimiento, errores
4. **Alertas de stock:** Productos con stock bajo
5. **Monitoreo en tiempo real:** Qué operarios están armado
6. **Reportes:** Exportar datos a CSV/Excel
7. **Notificaciones:** Envío de alertas push/email

### Stack Tecnológico

```yaml
Framework: Laravel Nova 4
Dashboard: Vue.js 3
Charts: Chart.js o ApexCharts
Real-time: Laravel Echo + Pusher
Exports: Laravel Excel
Notifications: Laravel Notifications
```

### Pantallas del CMS

#### 1. Dashboard Principal

```
┌─────────────────────────────────────────────────────┐
│  PANEL ADMINISTRATIVO - FLEXXUS PICKING            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  MÉTRICAS HOY                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │   23     │ │   156    │ │   98%    │            │
│  │ Pedidos  │ │ Líneas   │ │ Efic.    │            │
│  │ Armados  │ │ Armadas  │           │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│  PEDIDOS EN CURSO (REALTIME)                       │
│  ┌─────────────────────────────────────────────┐  │
│  │ 👤 Juan Pérez    📦 NP-623136   ⏱️ 15 min  │  │
│  │    Depósito: DON BOSCO                      │  │
│  │    Progreso: 8/12 líneas                    │  │
│  └─────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────┐  │
│  │ 👤 María López   📦 NP-623142   ⏱️  5 min  │  │
│  │    Depósito: RONDEAU                        │  │
│  │    Progreso: 3/20 líneas                    │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ALERTAS DE STOCK                                  │
│  ┌─────────────────────────────────────────────┐  │
│  │ ⚠️  ART-001 - Cemento 50kg                  │  │
│  │     Stock: 15 uds (Mínimo: 50)              │  │
│  │     Depósito: DON BOSCO                     │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

#### 2. Gestión de Usuarios

```
Lista de Operarios:
┌──────┬─────────────┬──────────┬────────────┬────────┐
│ ID   │ Nombre      │ Usuario  │ Depósito   │ Estado │
├──────┼─────────────┼──────────┼────────────┼────────┤
│ 1    │ Juan Pérez  │ jperez   │ DON BOSCO  │ Activo │
│ 2    │ María López │ mlopez   │ RONDEAU    │ Activo │
│ 3    │ Carlos Ruiz │ cruiz    │ DON BOSCO  │ Inactivo│
└──────┴─────────────┴──────────┴────────────┴────────┘

[Crear Usuario] [Editar] [Eliminar] [Asignar Depósito]
```

#### 3. Reportes

- Pedidos armados por día/semana/mes
- Rendimiento por operario
- Productos más movidos
- Errores frecuentes
- Tiempos promedio de armado

#### 4. Configuración

- Parámetros de sincronización con Flexxus
- Umbrales de alertas de stock
- Configuración de notificaciones
- Tipos de entrega

### Notificaciones

**Canales:**
1. **In-App:** Badge en el CMS
2. **Email:** A administradores
3. **Push (futuro):** A móviles de supervisores
4. **Slack/Teams:** Integración opcional

**Tipos de eventos:**
- Stock bajo (`quantity < minimum`)
- Pedido tomado por operario
- Pedido completado
- Error de sincronización con Flexxus
- Operario sin actividad (X minutos)

---

## Base de Datos Propia

### Diagrama Entidad-Relación

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users     │     │  warehouses  │     │ delivery_types│
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ id           │
│ username     │     │ code         │     │ code         │
│ name         │     │ name         │     │ description  │
│ email        │     │ location     │     │ is_expedition│
│ password     │     │ flexxus_id   │     └──────────────┘
│ warehouse_id │→    │ is_active    │
│ is_active    │     │ synced_at    │
│ created_at   │     └──────────────┘
└──────────────┘
       │
       ↓
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   pickings   │────→│ picking_items │     │picking_events│
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ id           │
│ order_type   │     │ picking_id   │←────│ picking_id   │
│ order_number │     │ line_number  │     │ event_type   │
│ warehouse_id │     │ product_code │     │ payload      │
│ assigned_user│     │ description  │     │ created_by   │
│ status       │     │ qty_ordered  │     │ created_at   │
│ started_at   │     │ qty_picked   │     └──────────────┘
│ finished_at  │     │ qty_pending  │
│ synced_at    │     │ observations │
│ created_at   │     └──────────────┘
└──────────────┘
       ↑
       │
┌──────────────┐
│order_delivery│
│    _data     │
├──────────────┤
│ order_type   │
│ order_number │
│ delivery_type│
│ delivery_data│
│ synced_at    │
└──────────────┘
```

### Migraciones

#### users
```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('username')->unique();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password');
    $table->foreignId('warehouse_id')->nullable()->constrained()->nullOnDelete();
    $table->boolean('is_active')->default(true);
    $table->boolean('can_override_warehouse')->default(false);
    $table->timestamp('last_login_at')->nullable();
    $table->timestamp('override_expires_at')->nullable();
    $table->timestamps();
    $table->rememberToken();
});
```

#### warehouses
```php
Schema::create('warehouses', function (Blueprint $table) {
    $table->id();
    $table->string('code')->unique();       // CODIGODEPOSITO de Flexxus
    $table->string('name');                  // DESCRIPCION
    $table->string('location')->nullable(); // UBICACION
    $table->string('flexxus_id')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

#### pickings
```php
Schema::create('pickings', function (Blueprint $table) {
    $table->id();
    $table->string('order_type', 5);        // NP, PR, FC
    $table->integer('order_number');        // 623136
    $table->foreignId('warehouse_id')->constrained();
    $table->foreignId('assigned_user_id')->nullable()->constrained()->nullOnDelete();
    $table->enum('status', ['PENDIENTE', 'EN_ARMADO', 'ARMADO_LOCAL', 'SINCRONIZADO_ERP', 'ERROR_SYNC'])->default('PENDIENTE');
    $table->timestamp('started_at')->nullable();
    $table->timestamp('finished_at')->nullable();
    $table->timestamp('synced_at')->nullable();
    $table->string('erp_voucher_type')->nullable();  // RE
    $table->integer('erp_voucher_number')->nullable();
    $table->text('error_message')->nullable();
    $table->json('delivery_data')->nullable();
    $table->timestamps();

    $table->unique(['order_type', 'order_number']);
    $table->index(['warehouse_id', 'status']);
    $table->index('assigned_user_id');
});
```

#### picking_items
```php
Schema::create('picking_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('picking_id')->constrained()->cascadeOnDelete();
    $table->integer('line_number');
    $table->string('product_code');
    $table->string('description');
    $table->decimal('qty_ordered', 10, 2);
    $table->decimal('qty_picked', 10, 2)->default(0);
    $table->decimal('qty_pending', 10, 2);
    $table->string('location')->nullable();    // A-01-15
    $table->text('observations')->nullable();
    $table->timestamps();

    $table->unique(['picking_id', 'line_number']);
});
```

#### picking_events
```php
Schema::create('picking_events', function (Blueprint $table) {
    $table->id();
    $table->foreignId('picking_id')->constrained()->cascadeOnDelete();
    $table->string('event_type');  // STARTED, ITEM_PICKED, COMPLETED, SYNCED
    $table->json('payload');
    $table->foreignId('created_by')->nullable()->constrained()->nullOnDelete();
    $table->timestamps();

    $table->index(['picking_id', 'created_at']);
});
```

#### delivery_types
```php
Schema::create('delivery_types', function (Blueprint $table) {
    $table->id();
    $table->integer('code')->unique();        // CODIGOTIPOENTREGA
    $table->string('description');            // EXPEDICION, REPARTO
    $table->boolean('is_expedition')->default(false);
    $table->boolean('is_customer_pickup')->default(false);
    $table->timestamps();
});
```

#### order_delivery_data (Sincronización)
```php
Schema::create('order_delivery_data', function (Blueprint $table) {
    $table->id();
    $table->string('order_type', 5);
    $table->integer('order_number');
    $table->integer('delivery_type_id');
    $table->json('delivery_data');
    $table->timestamp('synced_at');
    $table->timestamps();

    $table->unique(['order_type', 'order_number']);
    $table->index('delivery_type_id');
});
```

---

## Flujos de Usuario

### Flujo 1: Operario de Depósito (App Móvil)

```
┌──────────────────────────────────────────────────────────────┐
│ 1. LOGIN                                                    │
├──────────────────────────────────────────────────────────────┤
│ Operario → App Móvil                                         │
│   ├─ Ingresa username/password                              │
│   └─ POST /api/auth/login                                    │
│                                                               │
│ Backend Laravel                                              │
│   ├─ Valida credenciales (DB local)                         │
│   ├─ Genera token Sanctum                                    │
│   ├─ Retorna usuario + depósito + token                      │
│   └─ Registra evento login en picking_events                │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. VER PEDIDOS PENDIENTES (EXPEDICION)                      │
├──────────────────────────────────────────────────────────────┤
│ App Móvil → Backend Laravel                                  │
│   ├─ GET /api/mobile/pickings/expedition?warehouse_id=001    │
│   └─ Header: Authorization: Bearer {token}                  │
│                                                               │
│ Backend Laravel:                                             │
│   ├─ Obtiene NP del depósito desde Flexxus                   │
│   ├─ GET /orders?warehouse_id=001                            │
│   ├─ Para cada NP, verifica tipo de entrega:                │
│   │   ├─ GET /v2/deliverydata/NP/{numero}                   │
│   │   └─ Filtra solo CODIGOTIPOENTREGA = 1 (EXPEDICION)     │
│   ├─ Retorna lista filtrada al móvil                        │
│   └─ Cachea resultados por 5 minutos                        │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. TOMAR PEDIDO                                             │
├──────────────────────────────────────────────────────────────┤
│ App Móvil → Backend Laravel                                  │
│   ├─ POST /api/mobile/pickings/{id}/start                   │
│   └─ Body: {}                                                │
│                                                               │
│ Backend Laravel:                                             │
│   ├─ Verifica que el pedido esté PENDIENTE                  │
│   ├─ Verifica que no esté tomado por otro operario          │
│   ├─ Obtiene detalle desde Flexxus:                          │
│   │   └─ GET /orders/NP/{id}                                │
│   ├─ Crea registro local:                                   │
│   │   ├─ pickings.status = EN_ARMADO                        │
│   │   ├─ pickings.assigned_user_id = {usuario}             │
│   │   └─ pickings.started_at = NOW()                        │
│   ├─ Crea líneas en picking_items (del Detalle[])           │
│   ├─ Registra evento STARTED en picking_events              │
│   ├─ Notifica al CMS (WebSocket)                            │
│   └─ Retorna detalle completo al móvil                      │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. ARMAR PEDIDO (LÍNEA POR LÍNEA)                           │
├──────────────────────────────────────────────────────────────┤
│ App Móvil (Offline-first)                                    │
│   ├─ Muestra lista de productos con ubicaciones             │
│   ├─ Operario va al depósito con la lista                   │
│   ├─ Encuentra producto según ubicación (ej: A-01-15)       │
│   ├─ Marca línea como "preparada":                          │
│   │   └─ POST /api/mobile/pickings/{id}/items/{line}/pick  │
│   └─ Body: { quantity: 10 }                                  │
│                                                               │
│ Backend Laravel:                                             │
│   ├─ Actualiza picking_items:                               │
│   │   ├─ qty_picked += quantity                             │
│   │   └─ qty_pending -= quantity                            │
│   ├─ Registra evento ITEM_PICKED en picking_events          │
│   └─ Si todas las líneas están completas → notifica         │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 5. COMPLETAR ARMADO                                          │
├──────────────────────────────────────────────────────────────┤
│ App Móvil → Backend Laravel                                  │
│   ├─ POST /api/mobile/pickings/{id}/complete                │
│   └─ Body: {}                                                │
│                                                               │
│ Backend Laravel:                                             │
│   ├─ Valida que todas las líneas estén qty_picked >= qty     │
│   ├─ Actualiza pickings.status = ARMADO_LOCAL              │
│   ├─ pickings.finished_at = NOW()                           │
│   ├─ Registra evento COMPLETED en picking_events            │
│   ├─ Encola Job para sincronizar con Flexxus:               │
│   │   └─ SyncPickingJob::dispatch($picking)                 │
│   └─ Retorna confirmación al móvil                          │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 6. SINCRONIZACIÓN CON FLEXXUS (Background Job)              │
├──────────────────────────────────────────────────────────────┤
│ Job: SyncPickingJob                                          │
│                                                               │
│ 1. Crear remito en Flexxus:                                 │
│    ├─ POST /sales                                            │
│    ├─ Body: {                                                │
│    │     branch: 1,                                          │
│    │     warehouse: "001",                                   │
│    │     customer: "{CODIGOCLIENTE}",                        │
│    │     type: 12,  // RE (Remito)                          │
│    │     sale_details: [                                     │
│    │       {                                                 │
│    │         product: "{CODIGOPARTICULAR}",                  │
│    │         quantity: {qty_picked},                         │
│    │         price: {precio},                                │
│    │         linked_voucher_type: "NP",                     │
│    │         linked_voucher_number: {NP_NUMBER},            │
│    │         linked_line: {LINEA}                           │
│    │       }                                                 │
│    │     ]                                                  │
│    │   }                                                    │
│    └─ Response: { order_Id: 67890, orderType: "RE" }        │
│                                                               │
│ 2. Verificar vinculación:                                   │
│    ├─ GET /orderrelated/NP/{NP_NUMBER}                       │
│    └─ Validar que aparece RE-67890 vinculado                │
│                                                               │
│ 3. Actualizar estado local:                                 │
│    ├─ pickings.status = SINCRONIZADO_ERP                    │
│    ├─ pickings.erp_voucher_type = "RE"                      │
│    ├─ pickings.erp_voucher_number = 67890                   │
│    ├─ pickings.synced_at = NOW()                            │
│    └─ Registra evento SYNCED en picking_events              │
│                                                               │
│ 4. Si hay error:                                             │
│    ├─ pickings.status = ERROR_SYNC                          │
│    ├─ pickings.error_message = {error}                      │
│    └─ Registra evento ERROR en picking_events               │
└──────────────────────────────────────────────────────────────┘
```

### Flujo 2: Administrador (CMS)

```
┌──────────────────────────────────────────────────────────────┐
│ 1. DASHBOARD EN TIEMPO REAL                                  │
├──────────────────────────────────────────────────────────────┤
│ Admin → Browser → CMS Laravel Nova                          │
│                                                               │
│ Pantalla: Dashboard                                          │
│   ├─ Métricas de hoy (via API)                              │
│   ├─ Pedidos en curso (WebSocket)                           │
│   └─ Alertas de stock (WebSocket)                           │
│                                                               │
│ WebSocket (Laravel Echo):                                    │
│   ├─ Canal: pickings                                        │
│   ├─ Eventos:                                                │
│   │   ├─ PickingStarted                                    │
│   │   ├─ ItemPicked                                        │
│   │   ├─ PickingCompleted                                  │
│   │   └─ PickingSynced                                     │
│   └─ Actualiza UI en tiempo real                            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. GESTIÓN DE USUARIOS                                       │
├──────────────────────────────────────────────────────────────┤
│ Admin → CMS                                                  │
│                                                               │
│ Acciones:                                                    │
│   ├─ Crear nuevo operario                                    │
│   │   ├─ Nombre, email, username                            │
│   │   ├─ Password (generada o manual)                       │
│   │   ├─ Depósito asignado                                  │
│   │   └─ Permisos (opcional)                                │
│   ├─ Editar operario existente                               │
│   │   ├─ Cambiar depósito                                   │
│   │   ├─ Desactivar/reactivar                              │
│   │   └─ Reset password                                    │
│   └─ Ver historial de armados                               │
│      └─ GET /api/admin/users/{id}/pickings                  │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. ALERTAS Y NOTIFICACIONES                                  │
├──────────────────────────────────────────────────────────────┤
│ Admin → CMS                                                  │
│                                                               │
│ Pantalla: Notificaciones                                     │
│   ├─ Lista de alertas recientes                             │
│   ├─ Filtros: Stock / Errores / Operarios                   │
│   └─ Acciones: Marcar como leído, Resolver                  │
│                                                               │
│ Tipos de notificaciones:                                     │
│   ├─ Stock bajo (< minimum)                                  │
│   │   └─ Job: CheckLowStockJob (diario)                     │
│   ├─ Error de sincronización                                 │
│   │   └─ Evento: falló SyncPickingJob                       │
│   ├─ Operario sin actividad                                  │
│   │   └─ Job: CheckInactiveUsersJob (cada 30 min)           │
│   └─ Pedido completado                                       │
│      └─ Evento: PickingCompleted                            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. REPORTES Y EXPORTACIÓN                                    │
├──────────────────────────────────────────────────────────────┤
│ Admin → CMS                                                  │
│                                                               │
│ Reportes disponibles:                                        │
│   ├─ Pedidos armados por período                             │
│   │   └─ GET /api/admin/reports/pickings?from=2026-03-01     │
│   ├─ Rendimiento por operario                                │
│   │   └─ GET /api/admin/reports/performance?user_id=1        │
│   ├- Productos más movidos                                   │
│   │   └─ GET /api/admin/reports/products?top=20             │
│   └─ Errores de sincronización                               │
│      └─ GET /api/admin/reports/sync-errors                   │
│                                                               │
│ Exportación:                                                 │
│   └─ GET /api/admin/reports/pickings/export?format=excel    │
└──────────────────────────────────────────────────────────────┘
```

---

## Endpoints de Flexxus a Utilizar

### Resumen Ejecutivo

| Endpoint | Uso | Frecuencia |
|----------|-----|------------|
| POST /auth/login | Autenticar (solo backend) | Cada 1h |
| GET /warehouses | Sincronizar depósitos | Cada 1h |
| GET /v2/deliverytype | Sincronizar tipos de entrega | Una vez |
| GET /orders | Obtener NP de depósito | On-demand |
| GET /orders/NP/{id} | Detalle de pedido | On-demand |
| GET /v2/deliverydata/NP/{id} | Verificar tipo de entrega | On-demand |
| GET /stock | Ubicaciones de productos | Cada 10 min |
| POST /sales | Crear remito de salida | Al completar |
| GET /orderrelated/NP/{id} | Verificar vinculación | Al completar |

### Detalle por Endpoint

#### 1. POST /auth/login
**Propósito:** Autenticación con Flexxus (solo backend)

**Request:**
```json
POST /auth/login
{
  "username": "CARLOSR",
  "password": "W250",
  "deviceinfo": {
    "model": "0",
    "platform": "0",
    "uuid": "4953457348957348975",
    "version": "0",
    "manufacturer": "0"
  }
}
```

**Response:**
```json
{
  "token": "eyJhbGci...",
  "expireIn": 3600,
  "refreshToken": "refresh_...",
  "refreshExpireIn": 86400
}
```

**Uso en Backend:**
```php
$token = Cache::remember('flexxus_token', 3600, function () {
    $response = Http::post(config('flexxus.url') . '/auth/login', [
        'username' => config('flexxus.username'),
        'password' => config('flexxus.password'),
        'deviceinfo' => config('flexxus.device_info')
    ]);

    return $response->json('token');
});
```

---

#### 2. GET /warehouses
**Propósito:** Sincronizar depósitos desde Flexxus

**Request:**
```
GET /warehouses
```

**Response:**
```json
{
  "data": [
    {
      "CODIGODEPOSITO": "001",
      "DESCRIPCION": "DON BOSCO",
      "UBICACION": "Sector A, Calle 1",
      "DEPOSITOVISIBLE": 1,
      "ACTIVO": 1
    }
  ]
}
```

**Uso en Backend:**
```php
// Job: SyncWarehousesJob
public function handle()
{
    $warehouses = $this->flexxusClient->getWarehouses();

    foreach ($warehouses as $wh) {
        Warehouse::updateOrCreate(
            ['code' => $wh['CODIGODEPOSITO']],
            [
                'name' => $wh['DESCRIPCION'],
                'location' => $wh['UBICACION'],
                'is_active' => $wh['ACTIVO'] == 1
            ]
        );
    }
}
```

---

#### 3. GET /v2/deliverytype
**Propósito:** Sincronizar tipos de entrega (EXPEDICION, REPARTO, etc.)

**Request:**
```
GET /v2/deliverytype
```

**Response:**
```json
{
  "data": [
    {
      "CODIGOTIPOENTREGA": 1,
      "DESCRIPCION": "EXPEDICION",
      "RETIRACLIENTE": 1
    }
  ]
}
```

**Uso en Backend:**
```php
// Job: SyncDeliveryTypesJob
public function handle()
{
    $types = $this->flexxusClient->getDeliveryTypes();

    foreach ($types as $type) {
        DeliveryType::updateOrCreate(
            ['code' => $type['CODIGOTIPOENTREGA']],
            [
                'description' => $type['DESCRIPCION'],
                'is_expedition' => $type['CODIGOTIPOENTREGA'] == 1,
                'is_customer_pickup' => $type['RETIRACLIENTE'] == 1
            ]
        );
    }
}
```

---

#### 4. GET /orders
**Propósito:** Obtener lista de NP del depósito

**Request:**
```
GET /orders?warehouse_id=001&withoutstarting=0
```

**Query Params:**
- `warehouse_id`: **CRÍTICO** - Filtrar por depósito del operario
- `withoutstarting`: 0 = iniciados, 1 = no iniciados
- `date_from`, `date_to`: Rango de fechas
- `limit`: Límite de registros

**Response:**
```json
{
  "data": [
    {
      "TIPOCOMPROBANTE": "NP",
      "NUMEROCOMPROBANTE": 623136,
      "FECHACOMPROBANTE": "2026-03-02",
      "CODIGODEPOSITO": "001",
      "RAZONSOCIAL": "CLIENTE S.A.",
      "ESTADO": "PENDIENTE"
    }
  ]
}
```

**Uso en Backend:**
```php
// OrderService
public function getOrdersForWarehouse(string $warehouseCode): array
{
    $orders = $this->flexxusClient->getOrders([
        'warehouse_id' => $warehouseCode
    ]);

    // Filtrar solo NP
    return array_filter($orders['data'], function($order) {
        return $order['TIPOCOMPROBANTE'] === 'NP';
    });
}
```

---

#### 5. GET /orders/NP/{id}
**Propósito:** Obtener detalle completo del pedido con líneas

**Request:**
```
GET /orders/NP/623136
```

**Response:**
```json
{
  "data": {
    "TIPOCOMPROBANTE": "NP",
    "NUMEROCOMPROBANTE": 623136,
    "FECHAENTREGA": "2026-03-05",
    "RAZONSOCIAL": "CLIENTE S.A.",
    "OBSERVACIONES": "Entregar antes de las 14hs",
    "Detalle": [
      {
        "LINEA": 1,
        "CODIGOPARTICULAR": "ART-001",
        "DESCRIPCION": "Cemento 50kg",
        "CANTIDAD": 10,
        "PENDIENTE": 10,
        "CANTIDADPREPARADA": 0
      }
    ]
  }
}
```

**Uso en Backend:**
```php
// PickingService
public function startPicking(int $orderId, int $userId): Picking
{
    // 1. Obtener detalle desde Flexxus
    $orderDetail = $this->flexxusClient->getOrderDetail('NP', $orderId);

    // 2. Crear picking local
    $picking = Picking::create([
        'order_type' => 'NP',
        'order_number' => $orderId,
        'warehouse_id' => auth()->user()->warehouse_id,
        'assigned_user_id' => $userId,
        'status' => 'EN_ARMADO',
        'started_at' => now()
    ]);

    // 3. Crear líneas
    foreach ($orderDetail['data']['Detalle'] as $line) {
        PickingItem::create([
            'picking_id' => $picking->id,
            'line_number' => $line['LINEA'],
            'product_code' => $line['CODIGOPARTICULAR'],
            'description' => $line['DESCRIPCION'],
            'qty_ordered' => $line['CANTIDAD'],
            'qty_picked' => 0,
            'qty_pending' => $line['PENDIENTE']
        ]);
    }

    return $picking;
}
```

---

#### 6. GET /v2/deliverydata/NP/{id}
**Propósito:** Verificar si la NP es de EXPEDICION (CRÍTICO)

**Request:**
```
GET /v2/deliverydata/NP/623136
```

**Response:**
```json
{
  "data": [
    {
      "CODIGOTIPOENTREGA": 1,
      "DIRECCION": "-",
      "BARRIO": "ALTOS DEL PINAR",
      "LOCALIDAD": "BAHIA BLANCA",
      "RESPONSABLERECEPCION": "GILI PRESUPUESTO",
      "OBSERVACIONES": ""
    }
  ]
}
```

**Uso en Backend:**
```php
// OrderService
public function getExpeditionOrders(string $warehouseCode): array
{
    $allOrders = $this->getOrdersForWarehouse($warehouseCode);
    $expeditionOrders = [];

    foreach ($allOrders as $order) {
        $deliveryData = $this->flexxusClient->getDeliveryData('NP', $order['NUMEROCOMPROBANTE']);

        // Solo EXPEDICION (tipo = 1)
        if ($deliveryData['data'][0]['CODIGOTIPOENTREGA'] == 1) {
            $order['DELIVERY_DATA'] = $deliveryData['data'][0];
            $expeditionOrders[] = $order;
        }
    }

    return $expeditionOrders;
}
```

**Optimización:**
```php
// Sincronizar en background para no llamar para cada NP
// Job: SyncDeliveryDataJob
Cache::remember("delivery_data:NP:{$orderNumber}", 300, function () use ($orderNumber) {
    return $this->flexxusClient->getDeliveryData('NP', $orderNumber);
});
```

---

#### 7. GET /stock
**Propósito:** Obtener ubicaciones de productos en el depósito

**Request:**
```
GET /stock?warehouse_list=001&web_published_only=1
```

**Query Params:**
- `warehouse_list`: Códigos de depósitos separados por coma
- `update_from`: Fecha de actualización desde
- `web_published_only`: Solo productos publicados

**Response:**
```json
{
  "data": [
    {
      "CODIGOARTICULO": "ART-001",
      "DESCRIPCION": "Cemento 50kg",
      "CODIGODEPOSITO": "001",
      "STOCK": 150,
      "STOCKDISPONIBLE": 120,
      "UBICACION": "A-01-15"
    }
  ]
}
```

**Uso en Backend:**
```php
// LocationService
public function getProductLocation(string $productCode, string $warehouseCode): ?string
{
    $stock = Cache::remember("stock:{$warehouseCode}", 600, function () use ($warehouseCode) {
        return $this->flexxusClient->getStock(['warehouse_list' => $warehouseCode]);
    });

    $product = collect($stock['data'])->firstWhere('CODIGOARTICULO', $productCode);

    return $product['UBICACION'] ?? null;
}

// Parser de ubicación
public function parseLocation(string $location): array
{
    // Formato: "A-01-15" → [Sector A, Pasillo 01, Estante 15]
    $parts = explode('-', $location);

    return [
        'sector' => $parts[0] ?? '',
        'aisle' => $parts[1] ?? '',
        'shelf' => $parts[2] ?? '',
        'formatted' => sprintf('Sector %s / Pasillo %s / Estante %s',
            $parts[0] ?? 'N/A',
            $parts[1] ?? 'N/A',
            $parts[2] ?? 'N/A'
        )
    ];
}
```

---

#### 8. POST /sales
**Propósito:** Crear remito de salida vinculado a la NP (CIERRE)

**Request:**
```json
POST /sales
{
  "branch": 1,
  "warehouse": "001",
  "customer": "C001",
  "date": "2026-03-02",
  "type": 12,
  "sale_details": [
    {
      "product": "ART-001",
      "quantity": 10,
      "price": 1500.00,
      "linked_voucher_type": "NP",
      "linked_voucher_number": 623136,
      "linked_line": 1
    }
  ]
}
```

**Campos clave:**
- **type**: 12 = Remito (RE) - confirmar con funcional
- **linked_voucher_type**: "NP"
- **linked_voucher_number**: Número de NP original
- **linked_line**: Línea de la NP

**Response:**
```json
{
  "error": false,
  "message": "success",
  "orderType": "RE",
  "order_Id": 67890,
  "linequantity": 1
}
```

**Uso en Backend:**
```php
// SyncPickingJob
public function syncPicking(Picking $picking)
{
    $items = $picking->items;

    $saleDetails = [];
    foreach ($items as $item) {
        $saleDetails[] = [
            'product' => $item->product_code,
            'quantity' => $item->qty_picked,
            'price' => $this->getProductPrice($item->product_code),
            'linked_voucher_type' => 'NP',
            'linked_voucher_number' => $picking->order_number,
            'linked_line' => $item->line_number
        ];
    }

    // Crear remito en Flexxus
    $response = $this->flexxusClient->createSale([
        'branch' => 1,
        'warehouse' => $picking->warehouse->code,
        'customer' => $this->getCustomerCode($picking),
        'date' => now()->format('Y-m-d'),
        'type' => 12, // RE
        'sale_details' => $saleDetails
    ]);

    // Actualizar estado
    $picking->update([
        'status' => 'SINCRONIZADO_ERP',
        'erp_voucher_type' => 'RE',
        'erp_voucher_number' => $response['order_Id'],
        'synced_at' => now()
    ]);
}
```

---

#### 9. GET /orderrelated/NP/{id}
**Propósito:** Verificar que el remito quedó vinculado a la NP

**Request:**
```
GET /orderrelated/NP/623136
```

**Response:**
```json
{
  "data": [
    {
      "TIPOCOMPROBANTE": "RE",
      "NUMEROCOMPROBANTE": 67890,
      "REFERENCIA": "NP-623136"
    }
  ]
}
```

**Uso en Backend:**
```php
// Verificar vinculación
$related = $this->flexxusClient->getRelatedVouchers('NP', $picking->order_number);

$hasRemito = collect($related['data'])->contains(function($item) use ($picking) {
    return $item['TIPOCOMPROBANTE'] === 'RE' &&
           $item['NUMEROCOMPROBANTE'] == $picking->erp_voucher_number;
});

if (!$hasRemito) {
    throw new \Exception('Remito no vinculado correctamente');
}
```

---

## Plan de Implementación

### Fase 1: Fundamentos (Semanas 1-2)

**Backend:**
- ✅ Configuración inicial de Laravel
- ✅ Migraciones de base de datos
- ✅ Modelos: User, Warehouse, DeliveryType
- ✅ Autenticación con Sanctum
- ✅ FlexxusClient con auth y retry
- ✅ Sincronización de depósitos y tipos de entrega

**Móvil:**
- ✅ Setup de React Native + Expo
- ✅ Navegación básica
- ✅ Pantalla de Login
- ✅ Integración con API de autenticación

**CMS:**
- ✅ Instalación de Laravel Nova
- ✅ Recursos básicos: Users, Warehouses

**Entregables:**
- [ ] Login funcional
- [ ] Depósitos sincronizados
- [ ] Tipos de entrega configurados
- [ ] CMS puede crear usuarios

---

### Fase 2: Pedidos y Picking (Semanas 3-5)

**Backend:**
- OrderService con filtro de expedición
- PickingService con estados
- API endpoints para móvil
- Job de sincronización de delivery data
- Eventos y listeners para WebSocket

**Móvil:**
- Pantalla: Lista de pedidos (EXPEDICION)
- Pantalla: Detalle de pedido
- Pantalla: Armado por línea
- State management con Zustand
- Offline mode básico

**CMS:**
- Dashboard en tiempo real
- Lista de pickings en curso
- Métricas básicas

**Entregables:**
- [ ] Operarios pueden ver pedidos de su depósito
- [ ] Solo filtra NP con EXPEDICION
- [ ] Puede tomar pedido y ver detalle
- [ ] CMS muestra pickings en tiempo real

---

### Fase 3: Armado y Ubicaciones (Semanas 6-7)

**Backend:**
- Integración con /stock
- Parser de ubicaciones
- Endpoints de productos
- Lock de pedidos
- Validaciones de stock

**Móvil:**
- Pantalla: Ubicación de productos
- Parser de ubicación en móvil
- Scanner de códigos de barra (opcional)
- Confirmación de línea armada

**CMS:**
- Reporte de rendimiento
- Historial de armados

**Entregables:**
- [ ] Operarios ven ubicaciones parseadas
- [ ] Pueden marcar productos como armados
- [ ] Validación de stock antes de tomar pedido
- [ ] No hay doble toma de pedido

---

### Fase 4: Sincronización con Flexxus (Semana 8)

**Backend:**
- POST /sales para crear remitos
- Verificación de vinculación
- SyncPickingJob con reintentos
- Manejo de errores de sincronización
- Queue system con Redis

**CMS:**
- Alertas de errores de sync
- Reintentos manuales
- Log de sincronizaciones

**Entregables:**
- [ ] Al completar picking, se crea RE en Flexxus
- [ ] RE queda vinculado a NP
- [ ] Errores de sync se registran y notifican
- [ ] Reintentos automáticos en caso de fallo

---

### Fase 5: Optimización y Métricas (Semanas 9-10)

**Backend:**
- Caché inteligente (Redis)
- Optimización de queries
- Indexación de BD
- Jobs de monitoreo (stock bajo, usuarios inactivos)

**CMS:**
- Dashboard completo con gráficos
- Reportes exportables a Excel
- Sistema de notificaciones
- Configuración de umbrales

**Móvil:**
- Optimización de performance
- Caché offline
- Sincronización en background
- Push notifications (opcional)

**Entregables:**
- [ ] Dashboard con métricas en tiempo real
- [ ] Alertas de stock bajo funcionando
- [ ] Reportes exportables
- [ ] App funciona con conexión limitada

---

## Decisiones Arquitectónicas Clave

### 1. ¿Por qué Login Local y no cuentas Flexxus?

**Problema:**
- No sabemos si Flexxus creará cuentas para cada operario
- Depender de terceros bloquea el proyecto

**Solución:**
- Login local con DB propia
- Credenciales compartidas (CARLOSR/W250) en backend
- Auditoría completa en sistema propio

**Documento:** `docs/plans/2026-03-02-auth-strategy-analysis.md`

---

### 2. ¿Cómo filtramos NP por EXPEDICION?

**Problema:**
- Endpoint /orders NO acepta parámetro `expedition`
- Solo funciona en endpoints específicos de CORRALON

**Solución:**
- Para cada NP, consultar `/v2/deliverydata/NP/{numero}`
- Filtrar por `CODIGOTIPOENTREGA == 1` (EXPEDICION)
- Sincronizar en background para no hacer N llamadas on-demand

**Optimización:**
- Job cada 5 minutos actualiza `order_delivery_data`
- Consulta local es instantánea
- Caché de 5 minutos es suficiente

---

### 3. ¿Cómo manejamos ubicaciones sin estructura?

**Problema:**
- Flexxus no tiene gestión de sub-depósitos o ubicaciones
- Solo campo de texto libre "UBICACION"

**Solución:**
- Parsear string de ubicación (ej: "A-01-15")
- Formato estándar: "SECTOR-PASILLO-ESTANTE"
- Mostrar organizado en móvil
- Opcional: Tabla local `warehouse_locations`

**Implementación:**
```php
function parseLocation(string $location): array {
    $parts = explode('-', $location);
    return [
        'sector' => $parts[0],
        'aisle' => $parts[1],
        'shelf' => $parts[2]
    ];
}
```

---

### 4. ¿Evitamos doble toma de pedido?

**Problema:**
- Flexxus no tiene lock de pedidos
- Dos operarios podrían tomar el mismo pedido

**Solución:**
- Lock local con `assigned_user_id` + `started_at`
- Timeout de 30 minutos
- Validación antes de asignar

**Implementación:**
```php
if ($picking->assigned_user_id && $picking->started_at->gt(now()->subMinutes(30))) {
    throw new PickingAlreadyTakenException();
}
```

---

## Cronograma de 10 Semanas

```
Semana 1-2: Fase 1 - Fundamentos
├─ Backend setup + Auth
├─ Móvil: Login
└─ CMS: Users CRUD

Semana 3-5: Fase 2 - Pedidos
├─ Backend: Orders + Picking
├─ Móvil: Lista + Detalle
└─ CMS: Dashboard básico

Semana 6-7: Fase 3 - Armado
├─ Backend: Ubicaciones + Lock
├─ Móvil: Armado por línea
└─ CMS: Rendimiento

Semana 8: Fase 4 - Sync Flexxus
├─ Backend: POST /sales
├─ Móvil: Completar pedido
└─ CMS: Errores de sync

Semana 9-10: Fase 5 - Optimización
├─ Backend: Caché + Jobs
├─ CMS: Reportes completos
└─ Todos: Testing y bugfixing
```

---

## Testing Strategy

### Backend Tests

**Unit Tests:**
- AuthService::login()
- OrderService::getExpeditionOrders()
- PickingService::startPicking()
- PickingService::completePicking()
- FlexxusClient (con HTTP fake)

**Feature Tests:**
- POST /api/auth/login
- GET /api/mobile/pickings/expedition
- POST /api/mobile/pickings/{id}/start
- POST /api/mobile/pickings/{id}/complete
- Lock de pedido (concurrencia)

### Móvil Tests

**Component Tests:**
- LoginScreen
- PickingListScreen
- PickingDetailScreen
- ProductItem

**Integration Tests:**
- Flujo completo de login → pedidos → armado
- Offline mode
- Error handling

### E2E Tests

**Escenarios:**
1. Operario toma pedido, arma, completa
2. Dos operarios intentan tomar mismo pedido
3. Error de sincronización con Flexxus
4. Stock bajo → alerta en CMS

---

## Documentación Relacionada

1. **Estrategia de Auth:** `docs/plans/2026-03-02-auth-strategy-analysis.md`
2. **Diseño de Auth:** `docs/plans/2026-03-02-auth-system-design.md`
3. **Integración Flexxus:** `docs/plans/2026-03-02-flexxus-warehouse-integration-plan.md`
4. **Brief Original:** `docs/Brief_Agente_IA_App_Picking_Flexxus.md`
5. **API Flexxus:** `docs/swagger-ui-init.js`

---

## Próximos Pasos

### Inmediato (Esta semana)

1. ✅ **Revisar este documento** con el equipo
2. ✅ **Validar con funcional:** Tipo de comprobante de cierre (¿RE es correcto?)
3. ✅ **Definir formato de ubicaciones** estándar
4. ✅ **Preparar ambiente de desarrollo:**
   - XAMPP con MySQL
   - Laravel 12 instalado
   - Node.js + Expo
   - Redis para caché/queues

### Corto Plazo (Semanas 1-2)

1. **Comenzar Fase 1:**
   - [ ] Crear repositorios Git
   - [ ] Setup inicial de Laravel
   - [ ] Migraciones de BD
   - [ ] Implementar FlexxusClient
   - [ ] Autenticación Sanctum

2. **Primer integración con Flexxus:**
   - [ ] Probar login con CARLOSR/W250
   - [ ] Sincronizar depósitos
   - [ ] Sincronizar tipos de entrega
   - [ ] Verificar endpoint /v2/deliverydata

### Medio Plazo (Semanas 3-5)

1. **Implementar flujo de picking:**
   - [ ] Obtener NP filtradas por EXPEDICION
   - [ ] Tomar pedido (lock)
   - [ ] Ver detalle con líneas
   - [ ] Mostrar en móvil

2. **CMS básico:**
   - [ ] Dashboard con métricas
   - [ ] Lista de pickings en tiempo real
   - [ ] Gestión de usuarios

---

## Preguntas Frecuentes

**P: ¿Por qué no usamos directamente la API de Flexxus desde el móvil?**
R: Seguridad (credenciales expuestas), performance (sin caché), control (sin lógica local).

**P: ¿Qué pasa si Flexxus cae?**
R: La app sigue funcionando con datos locales. La sincronización se reanuda cuando vuelve.

**P: ¿Cómo evitamos que un operario tome un pedido ya tomado?**
R: Lock local con `assigned_user_id` y timeout de 30 minutos.

**P: ¿Qué pasa si el remito no se vincula correctamente a la NP?**
R: El picking queda en estado ERROR_SYNC, se registra el error y se puede reintentar manualmente desde el CMS.

**P: ¿Podemos agregar más tipos de entrega en el futuro?**
R: Sí, el sistema es flexible. Solo hay que sincronizar los tipos desde Flexxus.

**P: ¿El CMS funcionará en móvil?**
R: El CMS es web (Laravel Nova), diseñado para desktop/tablet. La app móvil es solo para operarios de depósito.

---

## Contacto y Soporte

**Documentación mantenida por:** OpenCode AI Agent
**Última actualización:** 2026-03-02
**Versión:** 1.0

**Para dudas o actualizaciones:**
- Revisar este documento primero
- Consultar documentación relacionada
- Ver logs de aplicación y Flexxus

---

**FIN DEL DOCUMENTO**
