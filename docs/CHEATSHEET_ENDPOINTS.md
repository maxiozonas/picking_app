# Cheat Sheet - Endpoints Flexxus (Flujo Completo)

**Uso:** Referencia rápida para desarrolladores
**Fecha:** 2026-03-02

---

## FLUJO COMPLETO: Login → Pedido Completado

```
1. LOGIN (Backend)
2. SINCRONIZAR DEPÓSITOS (Background)
3. OBTENER PEDIDOS EXPEDICIÓN (App)
4. TOMAR PEDIDO (App)
5. MARCAR PRODUCTOS (App)
6. COMPLETAR ARMADO (App)
7. CREAR REMITO EN FLEXXUS (Background)
```

---

## 1. LOGIN 🔐

**IMPORTANTE:** Flexxus devuelve el depósito del usuario en la respuesta del login.

**CUÁNDO:** Al iniciar la app
**QUIÉN:** Backend Laravel o App Móvil (según decisión final)
**FRECUENCIA:** Cada vez que expira el token (1 hora)

### Endpoint

```http
POST /auth/login
Host: https://pruebagiliycia.procomisp.com.ar
Content-Type: application/json

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

### Response (CON DATO CRÍTICO)

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expireIn": 1772561730,
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "CARLOSR",
    "full_name": "RODRIGUEZ CARLOS",
    "warehouse_id": "002",           // ← CRÍTICO: Depósito del usuario
    "warehouse_name": "RONDEAU"       // ← CRÍTICO: Nombre del depósito
  },
  "config": {
    "warehouse_id": "002"             // ← También está aquí
  }
}
```

**CAMBIO IMPORTANTE:**
- ✅ El depósito viene en la respuesta: `user.warehouse_id` y `user.warehouse_name`
- ✅ **SOLUCIÓN RECOMENDADA:** Crear cuentas de Flexxus por depósito (CARLOSR_DONBOSCO, CARLOSR_RONDEAU, etc.)
- ✅ **SIMPLIFICACIÓN:** Con esto, NO necesitamos backend Laravel para auth (la app va directo a Flexxus)
- ⚠️ **PENDIENTE CONFIRMACIÓN:** Hablar con directivos para crear las cuentas de Flexxus

**Ver análisis completo:** `docs/DECISION_AUTENTICACION_DIRECTIVOS.md`

### Implementación Laravel

```php
// app/Http/Clients/Flexxus/FlexxusClient.php

public function authenticate(): array
{
    $response = Http::post($this->baseUrl . '/auth/login', [
        'username' => $this->username,
        'password' => $this->password,
        'deviceinfo' => $this->deviceInfo
    ]);

    if (!$response->successful()) {
        throw new RuntimeException('Auth failed');
    }

    $data = $response->json();

    // Cache token por 1 hora
    Cache::put('flexxus_token', $data['token'], now()->addSeconds($data['expireIn']));

    return $data;
}
```

### Cache

```php
// Usar token cacheado en requests siguientes
$token = Cache::remember('flexxus_token', 3600, function () {
    return $this->authenticate()['token'];
});
```

---

## 2. SINCRONIZAR DEPÓSITOS 🏭

**CUÁNDO:** Una sola vez al inicio o manualmente
**QUIÉN:** Backend Laravel
**FRECUENCIA:** NO necesita sincronización periódica

**IMPORTANTE:** Los depósitos son FIJOS. No cambian. Se sincronizan UNA vez.

### Endpoint

```http
GET /warehouses
```

### Response

```json
{
  "data": [
    {
      "CODIGODEPOSITO": "001",
      "DESCRIPCION": "DON BOSCO",
      "UBICACION": "Sector A, Calle 1",
      "CLIENTE": "CLIENTE 1",
      "SUCURSAL": "SUCURSAL 1",
      "DEPOSITOVISIBLE": 1,
      "ACTIVO": 1
    }
  ]
}
```

### Implementación Laravel

```php
// app/Jobs/SyncWarehousesJob.php

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

    Log::info('Warehouses synced successfully');
}
```

### Programar Job

```bash
# app/Console/Kernel.php

protected function schedule(Schedule $schedule)
{
    $schedule->job(new SyncWarehousesJob)->hourly();
}
```

---

## 3. OBTENER PEDIDOS EXPEDICIÓN 📋

