# Picking Orders API para Mobile - Plan de Implementación

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar API de pedidos de picking para mobile que permite a empleados ver pedidos pendientes/en progreso, quién los está armando, y el detalle con items.

**Architecture:** 
- Flexxus es la fuente de verdad (solo lectura)
- BD local guarda progreso (status, items pickeados, usuario asignado)
- Endpoint lista pedidos filtrados por estado
- Endpoint detalle con info de stock y ubicación (placeholder)

**Tech Stack:** Laravel 12, PHP 8.2, Sanctum, Flexxus API

---

## Estado Actual

Ya existe:
- PickingOrderProgress model con status, user_id, warehouse_id
- PickingItemProgress model con quantity_picked, status
- PickingService con getAvailableOrders y getOrderDetail
- PickingController con endpoints

Falta:
- Filtro por defecto (pending + in_progress)
- Include de assigned_to (nombre del usuario que lo tiene)
- Campo items_picked en lista
- Endpoint para ver completados

---

### Task 1: Modificar filtro por defecto en getAvailableOrders

**Archivos:**
- Modificar: `flexxus-picking-backend/app/Services/Picking/PickingService.php`

**Step 1: Agregar filtro por defecto**

En el método `getAvailableOrders`, cambiar la lógica para que por defecto retorne solo pending e in_progress:

```php
// En PickingService.php, método getAvailableOrders, alrededor de línea 61
// Cambiar de:
// if (isset($filters['status'])) {
//     $mergedOrders = $mergedOrders->filter(fn ($o) => $o['status'] === $filters['status']);
// }

// A:
if (isset($filters['status'])) {
    if ($filters['status'] === 'all') {
        // No filtrar, mostrar todos
    } else {
        $mergedOrders = $mergedOrders->filter(fn ($o) => $o['status'] === $filters['status']);
    }
} else {
    // Por defecto: solo pending + in_progress
    $mergedOrders = $mergedOrders->filter(fn ($o) => 
        in_array($o['status'], ['pending', 'in_progress'])
    );
}
```

**Step 2: Ejecutar tests**

```bash
php artisan test --filter="PickingServiceTest"
```

**Step 3: Commit**

```bash
git add app/Services/Picking/PickingService.php
git commit -m "feat: filter orders by default to pending+in_progress"
```

---

### Task 2: Agregar assigned_to en lista de pedidos

**Archivos:**
- Modificar: `flexxus-picking-backend/app/Services/Picking/PickingService.php`

**Step 1: Modificar getAvailableOrders para incluir assigned_to**

En el método `getAvailableOrders`, dentro del map que transforma las orders (alrededor de línea 40-59), agregar assigned_to:

```php
// En el array retornado por el map, agregar:
'assigned_to' => $progress && $progress->user 
    ? [
        'id' => $progress->user->id,
        'name' => $progress->user->name,
    ] 
    : null,
'items_picked' => $progress 
    ? $progress->items()->where('status', 'completed')->count() 
    : 0,
```

También hay que agregar 'user' al eager loading del modelo PickingOrderProgress. Verificar que el modelo tenga la relación user:

```bash
grep -n "function user" app/Models/PickingOrderProgress.php
```

Si no existe, agregarla.

**Step 2: Ejecutar tests**

```bash
php artisan test
```

**Step 3: Commit**

```bash
git add app/Services/Picking/PickingService.php
git commit -m "feat: include assigned_to and items_picked in orders list"
```

---

### Task 3: Verificar PickingOrderProgress tiene relación user

**Archivos:**
- Revisar: `flexxus-picking-backend/app/Models/PickingOrderProgress.php`

**Step 1: Verificar relación**

```bash
grep -n "function user" app/Models/PickingOrderProgress.php
```

Si no existe, crear:

```php
public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}
```

**Step 2: Agregar si no existe**

```bash
git add app/Models/PickingOrderProgress.php
git commit -m "fix: add user relationship to PickingOrderProgress"
```

---

### Task 4: Crear API Resource para PickingOrder

**Archivos:**
- Crear: `flexxus-picking-backend/app/Http/Resources/PickingOrderResource.php`

