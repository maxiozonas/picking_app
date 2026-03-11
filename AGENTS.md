# AGENTS.md - Guía para Agentes de Codificación

**Stack Tecnológico:** Laravel 12 | PHP 8.2 | MySQL/SQLite | PHPUnit | Sanctum | Spatie Permissions

---

## 🛠️ Comandos Esenciales

### Testing
```bash
# Ejecutar TODOS los tests
php artisan test

# Ejecutar UN único test (método específico)
php artisan test --filter test_picking_order_belongs_to_user

# Ejecutar tests de una clase específica
php artisan test tests/Unit/Models/PickingOrderProgressTest.php

# Ejecutar tests de una carpeta
php artisan test tests/Unit/Models/

# Ejecutar tests con coverage (si está configurado Xdebug)
php artisan test --coverage

# Ejecutar tests en paralelo (más rápido)
php artisan test --parallel

# Stop on first failure
php artisan test --stop-on-failure
```

### Code Quality
```bash
# Formatear código (Laravel Pint)
php artisan pint

# Verificar problemas de código sin modificar
php artisan pint --test

# Lint estándar Laravel
./vendor/bin/pint

# Detectar problemas de dependencias
composer check
```

### Base de Datos
```bash
# Ejecutar migraciones
php artisan migrate

# Rollback migración
php artisan migrate:rollback

# Fresh start (CUIDADO: borra datos)
php artisan migrate:fresh --seed

# Ver tablas
php artisan db:table picking_orders_progress

# Verificar estado de migraciones
php artisan migrate:status
```

### Desarrollo
```bash
# Servidor de desarrollo
php artisan serve

# Ver rutas (solo API)
php artisan route:list --path=api

# Ver rutas de picking
php artisan route:list --path=picking

# Crear控制器/模型/migration
php artisan make:controller Api/PickingController
php artisan make:model PickingOrderProgress
php artisan make:migration create_picking_alerts_table

# Limpiar cache
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

### Logs y Debugging
```bash
# Ver logs en tiempo real
php artisan pail

# Tail logs específicos
tail -f storage/logs/laravel.log
```

---

## 📐 Convenciones de Código

### Organización de Carpetas
```
app/
├── Http/
│   ├── Controllers/Api/       # Controladores API REST
│   ├── Requests/             # Form Request validation
│   └── Resources/            # API Resources (transformación)
├── Models/                   # Eloquent models (uno por tabla)
├── Services/                 # Lógica de negocio (Service Layer)
│   └── Interfaces/          # Interfaces para servicios
├── Http/Clients/            # External API clients (Flexxus)
└── Exceptions/              # Excepciones personalizadas
```

### Estilo de Clases

#### Models (Eloquent)
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PickingOrderProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        // ... más campos
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'has_stock_issues' => 'boolean',
    ];

    // Relaciones siempre con type hints
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes para queries reutilizables
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
```

**Reglas:**
- ✅ `protected $fillable` - Solo campos asignables masivamente
- ✅ `protected $casts` - Siempre castear fechas a datetime, booleans
- ✅ Type hints en relaciones: `BelongsTo`, `HasMany`, `BelongsToMany`
- ✅ Scopes con naming: `scope{Status}($query)`
- ✅ `use HasFactory` siempre en modelos

#### Services (Service Layer Pattern)
```php
<?php

namespace App\Services\Picking;

use App\Models\PickingOrderProgress;
use Illuminate\Pagination\LengthAwarePaginator;

class PickingService implements PickingServiceInterface
{
    private FlexxusPickingService $flexxusService;

    public function __construct(FlexxusPickingService $flexxusService)
    {
        $this->flexxusService = $flexxusService;
    }

    public function getAvailableOrders(int $userId, array $filters = []): LengthAwarePaginator
    {
        // Buscar modelo
        $user = User::with('warehouse')->findOrFail($userId);

        // Validar lógica de negocio
        if (!$user->warehouse) {
            throw new \Exception('User does not have a warehouse assigned');
        }

        // Usar servicio externo
        $orders = $this->flexxusService->getOrdersByDateAndWarehouse(
            now()->format('Y-m-d'),
            $user->warehouse->code
        );

        // Retornar paginado
        return collect($orders)->paginate(15);
    }
}
```

**Reglas:**
- ✅ SIEMPRE implementar interfaces: `PickingServiceInterface`
- ✅ Dependency injection en constructor: `private ServicioInterface $service`
- ✅ Type hints en parámetros y return types
- ✅ `findOrFail()` para buscar por ID (lanza 404 si no existe)
- ✅ Lanzar `\Exception` con mensajes descriptivos
- ✅ NO lógica de negocio en controladores (solo validación y orchestration)

##### Picking Domain Services

The following services are available in the `App\Services\Picking` namespace:

| Service | Interface | Description |
|---------|-----------|-------------|
| `PickingService` | `PickingServiceInterface` | Core picking operations (start, pick, complete) |
| `StockValidationService` | `StockValidationServiceInterface` | Real-time stock validation with Flexxus |
| `StockCacheService` | `StockCacheServiceInterface` | Aggressive caching (45s TTL) for stock data |
| `AlertService` | `AlertServiceInterface` | Alert management for stock issues |
| `FlexxusPickingService` | - | External API client for Flexxus ERP |
| `FlexxusClientFactory` | `FlexxusClientFactoryInterface` | Factory for creating warehouse-scoped Flexxus clients |