**CUÁNDO:** Operario abre app y ve lista de pedidos
**QUIÉN:** Backend Laravel
**FRECUENCIA:** On-demand (cada vez que el operario refresca)

### PASO 3.1: Obtener todas las NP del depósito

```http
GET /orders?warehouse_id=001
```

### Response

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

### PASO 3.2: Para cada NP, verificar si es EXPEDICIÓN

```http
GET /v2/deliverydata/NP/623136
```

### Response

```json
{
  "data": [
    {
      "CODIGOTIPOENTREGA": 1,  // ← 1 = EXPEDICION ✅
      "DIRECCION": "-",
      "BARRIO": "ALTOS DEL PINAR",
      "LOCALIDAD": "BAHIA BLANCA",
      "RESPONSABLERECEPCION": "GILI PRESUPUESTO",
      "OBSERVACIONES": ""
    }
  ]
}
```

### Implementación Laravel

```php
// app/Services/OrderService.php

public function getExpeditionOrders(string $warehouseCode): array
{
    // 1. Obtener todas las NP del depósito
    $allOrders = $this->flexxusClient->getOrders([
        'warehouse_id' => $warehouseCode
    ]);

    $expeditionOrders = [];

    // 2. Filtrar solo NP
    $npOrders = array_filter($allOrders['data'], function($order) {
        return $order['TIPOCOMPROBANTE'] === 'NP';
    });

    // 3. Para cada NP, verificar tipo de entrega
    foreach ($npOrders as $order) {
        $deliveryData = $this->flexxusClient->getDeliveryData(
            'NP',
            $order['NUMEROCOMPROBANTE']
        );

        // 4. Solo EXPEDICION (tipo = 1)
        if ($deliveryData['data'][0]['CODIGOTIPOENTREGA'] == 1) {
            $order['DELIVERY_DATA'] = $deliveryData['data'][0];
            $expeditionOrders[] = $order;
        }
    }

    return $expeditionOrders;
}
```

### Endpoint para Móvil

```php
// routes/api.php

Route::get('/mobile/pickings/expedition', [PickingController::class, 'index']);
```

```php
// app/Http/Controllers/Api/Mobile/PickingController.php

public function index(Request $request)
{
    $warehouseCode = $request->user()->warehouse->code;

    $orders = $this->orderService->getExpeditionOrders($warehouseCode);

    return response()->json([
        'success' => true,
        'data' => $orders
    ]);
}
```

---

## 4. TOMAR PEDIDO 🎯

**CUÁNDO:** Operario selecciona un pedido
**QUIÉN:** Backend Laravel

### PASO 4.1: Obtener detalle del pedido

```http
GET /orders/NP/623136
```

### Response

```json
{
  "data": {
    "TIPOCOMPROBANTE": "NP",
    "NUMEROCOMPROBANTE": 623136,
    "FECHAENTREGA": "2026-03-05",
    "RAZONSOCIAL": "CLIENTE S.A.",
    "CODIGOCLIENTE": "C001",
    "OBSERVACIONES": "Entregar antes de las 14hs",
    "Detalle": [
      {
        "LINEA": 1,
        "CODIGOPARTICULAR": "ART-001",
        "DESCRIPCION": "Cemento 50kg",
        "CANTIDAD": 10,
        "PENDIENTE": 10,
        "CANTIDADPREPARADA": 0,
        "OBSERVACIONES": ""
      },
      {
        "LINEA": 2,
        "CODIGOPARTICULAR": "ART-002",
        "DESCRIPCION": "Arena 1m³",
        "CANTIDAD": 5,
        "PENDIENTE": 5,
        "CANTIDADPREPARADA": 0
      }
    ]
  }
}
```

### PASO 4.2: Crear registro local de picking

```php
// app/Services/PickingService.php

public function startPicking(int $orderNumber, int $userId): Picking
{
    // 1. Obtener detalle desde Flexxus
    $orderDetail = $this->flexxusClient->getOrderDetail('NP', $orderNumber);

    // 2. Validar que esté disponible
    $existing = Picking::where('order_number', $orderNumber)
        ->where('status', 'EN_ARMADO')
        ->first();

    if ($existing && $existing->started_at->gt(now()->subMinutes(30))) {
        throw new PickingAlreadyTakenException();
    }

    // 3. Crear picking local
    $picking = Picking::create([
        'order_type' => 'NP',
        'order_number' => $orderNumber,
        'warehouse_id' => auth()->user()->warehouse_id,
        'assigned_user_id' => $userId,
        'status' => 'EN_ARMADO',
        'started_at' => now()
    ]);

    // 4. Crear líneas
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

    // 5. Registrar evento
    PickingEvent::create([
        'picking_id' => $picking->id,
        'event_type' => 'STARTED',
        'created_by' => $userId
    ]);

    return $picking;
}
```

