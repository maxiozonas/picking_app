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

**Última actualización:** 2026-03-03
**Versión:** 1.0.0
**Framework:** Laravel 12 (PHP 8.2+)