---

## 🏭 Factory Pattern para External API Clients

### FlexxusClientFactory - Multi-Account Architecture

**Propósito:** Crear instancias de FlexxusClient con credenciales específicas de cada warehouse.

**Arquitectura:**
- Cada warehouse tiene sus propias credenciales de Flexxus (flexxus_username, flexxus_password)
- Las credenciales están encriptadas en la base de datos usando `encrypted` cast
- El factory crea clientes con credenciales específicas y cache scopes por warehouse

#### FlexxusClientFactoryInterface

```php
<?php

namespace App\Services\Picking\Interfaces;

use App\Models\Warehouse;
use App\Http\Clients\Flexxus\FlexxusClient;

interface FlexxusClientFactoryInterface
{
    /**
     * Create a Flexxus client for a specific warehouse
     *
     * @param Warehouse $warehouse Warehouse with flexxus credentials
     * @return FlexxusClient Configured client instance
     */
    public function createForWarehouse(Warehouse $warehouse): FlexxusClient;
}
```

#### FlexxusClientFactory Implementation

```php
<?php

namespace App\Services\Picking;

use App\Http\Clients\Flexxus\FlexxusClient;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;

class FlexxusClientFactory implements FlexxusClientFactoryInterface
{
    public function createForWarehouse(Warehouse $warehouse): FlexxusClient
    {
        // Get credentials from warehouse (automatically decrypted by encrypted cast)
        // Falls back to config() if warehouse credentials are null
        $baseUrl = $warehouse->flexxus_url ?? config('flexxus.url');
        $username = $warehouse->flexxus_username ?? config('flexxus.username');
        $password = $warehouse->flexxus_password ?? config('flexxus.password');
        $deviceInfo = config('flexxus.device_info');

        // Use warehouse code as cache suffix for token scoping
        $cacheSuffix = $warehouse->code;

        return new FlexxusClient(
            $baseUrl,
            $username,
            $password,
            $deviceInfo,
            $cacheSuffix
        );
    }
}
```

#### Usage in Services

```php
<?php

namespace App\Services\Picking;

use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;

class FlexxusPickingService
{
    public function __construct(
        private FlexxusClientFactoryInterface $clientFactory
    ) {}

    public function getProductStock(
        string $productCode,
        Warehouse $warehouse
    ): array {
        // Create warehouse-specific client
        $client = $this->clientFactory->createForWarehouse($warehouse);

        // Use STOCKTOTALDEPOSITO from product endpoint
        $product = $client->getProduct($productCode);

        return [
            'available' => $product['STOCKTOTALDEPOSITO'] ?? 0,
            'warehouse_id' => $warehouse->id,
        ];
    }
}
```

#### Dependency Injection Setup

**Register in AppServiceProvider:**

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use App\Services\Picking\FlexxusClientFactory;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            FlexxusClientFactoryInterface::class,
            FlexxusClientFactory::class
        );
    }
}
```

**Reglas del Factory Pattern:**
- ✅ SIEMPRE inyectar la interface, NO la clase concreta
- ✅ El factory es responsable de crear y configurar instancias
- ✅ Los servicios reciben el factory por constructor, NO el cliente directamente
- ✅ Los clientes son creados por warehouse (no singleton global)
- ✅ Cada warehouse tiene su propio token cache key
- ✅ Las credenciales están encriptadas en BD (auto-decrypted por Eloquent cast)

---

## 🔐 Warehouse Credentials Management

### Database Schema

**Campos agregados a tabla `warehouses`:**
- `flexxus_username` - Usuario de Flexxus para este warehouse (encrypted)
- `flexxus_password` - Password de Flexxus para este warehouse (encrypted)

### Warehouse Model - Encrypted Credentials

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    protected $fillable = [
        'name',
        'code',
        'flexxus_username', // Se encripta automáticamente
        'flexxus_password', // Se encripta automáticamente
    ];

    protected $casts = [
        'flexxus_username' => 'encrypted',
        'flexxus_password' => 'encrypted',
    ];

    // Acceso transparente (auto-decrypt)
    public function getFlexxusCredentials(): array
    {
        return [
            'username' => $this->flexxus_username, // Decrypted automatically
            'password' => $this->flexxus_password, // Decrypted automatically
        ];
    }
}
```

### Migration Commands

#### FlexxusMigrateCredentialsCommand

**Migra credenciales desde .env a la base de datos:**

```bash
# Migrar credenciales globales a todos los warehouses
php artisan flexxus:migrate-credentials

# Migrar a un warehouse específico
php artisan flexxus:migrate-credentials --warehouse=CENTRO

# Verificar qué se va a migrar (dry-run)
php artisan flexxus:migrate-credentials --dry-run
```

**Qué hace:**
1. Lee `FLEXXUS_USERNAME` y `FLEXXUS_PASSWORD` desde .env
2. Encripta las credenciales usando Laravel encryption
3. Actualiza todos los warehouses (o uno específico) en BD
4. Opcionalmente elimina las variables de .env (con confirmación)