### Endpoint para Móvil

```php
Route::post('/mobile/pickings/{id}/start', [PickingController::class, 'start']);
```

---

## 5. MARCAR PRODUCTOS ✅

**CUÁNDO:** Operario marca productos como preparados
**QUIÉN:** App Móvil actualiza tabla local (sin llamar Flexxus)

### Endpoint (Solo actualiza DB local)

```http
POST /api/mobile/pickings/{id}/items/{line}/pick
Content-Type: application/json

{
  "quantity": 5
}
```

### Implementación Laravel

```php
// app/Http/Controllers/Api/Mobile/PickingController.php

public function pickItem(Request $request, $id, $line)
{
    $picking = Picking::findOrFail($id);
    $item = $picking->items()->where('line_number', $line)->first();

    // Validar cantidad
    if ($request->quantity > $item->qty_pending) {
        return response()->json([
            'success' => false,
            'message' => 'Cantidad excede pendiente'
        ], 422);
    }

    // Actualizar
    $item->update([
        'qty_picked' => $item->qty_picked + $request->quantity,
        'qty_pending' => $item->qty_pending - $request->quantity
    ]);

    // Registrar evento
    PickingEvent::create([
        'picking_id' => $picking->id,
        'event_type' => 'ITEM_PICKED',
        'payload' => [
            'line' => $line,
            'quantity' => $request->quantity
        ],
        'created_by' => auth()->id()
    ]);

    return response()->json([
        'success' => true,
        'data' => $item->fresh()
    ]);
}
```

---

## 6. COMPLETAR ARMADO ✅

**CUÁNDO:** Operario termina de armar todo el pedido
**QUIÉN:** Backend Laravel

### Endpoint

```http
POST /api/mobile/pickings/{id}/complete
```

### Implementación Laravel

```php
// app/Http/Controllers/Api/Mobile/PickingController.php

public function complete(Request $request, $id)
{
    $picking = Picking::findOrFail($id);

    // 1. Validar que todo esté completado
    $incomplete = $picking->items()->where('qty_pending', '>', 0)->count();

    if ($incomplete > 0) {
        return response()->json([
            'success' => false,
            'message' => "Faltan {$incomplete} líneas por completar"
        ], 422);
    }

    // 2. Actualizar estado
    $picking->update([
        'status' => 'ARMADO_LOCAL',
        'finished_at' => now()
    ]);

    // 3. Registrar evento
    PickingEvent::create([
        'picking_id' => $picking->id,
        'event_type' => 'COMPLETED',
        'created_by' => auth()->id()
    ]);

    // 4. Encolar Job para sincronizar con Flexxus
    SyncPickingJob::dispatch($picking);

    return response()->json([
        'success' => true,
        'message' => 'Picking completado. Sincronizando con Flexxus...'
    ]);
}
```

---

## 7. CREAR REMITO EN FLEXXUS 🔄

**CUÁNDO:** Background Job (apenas se completa el armado)
**QUIÉN:** Backend Laravel automáticamente

### PASO 7.1: Crear remito en Flexxus

```http
POST /sales
Content-Type: application/json

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
    },
    {
      "product": "ART-002",
      "quantity": 5,
      "price": 2500.00,
      "linked_voucher_type": "NP",
      "linked_voucher_number": 623136,
      "linked_line": 2
    }
  ]
}
```

### Response

```json
{
  "error": false,
  "message": "success",
  "orderType": "RE",
  "order_Id": 67890,
  "linequantity": 2
}
```

### PASO 7.2: Verificar vinculación

```http
GET /orderrelated/NP/623136
```

### Response

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

### Implementación Completa