**Step 1: Crear el resource**

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PickingOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'order_number' => $this->order_number,
            'customer' => $this->customer,
            'status' => $this->status,
            'assigned_to' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'items_count' => $this->items_count,
            'items_picked' => $this->items_picked,
            'created_at' => $this->created_at?->toIso8601String(),
            'started_at' => $this->started_at?->toIso8601String(),
            'warehouse' => [
                'code' => $this->warehouse->code ?? null,
                'name' => $this->warehouse->name ?? null,
            ],
        ];
    }
}
```

**Step 2: Commit**

```bash
git add app/Http/Resources/PickingOrderResource.php
git commit -m "feat: create PickingOrderResource for API response"
```

---

### Task 5: Actualizar PickingController para usar el filtro por defecto

**Archivos:**
- Modificar: `flexxus-picking-backend/app/Http/Controllers/Api/PickingController.php`

**Step 1: Verificar endpoint actual**

Revisar el método index() del controlador para ver cómo llama al servicio.

**Step 2: El filtro por defecto ya está en el servicio, verificar que se use correctamente**

No debería hacer falta cambio, pero verificar que no haya filtros hardcodeados en el controlador.

**Step 3: Commit si hay cambios**

```bash
git add app/Http/Controllers/Api/PickingController.php
git commit -m "refactor: ensure default filter is applied in controller"
```

---

### Task 6: Verificar que el start order guarde user_id

**Archivos:**
- Revisar: `flexxus-picking-backend/app/Services/Picking/PickingService.php` método startOrder

**Step 1: Verificar que guarde el usuario**

Buscar en el método startOrder que guarde user_id:

```bash
grep -n "user_id" app/Services/Picking/PickingService.php
```

Debería estar alrededor de línea 162-170 donde crea PickingOrderProgress.

**Step 2: Si no está, agregarlo**

El método debe recibir $userId y guardarlo:

```php
$progress = PickingOrderProgress::create([
    'order_number' => $orderNumber,
    'warehouse_id' => $warehouse->id,
    'user_id' => $userId,  // AGREGAR ESTO
    'status' => 'in_progress',
    'started_at' => now(),
]);
```

**Step 3: Commit**

```bash
git add app/Services/Picking/PickingService.php
git commit -m "fix: save user_id when starting order"
```

---

### Task 7: Tests de integración

**Archivos:**
- Modificar: `flexxus-picking-backend/tests/Feature/Picking/PickingControllerTest.php`

**Step 1: Agregar test para filtro por defecto**

```php
public function test_list_orders_filters_by_default_to_pending_and_in_progress(): void
{
    $user = User::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $user->warehouse_id = $warehouse->id;
    $user->save();

    // Crear pedido completado (no debería aparecer por defecto)
    PickingOrderProgress::factory()->create([
        'order_number' => 'NP COMPLETED',
        'warehouse_id' => $warehouse->id,
        'user_id' => $user->id,
        'status' => 'completed',
    ]);

    // Crear pedido pending (debería aparecer)
    PickingOrderProgress::factory()->create([
        'order_number' => 'NP PENDING',
        'warehouse_id' => $warehouse->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($user)
        ->getJson('/api/picking/orders');

    $response->assertOk();
    $orders = $response->json('data');
    
    // Solo debe aparecer el pending
    $this->assertCount(1, $orders);
    $this->assertEquals('NP PENDING', $orders[0]['order_number']);
}
```

**Step 2: Agregar test para assigned_to**

```php
public function test_list_orders_includes_assigned_to(): void
{
    $user = User::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $user->warehouse_id = $warehouse->id;
    $user->save();

    $assignedUser = User::factory()->create(['name' => 'Test Operario']);

    PickingOrderProgress::factory()->create([
        'order_number' => 'NP INPROGRESS',
        'warehouse_id' => $warehouse->id,
        'user_id' => $assignedUser->id,
        'status' => 'in_progress',
    ]);

    $response = $this->actingAs($user)
        ->getJson('/api/picking/orders?status=all');

    $response->assertOk();
    $orders = $response->json('data');
    
    $this->assertEquals($assignedUser->id, $orders[0]['assigned_to']['id']);
    $this->assertEquals('Test Operario', $orders[0]['assigned_to']['name']);
}
```

**Step 3: Ejecutar tests**

```bash
php artisan test --filter="PickingControllerTest"
```

**Step 4: Commit**

```bash
git add tests/Feature/Picking/PickingControllerTest.php
git commit -m "test: add tests for default filter and assigned_to"
```

---

### Task 8: Verificación manual

**Step 1: Probar con curl**

```bash
# Login como empleado
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"username":"operario1","password":"password"}' | jq -r '.data.token')

# Ver pedidos (por defecto - solo pending/in_progress)
curl -s http://localhost:8000/api/picking/orders \
  -H "Authorization: Bearer $TOKEN" | jq

# Ver todos los pedidos
curl -s "http://localhost:8000/api/picking/orders?status=all" \
  -H "Authorization: Bearer $TOKEN" | jq

# Ver solo completados
curl -s "http://localhost:8000/api/picking/orders?status=completed" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Step 2: Verificar estructura de respuesta**

Debería incluir:
- order_number
- customer
- status
- assigned_to (con id y name)
- items_count
- items_picked
- created_at
- started_at
- warehouse (code, name)

---

## Resumen de Cambios

| Task | Descripción |
|------|-------------|
| 1 | Filtro por defecto pending + in_progress |
| 2 | Agregar assigned_to e items_picked |
| 3 | Verificar relación user en modelo |
| 4 | Crear PickingOrderResource |
| 5 | Verificar controller usa filtros |
| 6 | Verificar startOrder guarda user_id |
| 7 | Tests de integración |
| 8 | Verificación manual |

## API Resultante

```
GET /api/picking/orders
  - Sin params: pending + in_progress
  - ?status=all: todos
  - ?status=pending: solo pending
  - ?status=in_progress: solo in_progress
  - ?status=completed: solo completados
```

Response:
```json
{
  "data": [
    {
      "order_number": "NP 623136",
      "customer": "Juan Perez",
      "status": "in_progress",
      "assigned_to": {
        "id": 2,
        "name": "Operario Central"
      },
      "items_count": 5,
      "items_picked": 2,
      "created_at": "2026-03-03T10:00:00Z",
      "started_at": "2026-03-03T11:30:00Z",
      "warehouse": {
        "code": "001",
        "name": "DON BOSCO"
      }
    }
  ]
}
```