#### FlexxusResetCredentialsCommand

**Rollback de migración de credenciales:**

```bash
# Eliminar credenciales de todos los warehouses
php artisan flexxus:reset-credentials

# Eliminar de un warehouse específico
php artisan flexxus:reset-credentials --warehouse=CENTRO
```

**Qué hace:**
1. Setea `flexxus_username` y `flexxus_password` a NULL
2. El sistema vuelve a usar config() fallback (compatibilidad hacia atrás)

### Seguridad y Compatibilidad

**Encrypted Casts:**
- ✅ Las credenciales se encriptan al guardar en BD
- ✅ Se desencriptan automáticamente al acceder ($warehouse->flexxus_username)
- ✅ Usa APP_KEY de Laravel para encriptación
- ⚠️ Si cambias APP_KEY, las credenciales encriptadas se corrompen (requieren re-migración)

**Backward Compatibility (Fallback):**
- Si un warehouse NO tiene credenciales en BD (NULL), FlexxusClient usa config()
- Esto permite migración gradual sin downtime
- Verificar que config() tiene credenciales por defecto

**Testing:**
```php
public function test_warehouse_credentials_are_encrypted()
{
    $warehouse = Warehouse::factory()->create([
        'flexxus_username' => 'test_user',
        'flexxus_password' => 'test_password',
    ]);

    // Verificar que en BD están encriptados
    $dbPassword = DB::table('warehouses')
        ->where('id', $warehouse->id)
        ->value('flexxus_password');

    $this->assertNotEquals('test_password', $dbPassword);
    $this->assertNotEmpty($dbPassword);

    // Verificar que al acceder están desencriptados
    $this->assertEquals('test_password', $warehouse->flexxus_password);
}
```

---

## 📋 Comandos de Migración Flexxus

### Migración de Credenciales Multi-Account

```bash
# === MIGRACIÓN ===
# Migrar credenciales desde .env a BD (todos los warehouses)
php artisan flexxus:migrate-credentials

# Migrar a un warehouse específico
php artisan flexxus:migrate-credentials --warehouse=CENTRO

# Ver qué se va a hacer (sin hacer cambios)
php artisan flexxus:migrate-credentials --dry-run

# === ROLLBACK ===
# Eliminar credenciales de BD (volver a config global)
php artisan flexxus:reset-credentials

# Eliminar de un warehouse específico
php artisan flexxus:reset-credentials --warehouse=CENTRO
```

**Documentación completa:** Ver `docs/flexxus-multi-account-migration.md`

---

## 🔙 Backward Compatibility

### Config Fallback para Flexxus Client

**Escenario:** Si un warehouse no tiene credenciales en BD, usar configuración global.

**Implementación en FlexxusClient:**

```php
public function __construct(
    ?string $baseUrl = null,
    ?string $username = null,
    ?string $password = null,
    ?array $deviceInfo = null,
    ?string $cacheKeySuffix = null
) {
    // Use provided parameters or fall back to config (backward compatibility)
    $this->baseUrl = $baseUrl ?? config('flexxus.url');
    $this->username = $username ?? config('flexxus.username');
    $this->password = $password ?? config('flexxus.password');
    $this->deviceInfo = $deviceInfo ?? config('flexxus.device_info');
    $this->cacheKeySuffix = $cacheKeySuffix;
}
```

**Reglas:**
- ✅ Si `username/password` son NULL, usar config() global
- ✅ Esto permite migración gradual sin romper el sistema
- ✅ Warning en logs si se usa fallback (para trackear warehouses sin migrar)
- ✅ Una vez migrados todos los warehouses, se puede remover el fallback

#### Controllers (API RESTful)
```php
<?php

namespace App\Http\Controllers\Api;

use App\Services\Picking\PickingServiceInterface;
use App\Http\Resources\PickingOrderResource;

class PickingController extends Controller
{
    public function __construct(
        private PickingServiceInterface $pickingService
    ) {}

    public function index(Request $request)
    {
        $orders = $this->pickingService->getAvailableOrders(
            $request->user()->id,
            $request->only(['status', 'page', 'per_page'])
        );

        return PickingOrderResource::collection($orders);
    }
}
```

**Reglas:**
- ✅ Dependency injection de interfaces en constructor
- ✅ `private readonly` propiedades promoted PHP 8.2+
- ✅ Obener usuario desde `$request->user()` (Sanctum)
- ✅ SIEMPRE retornar API Resources (nunca modelos directamente)
- ✅ NO lógica de negocio en controladores (delegar a servicios)

#### Form Requests (Validación)
```php
<?php

namespace App\Http\Requests\Picking;

use Illuminate\Foundation\Http\FormRequest;

class PickItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // O implementar lógica de autorización
    }

    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer', 'min:1', 'max:1000'],
            'mark_as_completed' => ['nullable', 'boolean'],
        ];
    }
}
```

**Reglas:**
- ✅ Validar en Form Requests, NO en controladores
- ✅ `required` para campos obligatorios
- ✅ Usar validación Laravel: `integer`, `min`, `max`, `exists:table,column`
- ✅ `nullable` para campos opcionales