```php
// app/Jobs/SyncPickingJob.php

public function handle()
{
    $picking = $this->picking;

    try {
        // 1. Preparar detalles del remito
        $saleDetails = [];
        foreach ($picking->items as $item) {
            $saleDetails[] = [
                'product' => $item->product_code,
                'quantity' => $item->qty_picked,
                'price' => $this->getProductPrice($item->product_code),
                'linked_voucher_type' => 'NP',
                'linked_voucher_number' => $picking->order_number,
                'linked_line' => $item->line_number
            ];
        }

        // 2. Crear remito en Flexxus
        $response = $this->flexxusClient->createSale([
            'branch' => 1,
            'warehouse' => $picking->warehouse->code,
            'customer' => $this->getCustomerCode($picking),
            'date' => now()->format('Y-m-d'),
            'type' => 12, // RE (Remito) - CONFIRMAR CON FUNCIONAL
            'sale_details' => $saleDetails
        ]);

        // 3. Verificar vinculación
        $related = $this->flexxusClient->getRelatedVouchers(
            'NP',
            $picking->order_number
        );

        $hasRemito = collect($related['data'])->contains(function($item) use ($response) {
            return $item['TIPOCOMPROBANTE'] === 'RE' &&
                   $item['NUMEROCOMPROBANTE'] == $response['order_Id'];
        });

        if (!$hasRemito) {
            throw new \Exception('Remito no vinculado correctamente');
        }

        // 4. Actualizar estado local
        $picking->update([
            'status' => 'SINCRONIZADO_ERP',
            'erp_voucher_type' => 'RE',
            'erp_voucher_number' => $response['order_Id'],
            'synced_at' => now()
        ]);

        // 5. Registrar evento
        PickingEvent::create([
            'picking_id' => $picking->id,
            'event_type' => 'SYNCED',
            'payload' => [
                'remito_number' => $response['order_Id'],
                'synced_at' => now()->toIso8601String()
            ]
        ]);

        Log::info("Picking {$picking->id} synced successfully");

    } catch (\Exception $e) {
        // Error: Registrar y marcar para reintento
        $picking->update([
            'status' => 'ERROR_SYNC',
            'error_message' => $e->getMessage()
        ]);

        PickingEvent::create([
            'picking_id' => $picking->id,
            'event_type' => 'ERROR',
            'payload' => [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]
        ]);

        Log::error("Failed to sync picking {$picking->id}: {$e->getMessage()}");

        // Reintentar en 5 minutos
        SyncPickingJob::dispatch($picking)->delay(now()->addMinutes(5));
    }
}
```

---

## 8. OBTENER UBICACIONES DE PRODUCTOS 📍

**CUÁNDO:** Operario necesita saber dónde está un producto
**QUIÉN:** Backend Laravel (caché cada 10 min)

### Endpoint

```http
GET /stock?warehouse_list=001&web_published_only=1
```

### Response

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
    },
    {
      "CODIGOARTICULO": "ART-002",
      "DESCRIPCION": "Arena 1m³",
      "CODIGODEPOSITO": "001",
      "STOCK": 50,
      "STOCKDISPONIBLE": 45,
      "UBICACION": "B-03-12"
    }
  ]
}
```

### Parser de Ubicación

```php
// app/Services/LocationService.php

public function parseLocation(string $location): array
{
    // Formato: "A-01-15" → [Sector A, Pasillo 01, Estante 15]
    $parts = explode('-', $location);

    return [
        'raw' => $location,
        'sector' => $parts[0] ?? 'N/A',
        'aisle' => $parts[1] ?? 'N/A',
        'shelf' => $parts[2] ?? 'N/A',
        'formatted' => sprintf(
            'Sector %s / Pasillo %s / Estante %s',
            $parts[0] ?? 'N/A',
            $parts[1] ?? 'N/A',
            $parts[2] ?? 'N/A'
        )
    ];
}

public function getProductLocation(string $productCode, string $warehouseCode): ?string
{
    // Cache de stock por 10 minutos
    $stock = Cache::remember("stock:{$warehouseCode}", 600, function () use ($warehouseCode) {
        return $this->flexxusClient->getStock([
            'warehouse_list' => $warehouseCode
        ]);
    });

    $product = collect($stock['data'])->firstWhere('CODIGOARTICULO', $productCode);

    return $product['UBICACION'] ?? null;
}
```

### Endpoint para Móvil

```php
Route::get('/mobile/products/{code}/location', [ProductController::class, 'location']);

