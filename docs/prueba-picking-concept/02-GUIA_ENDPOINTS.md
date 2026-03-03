# 🔍 Guía de Endpoints de Flexxus

## 📋 Tabla de Contenidos

1. [Autenticación](#1-autenticación)
2. [Pedidos](#2-pedidos)
3. [Datos de Entrega](#3-datos-de-entrega)
4. [Stock y Ubicaciones](#4-stock-y-ubicaciones)
5. [Depósitos](#5-depósitos)

---

## 1. Autenticación

### POST /v2/auth/login

**Propósito:** Obtener token de acceso JWT

**Request:**
```http
POST /v2/auth/login
Content-Type: application/json

{
  "username": "CARLOSR",
  "password": "W250",
  "deviceinfo": "{\"model\":\"0\",\"platform\":\"0\",\"uuid\":\"4953457348957348957348975\",\"version\":\"0\",\"manufacturer\":\"0\"}"
}
```

⚠️ **IMPORTANTE:** `deviceinfo` debe ser un **string JSON**, no un objeto.

**Response (200 OK):**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJDQVJ...",
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expireIn": 3600,
  "refreshExpireIn": 86400,
  "user": {
    "username": "CARLOSR",
    "warehouse_id": "002",
    "warehouse_name": "RONDEAU"
  }
}
```

**Errores Comunes:**
- `401 Unauthorized` - Credenciales incorrectas
- `"Sin licencias disponibles"` - Todas las licencias en uso

---

## 2. Pedidos

### GET /v2/orders

**Propósito:** Obtener lista de pedidos con filtros opcionales

**Parámetros:**
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `date_from` | string | Fecha desde (YYYY-MM-DD) | `2026-03-02` |
| `date_to` | string | Fecha hasta (YYYY-MM-DD) | `2026-03-02` |
| `search` | string | Buscar por razón social | `GILI PRESUPUESTO` |
| `warehouse_id` | string | ❌ NO FUNCIONA (bug Flexxus) | `002` |
| `delivered` | number | Filtrar por entregado | `0` o `1` |
| `limit` | integer | Limite de visualización | `100` |
| `offset` | integer | Paginación | `0` |
| `withoutstarting` | integer | Sin empezar (0 o 1) | `0` |

**Request:**
```http
GET /v2/orders?date_from=2026-03-02&date_to=2026-03-02
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": [
    {
      "FECHACOMPROBANTE": "2026-03-02T00:00:00.000Z",
      "TIPOCOMPROBANTE": "NP",
      "NUMEROCOMPROBANTE": 623136,
      "RAZONSOCIAL": "GILI PRESUPUESTO",
      "TOTAL": 15624.49,
      "NOMBREUSUARIO": "API",
      "DEPOSITO": "RONDEAU",
      "ENTREGAR": 0,
      "ORIGEN": "principal"
    }
  ]
}
```

**Campos Importantes:**
- `DEPOSITO` - Nombre del depósito (ej: "RONDEAU", "DON BOSCO")
- `ENTREGAR` - Estado: `0` = Pendiente, `1` = Entregado
- `NUMEROCOMPROBANTE` - Número de pedido

---

### GET /v2/orders/NP/{numero}

**Propósito:** Obtener detalle completo de un pedido

**Request:**
```http
GET /v2/orders/NP/623136
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": {
    "TIPOCOMPROBANTE": "NP",
    "NUMEROCOMPROBANTE": 623136,
    "FECHACOMPROBANTE": "2026-03-02T00:00:00.000Z",
    "FECHAENTREGA": "2026-03-02T00:00:00.000Z",
    "CODIGOPARTICULAR": ".",
    "RAZONSOCIAL": "GILI PRESUPUESTO",
    "TELEFONO": "4553556",
    "DIRECCION": "-",
    "OPERACION": "VENTAS VARIAS",
    "CONDICIONIVA": "CONSUMIDOR FINAL",
    "CONDICIONVENTA": "CONTADO",
    "VENDEDOR": "API",
    "TOTAL": 15624.49,
    "ANULADA": 0,
    "DETALLE": [
      {
        "LINEA": 1,
        "CODIGOPARTICULAR": "08918",
        "DESCRIPCION": "PPN-CODO A 45* DE  40 MH",
        "CANTIDAD": 3,
        "CANTIDADREMITIDA": 0,
        "PENDIENTE": 3,
        "CANTIDADPREPARADA": null,
        "DESCUENTO": 0,
        "PRECIOUNITARIO": 455.531927940223,
        "PRECIOTOTAL": 1366.60,
        "GARANTIA": 0,
        "LOTE": "SINLOTE",
        "PORCENTAJEIVA": 21
      }
    ]
  }
}
```

---

## 3. Datos de Entrega

### GET /v2/deliverydata/NP/{numero}

**Propósito:** Obtener tipo de entrega y datos de envío

**Request:**
```http
GET /v2/deliverydata/NP/623136
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": [
    {
      "TIPOCOMPROBANTE": "NP",
      "NUMEROCOMPROBANTE": 623136,
      "CODIGOTIPOENTREGA": 1,
      "DIRECCION": "-",
      "BARRIO": "ALTOS DEL PINAR",
      "LOCALIDAD": "BAHIA BLANCA",
      "CODIGOZONA": 5,
      "TELEFONO1CONTACTO": "4553556",
      "TELEFONO2CONTACTO": "",
      "FECHAPACTADA": "2026-03-02T14:24:00.000Z",
      "HORAPACTADA": "1900-01-01T00:00:00.000Z",
      "RESPONSABLERECEPCION": "GILI PRESUPUESTO",
      "OBSERVACIONES": "",
      "CODIGOBARRIO": 150,
      "CODIGOLOCALIDAD": "061,
      "DISTANCIA": 0
    }
  ]
}
```

**Tipos de Entrega:**
- `CODIGOTIPOENTREGA = 1` → **EXPEDICION** (retiro en sucursal)
- `CODIGOTIPOENTREGA = 2` → **REPARTO** (delivery a domicilio)
- `CODIGOTIPOENTREGA = 3` → **ESPERA AVISO**

---

## 4. Stock y Ubicaciones

### GET /v2/stock

**Propósito:** Obtener stock de productos

**Parámetros:**
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `update_from` | string | Fecha desde | `2026-03-01` |
| `warehouse_list` | string | Códigos de depósitos (separados por coma) | `001,002,004` |
| `web_published_only` | integer | Solo publicados web | `1` |
| `warehouse_visible` | integer | Depósito visible | `1` |

**Request:**
```http
GET /v2/stock?warehouse_list=002
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": [
    {
      "ID_ARTICULO": "00001",
      "CODIGO_PRODUCTO": "08918",
      "TALLE": "",
      "NPRESERVADA": 0,
      "STOCKREAL": 150,
      "STOCKREMANENTE": 150,
      "STOCKFACTSINREMITIR": 0,
      "PENDIENTESRECEPCION": 0,
      "ORIGEN": "principal"
    }
  ]
}
```

⚠️ **IMPORTANTE:** Este endpoint NO incluye información de ubicación física.

---

## 5. Depósitos

### GET /v2/warehouses

**Propósito:** Obtener lista de depósitos

**Request:**
```http
GET /v2/warehouses
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": [
    {
      "CODIGODEPOSITO": "001",
      "DESCRIPCION": "DON BOSCO",
      "UBICACION": "-",
      "CODIGOCLIENTE": "50404",
      "CLIENTE": "DEPOSITO DON BOSCO",
      "SUCURSAL": "AUTOGILI DON BOSCO"
    },
    {
      "CODIGODEPOSITO": "002",
      "DESCRIPCION": "RONDEAU",
      "UBICACION": "",
      "CODIGOCLIENTE": "50406",
      "CLIENTE": "DEPOSITO RONDEAU",
      "SUCURSAL": "RONDEAU"
    }
  ]
}
```

---

## 📊 Ejemplos de Uso

### Ejemplo 1: Obtener Pedidos de Hoy de un Depósito

```php
$today = now()->toDateString();
$warehouseName = 'RONDEAU';