#### API Resources (Transformación)
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PickingOrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'customer' => $this->customer,
            // Transformar datos para API
        ];
    }
}
```

**Reglas:**
- ✅ SIEMPRE transformar con Resources antes de retornar
- ✅ Ocultar campos sensibles: `password`, `remember_token`
- ✅ Usar `$this->whenLoaded('relation')` para prevenir N+1
- ✅ Formatear fechas: `->toIso8601String()` o `->toDateString()`

---

## 🧪 Testing (TDD)

### Metodología: Red-Green-Refactor
1. **RED** - Escribir test que falla
2. **GREEN** - Escribir código mínimo para pasar
3. **REFACTOR** - Mejorar código

### Estructura de Tests
```php
<?php

namespace Tests\Unit\Models;

use App\Models\PickingOrderProgress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PickingOrderProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_picking_order_belongs_to_user(): void
    {
        // Arrange (Preparar)
        $user = User::factory()->create();
        $warehouse = Warehouse::factory()->create();
        $order = PickingOrderProgress::factory()->create([
            'user_id' => $user->id,
            'warehouse_id' => $warehouse->id,
        ]);

        // Act (Actuar)
        $result = $order->user;

        // Assert (Verificar)
        $this->assertInstanceOf(User::class, $result);
        $this->assertEquals($user->id, $result->id);
    }
}
```

**Reglas de Tests:**
- ✅ `use RefreshDatabase` para tests que tocan BD
- ✅ Descriptivo: `test_picking_order_belongs_to_user`
- ✅ AAA pattern: Arrange → Act → Assert
- ✅ Usar factories: `User::factory()->create()`
- ✅ Assertions claras: `$this->assertEquals($expected, $actual)`
- ✅ `void` return type en métodos de test
- ✅ NO mocks innecesarios (usar factories cuando sea posible)

---

## 🎯 Patrones Arquitectónicos

### Service Layer Pattern
```
Controller → Service → Repository/Model → Database
             ↓
         External Service (Flexxus)
```
- Controllers: Orquestration y validación
- Services: Lógica de negocio
- Models: Acceso a datos

### Interface Segregation
- Siempre crear interfaces para servicios: `PickingServiceInterface`
- Implementar en clase concreta: `PickingService implements PickingServiceInterface`
- Inyectar interfaces, NO clases concretas

---

## 📝 Convenciones de Nombres

### Clases
- **Models:** PascalCase, singular: `PickingOrderProgress`, `User`, `Warehouse`
- **Controllers:** PascalCase + sufijo: `PickingController`
- **Services:** PascalCase + sufijo: `PickingService`, `FlexxusPickingService`
- **Requests:** PascalCase + sufijo: `PickItemRequest`
- **Resources:** PascalCase + sufijo: `PickingOrderResource`
- **Factories:** PascalCase + sufijo: `PickingOrderProgressFactory`
- **Exceptions:** PascalCase + sufijo: `AuthenticationValidationException`

### Métodos
- **Públicos:** camelCase: `getAvailableOrders()`, `startOrder()`
- **Scopes:** camelCase con prefijo: `scopePending()`, `scopeInProgress()`
- **Test:** camelCase con prefijo: `test_picking_order_belongs_to_user()`

### Variables
- **CamelCase:** `$orderNumber`, `$warehouseCode`
- **Snake_case** para BD: `order_number`, `warehouse_id`

### Constantes
- **SCREAMING_SNAKE_CASE** para constants: `STATUS_PENDING`, `MAX_QUANTITY`

---

## ⚠️ Exception Handling Guidelines

### Custom Exception Hierarchy

**NEVER throw generic `\Exception`** for domain-specific conditions. Always use custom exceptions:

```php
// ❌ BAD - Generic exception
if (!$order) {
    throw new \Exception('Order not found');
}

// ✅ GOOD - Domain-specific exception
if (!$order) {
    throw new OrderNotFoundException($orderNumber, [
        'warehouse_id' => $user->warehouse_id,
        'user_id' => $user->id
    ]);
}
```

### Available Custom Exceptions

#### Picking Domain Exceptions

| Exception | HTTP Status | Error Code | When to Use |
|-----------|-------------|------------|-------------|
| `OrderNotFoundException` | 404 | `ORDER_NOT_FOUND` | Order not in Flexxus or local DB |
| `InvalidOrderStateException` | 400 | `INVALID_ORDER_STATE` | Invalid state transition |
| `WarehouseMismatchException` | 403 | `WAREHOUSE_MISMATCH` | Cross-warehouse access attempt |
| `OverPickException` | 400 | `OVER_PICK` | Attempting to pick more than required quantity |
| `PhysicalStockInsufficientException` | 400 | `PHYSICAL_STOCK_INSUFFICIENT` | Physical stock in warehouse is insufficient |
| `AlreadyPickedException` | 400 | `ALREADY_PICKED` | Item already fully picked |
| `InsufficientStockException` | 400 | `INSUFFICIENT_STOCK` | **DEPRECATED** - Use OverPickException or PhysicalStockInsufficientException |
| `UnauthorizedOperationException` | 403 | `FORBIDDEN` | Permission/ownership violation |

#### External API Exceptions

| Exception | HTTP Status | Error Code | When to Use |
|-----------|-------------|------------|-------------|
| `ExternalApiConnectionException` | 503 | `FLEXXUS_CONNECTION_ERROR` | Network/timeouts |
| `ExternalApiAuthenticationException` | 502 | `FLEXXUS_AUTH_FAILED` | Auth failures |
| `ExternalApiRequestException` | 502 | `FLEXXUS_REQUEST_FAILED` | API errors after retry |
| `ExternalApiServerErrorException` | 502 | `FLEXXUS_SERVER_ERROR` | 5xx from Flexxus |

### Throwing Exceptions

**Always include context** for debugging:

```php
// Service Layer Example
use App\Exceptions\Picking\OrderNotFoundException;
use App\Exceptions\Picking\InvalidOrderStateException;
use App\Exceptions\Picking\OverPickException;
use App\Exceptions\Picking\PhysicalStockInsufficientException;
use App\Exceptions\Picking\AlreadyPickedException;