public function location($code, Request $request)
{
    $warehouseCode = $request->user()->warehouse->code;

    $location = $this->locationService->getProductLocation($code, $warehouseCode);

    if (!$location) {
        return response()->json([
            'success' => false,
            'message' => 'Ubicación no encontrada'
        ], 404);
    }

    $parsed = $this->locationService->parseLocation($location);

    return response()->json([
        'success' => true,
        'data' => $parsed
    ]);
}
```

---

## RESUMEN DE ENDPOINTS

| # | Endpoint | Método | Cuándo | Frecuencia |
|---|----------|--------|--------|-----------|
| 1 | `/auth/login` | POST | Login backend | Cada 1h |
| 2 | `/warehouses` | GET | Sync depósitos | Cada 1h |
| 3 | `/orders` | GET | Lista NP | On-demand |
| 4 | `/v2/deliverydata/NP/{id}` | GET | Verificar EXPEDICION | On-demand |
| 5 | `/orders/NP/{id}` | GET | Detalle pedido | On-demand |
| 6 | `/stock` | GET | Ubicaciones | Cada 10min |
| 7 | `/sales` | POST | Crear remito | Al completar |
| 8 | `/orderrelated/NP/{id}` | GET | Verificar vinculación | Al completar |

---

## ORDEN CRONOLÓGICO

```
┌─────────────────────────────────────────────────────────────┐
│ 1. OPERARIO ABRE APP                                      │
│    → POST /auth/login (solo backend, cada 1h)             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. APP MUESTRA PEDIDOS                                    │
│    → GET /orders?warehouse_id=001                         │
│    → GET /v2/deliverydata/NP/{nro} (para cada NP)         │
│    → Filtrar solo CODIGOTIPOENTREGA=1 (EXPEDICION)        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. OPERARIO SELECCIONA NP-623136                          │
│    → GET /orders/NP/623136                                │
│    → Crear registro local en tabla pickings               │
│    → Crear líneas en tabla picking_items                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. APP MUESTRA PRODUCTOS CON UBICACIONES                  │
│    → GET /stock?warehouse_list=001 (cache 10min)            │
│    → Parsear UBICACION "A-01-15" → "Sector A/Pasillo 01"   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. OPERARIO MARCA PRODUCTOS COMO PREPARADOS               │
│    → Actualizar tabla picking_items (DB local)            │
│    → NO llama Flexxus                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. OPERARIO COMPLETA ARMADO                              │
│    → Validar que todas las líneas estén completas         │
│    → Actualizar picking.status = ARMADO_LOCAL             │
│    → Encolar Job: SyncPickingJob                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. JOB SINCRONIZA CON FLEXXUS (Background)               │
│    → POST /sales (crea remito RE-67890)                  │
│    → GET /orderrelated/NP/623136 (verificar vinculación)  │
│    → Actualizar picking.status = SINCRONIZADO_ERP          │
│    → Registrar evento SYNCED en picking_events             │
└─────────────────────────────────────────────────────────────┘
```

---

## TIPS IMPORTANTES

### Cache de Tokens

```php
// Siempre usar token cacheado
$token = Cache::get('flexxus_token');

$response = Http::withToken($token)
    ->timeout(30)
    ->get($this->baseUrl . $endpoint);

// Si devuelve 401, re-autenticar
if ($response->status() === 401) {
    $this->flexxusClient->authenticate();
    $token = Cache::get('flexxus_token');
    // Reintentar request
}
```

### Manejo de Errores

```php
try {
    $response = $this->flexxusClient->getOrders();
} catch (ConnectionException $e) {
    // Usar caché local si existe
    $orders = Cache::get("orders:{$warehouseCode}");
    
    if (!$orders) {
        throw new ServiceUnavailableException();
    }
}
```

### Validaciones

```php
// Antes de tomar pedido
if ($picking->isTaken()) {
    throw new PickingAlreadyTakenException();
}

if (!$this->hasStock($picking)) {
    throw new InsufficientStockException();
}

// Antes de completar
if ($picking->hasIncompleteItems()) {
    throw new PickingIncompleteException();
}
```

---

## CHECKLIST DE IMPLEMENTACIÓN

- [ ] FlexxusClient con auth y retry
- [ ] Cache de tokens (1 hora)
- [ ] SyncWarehousesJob programado
- [ ] OrderService::getExpeditionOrders()
- [ ] PickingService::startPicking()
- [ ] PickingService::completePicking()
- [ ] SyncPickingJob con validación
- [ ] LocationService con parser
- [ ] Endpoints para móvil
- [ ] Manejo de errores y reintentos
- [ ] Logging de todos los eventos

---

**Última actualización:** 2026-03-02
**Versión:** 1.0
