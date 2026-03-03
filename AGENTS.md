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

## ⚠️ Manejo de Errores

### Exceptions
```php
// Lógica de negocio
if (!$warehouse) {
    throw new \Exception('User does not have a warehouse assigned');
}

// Not found
$user = User::findOrFail($userId); // 404 automáticamente

// Validación
$request->validated(); // Lanza ValidationException (422)
```

### Respuestas de Error
```php
// 401 Unauthorized
return response()->json(['message' => 'Unauthenticated'], 401);

// 403 Forbidden
return response()->json(['message' => 'Forbidden'], 403);

// 404 Not Found
return response()->json(['message' => 'Resource not found'], 404);

// 422 Validation Error
throw ValidationException::withMessages([
    'quantity' => ['Quantity must be greater than 0']
]);

// 500 Server Error
return response()->json(['message' => 'Internal server error'], 500);
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