public function startOrder(string $orderNumber, User $user): PickingOrder
{
    // 1. Check if order exists
    $order = $this->flexxusService->getOrder($orderNumber);
    if (!$order) {
        throw new OrderNotFoundException($orderNumber, [
            'warehouse_id' => $user->warehouse_id,
            'user_id' => $user->id
        ]);
    }

    // 2. Check state transition
    if ($order->status !== 'pending') {
        throw new InvalidOrderStateException(
            $orderNumber,
            $order->status,
            'start',
            ['current_status' => $order->status]
        );
    }

    // 3. Business logic continues...
}
```

**External API Exceptions**:

```php
use App\Exceptions\ExternalApi\ExternalApiConnectionException;
use App\Exceptions\ExternalApi\ExternalApiAuthenticationException;

public function fetchOrder(string $orderNumber): array
{
    try {
        $response = $this->httpClient->get("/orders/{$orderNumber}");

        if ($response->status() === 401) {
            throw new ExternalApiAuthenticationException(
                $this->baseUrl . "/orders/{$orderNumber}",
                401
            );
        }

        return $response->json();

    } catch (\GuzzleHttp\Exception\ConnectException $e) {
        throw new ExternalApiConnectionException(
            $this->baseUrl . "/orders/{$orderNumber}",
            $e
        );
    }
}
```

### Controller Exception Handling

**DO NOT catch exceptions in controllers** - let the global handler manage them:

```php
// ❌ BAD - Controller catches exceptions
public function start(Request $request, string $orderNumber)
{
    try {
        $order = $this->pickingService->startOrder($orderNumber, $request->user());
        return response()->json(['data' => $order]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

// ✅ GOOD - Controller delegates to global handler
public function start(Request $request, string $orderNumber)
{
    $order = $this->pickingService->startOrder($orderNumber, $request->user());
    return new PickingOrderResource($order);
}
```

### Exception Context Best Practices

**Include relevant debugging information**:

```php
throw new InsufficientStockException(
    $orderNumber,
    $itemCode,
    $requestedQty,
    $availableQty,
    [
        'warehouse_id' => $warehouse->id,
        'location' => $item->location,
        'user_id' => $user->id,
        'timestamp' => now()->toIso8601String()
    ]
);
```

**Context fields to include**:
- ✅ IDs: `order_number`, `user_id`, `warehouse_id`
- ✅ State: `current_state`, `attempted_action`
- ✅ Quantities: `requested_quantity`, `available_quantity`
- ✅ URLs: `endpoint` (for API errors)
- ✅ Previous exceptions: Chain with `$previous`

### Testing Exceptions

**Write tests that assert specific exception types**:

```php
use App\Exceptions\Picking\OrderNotFoundException;
use PHPUnit\Framework\TestCase;

class PickingServiceTest extends TestCase
{
    public function test_start_order_throws_not_found_when_missing()
    {
        // Arrange
        $service = new PickingService($mockFlexxus);
        $orderNumber = 'NP-999';

        // Expect
        $this->expectException(OrderNotFoundException::class);
        $this->expectExceptionMessage("Order {$orderNumber} not found");

        // Act
        $service->startOrder($orderNumber, $user);
    }

    public function test_pick_item_throws_insufficient_stock()
    {
        // Arrange
        $service = new PickingService($mockFlexxus);

        // Expect
        $this->expectException(InsufficientStockException::class);
        $this->expectExceptionCode(400); // HTTP status

        // Act
        $service->pickItem($order, 'PROD-001', 100); // Only 50 available
    }
}
```

### Creating New Exception Types

**Follow the exception hierarchy**:

1. **Extend BaseException**:

```php
<?php

namespace App\Exceptions\Picking;

use App\Exceptions\BaseException;

class NewDomainException extends BaseException
{
    public function __construct(
        string $relevantIdentifier,
        array $context = []
    ) {
        $message = "Descriptive message about {$relevantIdentifier}";

        $context['relevant_field'] = $relevantIdentifier;

        parent::__construct(
            $message,
            'ERROR_CODE_CONSTANT',  // Use UPPER_SNAKE_CASE
            400,                     // Appropriate HTTP status
            $context
        );
    }
}
```

2. **Add to Handler** (`app/Exceptions/Handler.php`):

```php
use App\Exceptions\Picking\NewDomainException;

public function render($request, Throwable $e)
{
    if ($e instanceof NewDomainException) {
        return response()->json([
            'error' => [
                'message' => $e->getMessage(),
                'error_code' => $e->getErrorCode(),
                'details' => config('app.debug') ? $e->getContext() : null
            ]
        ], $e->getHttpStatus());
    }

    // ... other exceptions
}
```

3. **Write tests**:

```php
// tests/Unit/Exceptions/NewDomainExceptionTest.php
public function test_exception_has_correct_error_code()
{
    $exception = new NewDomainException('test-id');

    $this->assertEquals('ERROR_CODE_CONSTANT', $exception->getErrorCode());
    $this->assertEquals(400, $exception->getHttpStatus());
}
```

### Error Response Format

**All errors follow this structure**:

```json
{
  "error": {
    "message": "Human-readable error description",
    "error_code": "ERROR_CODE_CONSTANT",
    "details": {
      // Only present in development (app.debug=true)
      "context_field": "value"
    }
  }
}
```

**For complete error code reference**, see `docs/error-codes.md`

### Common Exception Patterns

**Pattern 1: Not Found**
```php
throw new OrderNotFoundException($orderNumber, [
    'warehouse_id' => $user->warehouse_id
]);
```

**Pattern 2: Invalid State**
```php
throw new InvalidOrderStateException(
    $orderNumber,
    $currentState,
    $attemptedAction,
    ['allowed_states' => ['pending', 'ready']]
);
```

**Pattern 3: External API Failure**
```php
try {
    $response = $this->client->get($endpoint);
} catch (ConnectException $e) {
    throw new ExternalApiConnectionException($endpoint, $e);
} catch (RequestException $e) {
    if ($e->getResponse()->getStatusCode() === 401) {
        throw new ExternalApiAuthenticationException($endpoint, 401);
    }
    throw new ExternalApiRequestException(
        $endpoint,
        $e->getResponse()->getStatusCode(),
        $e->getResponse()->getBody()->getContents()
    );
}
```

### Legacy Error Responses (Deprecated)

```php
// ⚠️ DEPRECATED - Do not use in new code
return response()->json(['message' => 'Resource not found'], 404);

// ✅ INSTEAD - Throw exception
throw new OrderNotFoundException($identifier);
```

---

## 🚀 Imports y Organización

### Order de Imports (Alfabético)
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Picking\PickItemRequest;
use App\Http\Resources\PickingOrderResource;
use App\Services\Picking\PickingServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
```

### Order Preferido:
1. Root namespace
2. Sub-namespaces
3. Use statements alfabéticas
4. Clases del framework
5. Interfaces/Servicios

---

## ✅ NO Hacer

❌ **NUNCA:**
- Colocar lógica de negocio en controladores
- Acceder a `request()->all()` sin validación (usar Form Requests)
- Retornar modelos directamente desde controladores (usar Resources)
- Usar `DB::raw()` sin sanitización (SQL injection)
- Hardcodear configuraciones (usar `config()`)
- Usar variables globales
- Saltarse el escribir tests (TDD es obligatorio)
- Hacer commits sin pasar tests
- Usar `all()` sin paginación (performance)
- Ignorar N+1 queries (usar eager loading)

✅ **SIEMPRE:**
- Type hints en parámetros y return types
- Seguir PSR-12 (Laravel coding standard)
- Ejecutar `php artisan pint` antes de commits
- Escribir tests ANTES de implementar (TDD)
- Usar factories para datos de prueba
- Validación en Form Requests
- Usar API Resources para respuestas
- Eager loading: `User::with('warehouse')->get()`
- Manejar excepciones apropiadamente

---

## 🎓 Contexto del Proyecto

**Proyecto:** Sistema de Picking Orders para corralón (construcción)

**Arquitectura Híbrida:**
- Flexxus API (ERP externo) = Source of truth para pedidos (read-only)
- Base de datos local = Progreso de preparación, items marcados, alertas

**Objetivos:**
- Empleados ven SOLO pedidos de SU depósito
- Solo pedidos tipo EXPEDICION (retiro en sucursal)
- Solo del día actual
- Stock validation en tiempo real desde Flexxus
- Sistema de alertas para reportar problemas

**Tech Stack:**
- Backend: Laravel 12, PHP 8.2, MySQL/SQLite
- Auth: Laravel Sanctum (token-based)
- External API: Flexxus (integración HTTP)
- Testing: PHPUnit
- Code Style: Laravel Pint

---

## 🖥️ Desktop Application (Admin)

### Project Structure

```
flexxus-picking-desktop/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Layout components (Sidebar, Header)
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── orders/         # Orders-related components
│   │   └── auth/           # Authentication components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand stores
│   ├── lib/                # Utilities (API client, utils)
│   ├── types/              # TypeScript type definitions
│   └── test/               # Test files
├── public/                 # Static assets
└── dist/                   # Production build output
```

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server (Vite)
pnpm build            # Build for production
pnpm preview          # Preview production build

# Testing
pnpm test             # Run tests with Vitest
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Generate coverage report

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting
```

### Environment Variables

Create a `.env` file in `flexxus-picking-desktop/`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Flexxus Picking Desktop
VITE_APP_VERSION=1.0.0
```

### Development Workflow

#### 1. Setup Development Environment

```bash
# Navigate to desktop app directory
cd flexxus-picking-desktop

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The dev server will start at `http://localhost:5173`

#### 2. Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

#### 3. Building for Production

```bash
# Build production bundle
pnpm build

# Preview production build locally
pnpm preview
```

The production build will be in the `dist/` directory.

#### 4. Code Quality

```bash
# Check code style
pnpm lint

# Fix code style issues automatically
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Architecture

#### Frontend Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6
- **State Management:**
  - TanStack Query (React Query) for server state
  - Zustand for client state
- **Routing:** React Router v7
- **UI Library:** shadcn/ui with Tailwind CSS
- **HTTP Client:** Axios with interceptors
- **Testing:** Vitest + React Testing Library + MSW

#### Key Features

1. **Dashboard**
   - Real-time statistics with 30-second polling
   - Warehouse filtering
   - Date range selection
   - Visual stat cards with trends

2. **Orders Management**
   - Paginated orders list (15 per page default)
   - Advanced filtering (warehouse, status, search)
   - Debounced search (300ms)
   - Real-time updates

3. **Order Detail**
   - Complete order information
   - Items with pick status
   - Alerts with severity highlighting
   - Employee assignment info

4. **Authentication**
   - Token-based auth with Sanctum
   - Protected routes
   - Auto-logout on 401
   - Persistent sessions

### API Integration

The desktop app connects to the Laravel backend via these API endpoints:

```typescript
// Authentication
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

// Dashboard Stats (NEW)
GET /api/admin/dashboard/stats

// Orders Management (NEW)
GET /api/admin/orders
GET /api/admin/orders/{order_number}

// Warehouses
GET /api/admin/warehouses
```

### Testing Strategy

#### Unit Tests

- **Auth Store:** `src/stores/auth-store.test.ts`
- **Utilities:** `src/lib/utils.test.ts`
- **Custom Hooks:** `src/hooks/*.test.ts`

#### Integration Tests

- **API Hooks:** `src/test/integration/api-hooks.test.ts` (with MSW)
- **Component Tests:** `src/pages/*.test.tsx`

#### E2E Tests

- **User Flows:** `src/test/e2e/user-flows.test.tsx`
- **Functionality:** `src/test/functionality/*.test.tsx`
- **Error Handling:** `src/test/error-handling/*.test.tsx`

### Deployment

#### Local Development

```bash
# Start backend
cd flexxus-picking-backend
php artisan serve

# Start frontend (another terminal)
cd flexxus-picking-desktop
pnpm dev
```

#### Production Build

```bash
# Build frontend
cd flexxus-picking-desktop
pnpm build

# Deploy dist/ folder to web server
```

#### Configuration Notes

- The frontend expects the API at `VITE_API_BASE_URL`
- CORS must be configured in Laravel backend
- Token authentication required for all endpoints
- Admin role required for admin endpoints

### Troubleshooting

#### Common Issues

1. **CORS Errors**
   - Ensure Laravel backend has CORS configured
   - Check `VITE_API_BASE_URL` matches backend URL

2. **Authentication Failures**
   - Verify user has `admin` role
   - Check Sanctum configuration in Laravel
   - Ensure token is stored in localStorage

3. **Build Errors**
   - Run `pnpm install` to ensure dependencies
   - Check TypeScript errors in build output
   - Run `pnpm lint` to check for code issues

 4. **Test Failures**
    - Ensure MSW handlers are properly configured
    - Check test environment variables
    - Run tests with `--inspect` for debugging

### TanStack Query (React Query) Patterns

The desktop app uses TanStack Query v5 for server state management with centralized cache configuration.

#### Cache Configuration (`src/lib/query-config.ts`)

```typescript
export const QueryCacheTime = {
  Stats: 30000,           // 30s - Dashboard stats
  StatsRefetch: 30000,    // 30s - Auto-refetch interval
  PendingOrders: 30000,   // 30s - Pending orders list
  Inventory: 30000,       // 30s - Inventory list
  Orders: 45000,          // 45s - Orders list (more stable)
  OrderDetail: 60000,     // 60s - Single order detail
  Employees: 60000,       // 60s - Employees list
  Warehouses: 300000,     // 5min - Warehouses (rarely changes)
  StockSearch: 30000,     // 30s - Stock search results
} as const
```

#### QueryClient Configuration (`src/main.tsx`)

```typescript
import { QueryClient } from '@tanstack/react-query'
import { retryFn, retryDelay, NonRetryableStatuses } from '@/lib/query-config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry logic with exponential backoff
      retry: retryFn,
      retryDelay: retryDelay,

      // Don't retry on client errors (4xx)
      // NonRetryableStatuses: [401, 403, 404, 422]

      // Default stale time (can be overridden per query)
      staleTime: 30000, // 30 seconds

      // Keep garbage collection short
      gcTime: 300000, // 5 minutes
    },
  },
})
```

#### Placeholder Data Pattern

For smooth UX during pagination transitions, use the built-in `keepPreviousData` sentinel from TanStack Query v5:

```typescript
import { useQuery, keepPreviousData } from '@tanstack/react-query'

export function useOrders(params: UseOrdersParams = {}) {
  return useQuery<PaginatedResponse<PickingOrder>>({
    queryKey: ['orders', selectedWarehouseId, search, status, page, perPage],
    queryFn: async () => { /* ... */ },
    // Retains previous page data during pagination transitions (keepPreviousData)
    // On cold cache (first load): data=undefined, isPlaceholderData=false — skeletons shown via isLoading
    placeholderData: keepPreviousData,
    staleTime: QueryCacheTime.Orders,
  })
}
```

**Important:** Do NOT use custom `generatePlaceholder*()` functions that fabricate fake rows. These cause stat counters (e.g. "15 pedidos totales") to flash incorrect values on first load. The correct idiom is `keepPreviousData`:

| Scenario | `generatePlaceholder*` (WRONG) | `keepPreviousData` (CORRECT) |
|----------|-------------------------------|------------------------------|
| First load | `isPlaceholderData=true`, fake 15 rows shown | `isPlaceholderData=false`, `data=undefined`, real skeleton shown |
| Page 1→2 | Previous data retained | Previous data retained (same) |
| Real data arrives | Real data shown | Real data shown (same) |

**Stat counter guard:** When using `keepPreviousData`, guard stat counters with `!isPlaceholderData` to prevent stale counts showing during pagination:

```typescript
// OrdersPage.tsx / InProgressPage.tsx
{data && !isPlaceholderData && (
  <span>{data.meta.total} pedidos totales</span>
)}