// 1. Obtener todos los pedidos del día
$orders = $flexxus->request('GET', '/v2/orders', [
    'date_from' => $today,
    'date_to' => $today
]);

// 2. Filtrar por depósito
$filtered = array_filter($orders['data'], function($order) use ($warehouseName) {
    return $order['DEPOSITO'] === $warehouseName 
        && $order['ENTREGAR'] == 0;
});
```

### Ejemplo 2: Verificar si es Expedición

```php
$orderNumber = 623136;

// Obtener datos de entrega
$deliveryData = $flexxus->request('GET', "/v2/deliverydata/NP/{$orderNumber}");

// Verificar tipo (IMPORTANTE: índice [0])
$tipoEntrega = $deliveryData['data'][0]['CODIGOTIPOENTREGA'];

if ($tipoEntrega == 1) {
    // Es EXPEDICION (retiro)
} else if ($tipoEntrega == 2) {
    // Es REPARTO (delivery)
}
```

### Ejemplo 3: Obtener Items de un Pedido

```php
$orderNumber = 623136;

// Obtener detalle completo
$orderDetail = $flexxus->request('GET', "/v2/orders/NP/{$orderNumber}");

// Iterar items
foreach ($orderDetail['data']['DETALLE'] as $item) {
    echo "{$item['DESCRIPCION']} - Cantidad: {$item['CANTIDAD']}\n";
}
```

---

## ⚠️ Limitaciones Conocidas

### 1. Filtrado por warehouse_id
```php
// ❌ NO FUNCIONA (bug de Flexxus)
GET /v2/orders?warehouse_id=002

// ✅ SOLUCIÓN: Filtrar en backend
$orders = $flexxus->request('GET', '/v2/orders');
$filtered = array_filter($orders['data'], fn($o) => $o['DEPOSITO'] === 'RONDEAU');
```

### 2. Estructura de Respuesta Inconsistente
```php
// deliverydata devuelve array[0]
$tipoEntrega = $deliveryData['data'][0]['CODIGOTIPOENTREGA'];

// orders devuelve directo
$items = $orderDetail['data']['DETALLE'];
```

### 3. Sin Ubicaciones en Stock
El endpoint `/v2/stock` NO incluye información de ubicación física de los productos.

---

## 🔐 Headers Requeridos

Todas las requests (excepto login) requieren:

```http
Authorization: Bearer {token}
Content-Type: application/json
```

---

## 📚 Referencias

- [Documentación Swagger](../swagger-ui-init.js)
- [FlexxusClient.php](../../flexxus-picking-backend/app/Http/Clients/Flexxus/FlexxusClient.php)
- [Prueba de Picking](./01-METODOLOGIA_Y_RESULTADOS.md)
