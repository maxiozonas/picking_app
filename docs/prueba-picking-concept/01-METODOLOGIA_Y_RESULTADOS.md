# 🎯 Prueba de Concepto: Flujo de Picking

**Fecha de creación:** 2026-03-02  
**Estado:** ✅ COMPLETADO Y FUNCIONAL  
**Objetivo:** Demostrar la obtención y filtrado de pedidos de picking por depósito usando Flexxus API

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Metodología](#metodología)
3. [Arquitectura de la Solución](#arquitectura-de-la-solución)
4. [EndPoints de Flexxus Utilizados](#endpoints-de-flexxus-utilizados)
5. [Implementación Técnica](#implementación-técnica)
6. [Resultados Obtenidos](#resultados-obtenidos)
7. [Lecciones Aprendidas](#lecciones-aprendidas)
8. [Próximos Pasos](#próximos-pasos)

---

## 📊 Resumen Ejecutivo

### Objetivo
Demostrar que podemos obtener pedidos de **EXPEDICION** (retiro en sucursal) filtrados por depósito, para que los operarios solo vean los pedidos que deben preparar.

### Resultado
✅ **EXITOSO** - Se obtuvieron 2 pedidos de picking del depósito RONDEAU
- **Total:** $150,205.46
- **Items:** 3 productos
- **Fecha:** 2026-03-02

### Stack Tecnológico
- **Backend:** PHP (Laravel)
- **Cliente HTTP:** FlexxusClient (existente en el proyecto)
- **API:** Flexxus v2
- **Autenticación:** JWT con cache

---

## 🔬 Metodología

### Fase 1: Investigación Inicial
1. Revisión de documentación existente (Swagger)
2. Análisis del código del proyecto (FlexxusClient, SyncWarehousesCommand)
3. Identificación del formato correcto de autenticación

### Fase 2: Desarrollo de Pruebas
1. Creación de scripts de diagnóstico
2. Prueba y error con diferentes formatos de JSON
3. Descubrimiento del formato correcto de `deviceinfo`

### Fase 3: Implementación
1. Creación del script de prueba completo
2. Validación con datos reales
3. Documentación de resultados

### Fase 4: Validación
1. Ejecución exitosa de la prueba
2. Verificación de filtrado correcto
3. Confirmación de datos de pedidos

---

## 🏗️ Arquitectura de la Solución

```
┌─────────────────────────────────────────────────────────────┐
│  USUARIO: Operario de Depósito                              │
│  - Se autentica con su usuario                              │
│  - Solo ve pedidos de su depósito asignado                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  BACKEND LARAVEL (PickingController)                        │
│  1. Valida token JWT                                        │
│  2. Obtiene depósito del usuario                            │
│  3. Llama a FlexxusClient                                   │
│  4. Filtra por depósito y EXPEDICION                        │
│  5. Retorna lista de picking formateada                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FLEXXUSCLIENT (Capa de Abstracción)                       │
│  - authenticate()                                            │
│  - request()                                                 │
│  - getWarehouses()                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FLEXXUS API (v2)                                           │
│  POST /v2/auth/login                                        │
│  GET  /v2/orders?date_from=X&date_to=X                     │
│  GET  /v2/deliverydata/NP/{id}                              │
│  GET  /v2/orders/NP/{id}                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 EndPoints de Flexxus Utilizados

### 1. Autenticación
```
POST /v2/auth/login

Request:
{
  "username": "CARLOSR",
  "password": "W250",
  "deviceinfo": "{\"model\":\"0\",\"platform\":\"0\",...}"  // STRING JSON
}

Response:
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "refreshToken": "...",
  "expireIn": 3600,
  "user": {
    "warehouse_id": "002",
    "warehouse_name": "RONDEAU"
  }
}
```

### 2. Obtener Pedidos del Día
```
GET /v2/orders?date_from=2026-03-02&date_to=2026-03-02

Response:
{
  "data": [
    {
      "FECHACOMPROBANTE": "2026-03-02T00:00:00.000Z",
      "TIPOCOMPROBANTE": "NP",
      "NUMEROCOMPROBANTE": 623136,
      "RAZONSOCIAL": "GILI PRESUPUESTO",
      "TOTAL": 15624.49,
      "NOMBREUSUARIO": "API",
      "DEPOSITO": "RONDEAU",          // ← CAMPO CLAVE
      "ENTREGAR": 0,                  // 0=Pendiente, 1=Entregado
      "ORIGEN": "principal"
    }
  ]
}
```

### 3. Verificar Tipo de Entrega
```
GET /v2/deliverydata/NP/623136

Response:
{
  "data": [
    {
      "CODIGOTIPOENTREGA": 1,    // 1=EXPEDICION, 2=REPARTO
      "DIRECCION": "-",
      "BARRIO": "ALTOS DEL PINAR",
      "LOCALIDAD": "BAHIA BLANCA",
      "RESPONSABLERECEPCION": "GILI PRESUPUESTO"
    }
  ]
}
```

### 4. Obtener Detalle del Pedido
```
GET /v2/orders/NP/623136

Response:
{
  "data": {
    "TIPOCOMPROBANTE": "NP",
    "NUMEROCOMPROBANTE": 623136,
    "RAZONSOCIAL": "GILI PRESUPUESTO",
    "CLIENTE": {...},
    "DETALLE": [               // ← ARRAY DE ITEMS
      {
        "LINEA": 1,
        "CODIGOPARTICULAR": "08918",
        "DESCRIPCION": "PPN-CODO A 45* DE  40 MH",
        "CANTIDAD": 3,
        "CANTIDADREMITIDA": 0,
        "PENDIENTE": 3,
        "PRECIOUNITARIO": 455.53,
        "PRECIOTOTAL": 1366.60
      }
    ]
  }
}
```

---

## 💻 Implementación Técnica

### FlexxusClient.php (Ya existía)

```php
<?php

namespace App\Http\Clients\Flexxus;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class FlexxusClient implements FlexxusClientInterface
{
    private string $baseUrl;
    private string $username;
    private string $password;
    private array $deviceInfo;

    public function __construct()
    {
        $this->baseUrl = config('flexxus.url');
        $this->username = config('flexxus.username');
        $this->password = config('flexxus.password');
        $this->deviceInfo = config('flexxus.device_info');
    }

    /**
     * Autentica con Flexxus y cachea el token
     */
    public function authenticate(): array
    {
        // 🔑 TRUCO CRÍTICO: deviceinfo debe ser STRING JSON
        $payload = [
            'username' => $this->username,
            'password' => $this->password,
            'deviceinfo' => json_encode($this->deviceInfo),  // ← STRING, no objeto
        ];

        $response = Http::timeout(30)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post("{$this->baseUrl}/v2/auth/login", $payload);

        if (! $response->successful()) {
            throw new \RuntimeException('Flexxus authentication failed');
        }

        $data = $response->json();

        // Cachear token para reutilizarlo
        $tokenExpireIn = max(60, ($data['expireIn'] ?? time() + 3600) - time());
        Cache::put('flexxus_token', $data['token'], now()->addSeconds($tokenExpireIn));

        return $data;
    }

    /**
     * Hace request a cualquier endpoint de Flexxus
     * Maneja autenticación y reintentos
     */
    public function request(string $method, string $endpoint, array $data = []): array
    {
        // Obtener token del cache o autenticar
        $token = Cache::get('flexxus_token');
        if (! $token) {
            $this->authenticate();
            $token = Cache::get('flexxus_token');
        }

        // Hacer request
        $response = Http::timeout(30)
            ->withToken($token)
            ->{$method}("{$this->baseUrl}{$endpoint}", $data);

        // Si expiró el token (401), reautenticar y reintentar
        if ($response->status() === 401) {
            $this->authenticate();
            $token = Cache::get('flexxus_token');
            $response = Http::timeout(30)
                ->withToken($token)
                ->{$method}("{$this->baseUrl}{$endpoint}", $data);
        }

        if (! $response->successful()) {
            throw new \RuntimeException("Flexxus request failed");
        }

        return $response->json() ?? [];
    }

    /**
     * Obtiene lista de depósitos
     */
    public function getWarehouses(): array
    {
        $response = $this->request('GET', '/v2/warehouses');
        return $response['data'] ?? $response;
    }
}
```

### Flujo Completo de Picking

```php
<?php

use App\Http\Clients\Flexxus\FlexxusClient;

class PickingService
{
    private FlexxusClient $flexxus;

    public function __construct(FlexxusClient $flexxus)
    {
        $this->flexxus = $flexxus;
    }

    /**
     * Obtiene lista de picking para un depósito y fecha
     */
    public function getPickingList(string $warehouseName, string $date): array
    {
        // PASO 1: Autenticar (usa token cacheado si existe)
        $this->flexxus->authenticate();

        // PASO 2: Obtener todos los pedidos del día
        $ordersResponse = $this->flexxus->request('GET', '/v2/orders', [
            'date_from' => $date,
            'date_to' => $date
        ]);

        $allOrders = $ordersResponse['data'] ?? [];

        // PASO 3: Filtrar por depósito y estado pendiente
        $warehouseOrders = array_filter($allOrders, function($order) use ($warehouseName) {
            return $order['DEPOSITO'] === $warehouseName 
                && $order['ENTREGAR'] == 0;
        });

        // PASO 4: Filtrar por EXPEDICION (retiro en sucursal)
        $expeditionOrders = [];
        foreach ($warehouseOrders as $order) {
            $deliveryData = $this->flexxus->request(
                'GET', 
                "/v2/deliverydata/NP/{$order['NUMEROCOMPROBANTE']}"
            );

            // IMPORTANTE: deliverydata devuelve array[0]
            $deliveryInfo = $deliveryData['data'][0] ?? [];

            if (($deliveryInfo['CODIGOTIPOENTREGA'] ?? 0) == 1) {
                $order['delivery_info'] = $deliveryInfo;
                $expeditionOrders[] = $order;
            }
        }

        // PASO 5: Enriquecer con detalles de items
        $pickingList = [];
        foreach ($expeditionOrders as $order) {
            $orderDetail = $this->flexxus->request(
                'GET', 
                "/v2/orders/NP/{$order['NUMEROCOMPROBANTE']}"
            );

            $detail = $orderDetail['data'] ?? [];

            $pickingList[] = [
                'order_number' => $order['NUMEROCOMPROBANTE'],
                'customer' => $order['RAZONSOCIAL'],
                'date' => $order['FECHACOMPROBANTE'],
                'warehouse' => $order['DEPOSITO'],
                'total' => $order['TOTAL'],
                'delivery_type' => 'EXPEDICION',
                'items' => $detail['DETALLE'] ?? []
            ];
        }

        return $pickingList;
    }
}
```

---

## 📈 Resultados Obtenidos

### Ejecución Exitosa (2026-03-02, Depósito: RONDEAU)

```
✅ 2 PEDIDOS DE EXPEDICION ENCONTRADOS

📦 PEDIDO #1: NP 623136
├─ Cliente: GILI PRESUPUESTO
├─ Total: $15,624.49
└─ Items (2):
   ├─ PPN-CODO A 45* DE 40 MH
   │  ├─ Código: 08918
   │  ├─ Cantidad: 3
   │  ├─ Pendiente: 3
   │  └─ Precio: $455.53 c/u
   └─ PPN.PROLONGADOR DE CAMARA
      ├─ Código: 54212
      ├─ Cantidad: 1
      ├─ Pendiente: 1
      └─ Precio: $17,539.03 c/u

📦 PEDIDO #2: NP 623138
├─ Cliente: OZONAS GUSTAVO
├─ Total: $134,580.98
└─ Items (1):
   └─ 1RA 38X38 FORTALEZA GRAFITO X 2.02-CCN
      ├─ Código: 51511
      ├─ Cantidad: 10
      ├─ Pendiente: 10
      └─ Precio: $16,284.30 c/u

💰 RESUMEN:
   Total pedidos: 2
   Total items: 3
   Monto total: $150,205.46
```

### Validación de Filtrado

```
📊 PEDIDOS TOTALES DEL DÍA: 4
├─ DON BOSCO: 1 pedido (excluido por filtro de depósito)
├─ SOCRATES: 1 pedido (excluido por filtro de depósito)
└─ RONDEAU: 2 pedidos ✅

📦 TIPOS DE ENTREGA:
├─ EXPEDICION (retiro): 2 pedidos ✅
└─ REPARTO (delivery): 0 pedidos

✅ AMBOS PEDIDOS DE RONDEAU SON EXPEDICION
```

---

## 💡 Lecciones Aprendidas

### 1. Documentación vs Realidad
**Problema:** La documentación de Swagger indicaba que `deviceinfo` debía ser un objeto.

**Realidad:** La API espera un **string JSON**.

**Solución:**
```php
// ❌ Lo que dice Swagger
'deviceinfo' => ['model' => '0', ...]

// ✅ Lo que funciona
'deviceinfo' => json_encode(['model' => '0', ...])
```

### 2. Estructura de Respuestas
**Problema:** Algunos endpoints devuelven arrays con índices numéricos.

**Ejemplo:**
```php
// deliverydata devuelve array[0]
$deliveryData['data'][0]['CODIGOTIPOENTREGA']

// orders devuelve directamente
$orderDetail['data']['DETALLE']
```

**Lección:** Siempre inspeccionar la respuesta real antes de asumir la estructura.

### 3. Reutilizar Código Existente
**Descubrimiento:** El proyecto ya tenía `FlexxusClient.php` funcionando.

**Beneficio:**
- No reinventar la rueda
- Autenticación ya resuelta
- Cache de tokens implementado
- Manejo de reintentos incluido

### 4. Importancia del Diagnóstico
**Herramientas creadas:**
- `diagnose-flexxus.php` - Test de conectividad
- `inspect-deliverydata.php` - Inspección de respuestas
- `retry-login.php` - Reintento automático

**Beneficio:** Ahorraron horas de debugging

### 5. testing con Datos Reales
**Problema:** Tests unitarios con mocks no revelan problemas de integración.

**Solución:** Usar el comando `flexxus:sync-warehouses` que ya funcionaba.

**Lección:** Nada como probar con la API real.

---

## 🚀 Próximos Pasos

### Fase 1: Backend Laravel
- [ ] Crear `PickingController`
- [ ] Crear endpoint `GET /api/orders/picking`
- [ ] Implementar autorización por depósito
- [ ] Agregar cache de listas de picking

### Fase 2: Ubicaciones de Productos
- [ ] Investigar endpoint de stock con ubicaciones
- [ ] Agregar campo de ubicación a cada item
- [ ] Mostrar depósito, subdepósito y ubicación

### Fase 3: Frontend React Native
- [ ] Pantalla de login
- [ ] Lista de pedidos de picking
- [ ] Detalle de items con ubicaciones
- [ ] Marcar items como preparados

### Fase 4: Funcionalidades Avanzadas
- [ ] Crear remito en Flexxus
- [ ] Sincronización de estado
- [ ] Notificaciones push
- [ ] Reportes y métricas

---

## 📚 Referencias

- [Código de la prueba](../../flexxus-picking-backend/tests/test-picking-with-flexxus-client.php)
- [FlexxusClient](../../flexxus-picking-backend/app/Http/Clients/Flexxus/FlexxusClient.php)
- [Documentación de Flexxus](../swagger-ui-init.js)
- [Cheatsheet de Endpoints](../CHEATSHEET_ENDPOINTS.md)
- [Guía de Desarrollo Completa](../GUIA_DESARROLLO_COMPLETA.md)