// InventoryPage.tsx (list vs search mode)
{(!isSearching ? !listQuery.isPlaceholderData : true) && (
  <div className="grid grid-cols-3 gap-4">
    {/* stats cards */}
  </div>
)}
```

#### Query Key Patterns

Consistent query keys enable efficient cache management:

```typescript
// Simple query
queryKey: ['stats', warehouseId, dateFrom, dateTo]

// Paginated list
queryKey: ['orders', warehouseId, search, status, page, perPage]

// Single item
queryKey: ['order', orderNumber]

// Search with parameters
queryKey: ['inventory', 'search', { productCode, warehouseId }]
```

#### Mutation with Cache Invalidation

```typescript
export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const response = await api.post('/admin/users', data)
      return response.data
    },
    onSuccess: () => {
      // Invalidate related queries to refetch
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al crear empleado'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      })
    },
  })
}
```

#### Best Practices

1. **Use Centralized Cache Constants**
   - Import from `@/lib/query-config`
   - Don't hardcode staleTime values
   - Keep cache times consistent across hooks

2. **Choose staleTime Based on Data Volatility**
   - **High volatility** (stats, orders): 30-45 seconds
   - **Medium volatility** (employees, inventory): 60 seconds
   - **Low volatility** (warehouses): 5 minutes

3. **Use Placeholder Data for Lists**
   - Prevents layout shift during pagination
   - Shows skeleton UI instead of blank screen
   - Improves perceived performance

4. **Enable Queries Conditionally**
   ```typescript
   enabled: !!orderNumber  // Only fetch if orderNumber exists
   enabled: productCode.trim().length >= 2  // Only search after 2 chars
   ```

5. **Retry Logic**
   - Automatic retry with exponential backoff
   - Max 3 attempts for network errors
   - No retry for client errors (4xx)
   - Special handling for 408 (timeout) and 429 (rate limit)

6. **Query Invalidation After Mutations**
   ```typescript
   queryClient.invalidateQueries({ queryKey: ['employees'] })
   queryClient.invalidateQueries({ queryKey: ['employees', warehouseId] })
   ```

#### Available Hooks

| Hook | Cache Time | Description | Location |
|------|-----------|-------------|----------|
| `useStats` | 30s | Dashboard statistics | `src/hooks/use-stats.ts` |
| `useOrders` | 45s | Orders list (paginated) | `src/hooks/use-orders.ts` |
| `useOrderDetail` | 60s | Single order details | `src/hooks/use-orders.ts` |
| `usePendingOrders` | 30s | Pending orders list | `src/hooks/use-pending-orders.ts` |
| `useEmployees` | 60s | Employees list | `src/hooks/use-employees.ts` |
| `useWarehouses` | 5min | Warehouses list | `src/hooks/use-employees.ts` |
| `useInventory` | 30s | Inventory list | `src/hooks/use-inventory.ts` |
| `useStockSearch` | 30s | Stock search | `src/hooks/use-inventory.ts` |
| `useAuth` | - | Authentication mutations | `src/hooks/use-auth.ts` |

---

## 📌 Checklist Antes de Commits

- [ ] Tests pasando: `php artisan test`
- [ ] Code style correcto: `php artisan pint`
- [ ] No código comentado
- [ ] No `var_dump()` o `dd()` en producción
- [ ] Type hints presentes
- [ ] PSR-12 compliance
- [ ] Lógica de negocio en Services, NO en Controllers
- [ ] Validación en Form Requests
- [ ] API Resources usados en controladores
- [ - ] Docs actualizados si es API pública

---

**Última actualización:** 2026-03-05
**Versión:** 1.1.0 (Multi-Account Flexxus)
**Framework:** Laravel 12 (PHP 8.2+)
