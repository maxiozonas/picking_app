# 📍 Información de Ubicaciones en Flexxus

## 🔍 Investigación Realizada

### Endpoints Consultados

1. **GET /v2/stock** - ❌ Timeout (demasiados datos)
2. **GET /v2/products/{id}/stock** - ❌ Array vacío
3. **GET /v2/orders/NP/{id}** - ✅ Tiene info limitada

### Campos Disponibles

#### En Items del Pedido (DETALLE)
```json
{
  "CODIGOPARTICULAR": "08918",
  "DESCRIPCION": "PPN-CODO A 45* DE  40 MH",
  "LOTE": "SINLOTE",
  "CANTIDAD": 3,
  "PENDIENTE": 3
}
```

**Campos disponibles:**
- ✅ `LOTE` - Lote del producto (ej: "SINLOTE")
- ❌ Sin ubicación física (pasillo, estantería, posición)

#### En Cabecera del Pedido
```json
{
  "NUMEROCOMPROBANTE": 623136,
  "DEPOSITO": "RONDEAU",
  "RAZONSOCIAL": "GILI PRESUPUESTO"
}
```

**Campos disponibles:**
- ✅ `DEPOSITO` - Nombre del depósito (ej: "RONDEAU")

#### En Lista de Depósitos
```json
{
  "CODIGODEPOSITO": "002",
  "DESCRIPCION": "RONDEAU",
  "UBICACION": "",
  "SUCURSAL": "RONDEAU"
}
```

**Campos disponibles:**
- ✅ `CODIGODEPOSITO` - Código del depósito
- ✅ `DESCRIPCION` - Nombre del depósito
- ✅ `UBICACION` - Dirección física del depósito (cuando existe)
- ✅ `SUCURSAL` - Sucursal a la que pertenece

---

## 💡 Conclusión

### ❌ Flexxus NO Proporciona Ubicaciones Granulares

El sistema Flexxus **NO incluye un sistema de ubicaciones detallado** con:
- Pasillo
- Estantería  
- Posición
- Subdepósito

Lo único que proporciona es:
- **Depósito** (nivel más alto: RONDEAU, DON BOSCO, etc.)
- **Lote** (del producto)
- **Ubicación del depósito** (dirección física, cuando existe)

---

## ✅ Solución Propuesta

### Opción 1: Mostrar Información Disponible (RECOMENDADO)

Dado que Flexxus no provee ubicaciones detalladas, mostrar la información que SÍ tenemos:

```php
foreach ($order['items'] as $item) {
    echo "Producto: {$item['DESCRIPCION']}\n";
    echo "  📦 Depósito: {$order['DEPOSITO']}\n";
    echo "  🏷️ Lote: {$item['LOTE']}\n";
    echo "  📊 Cantidad: {$item['CANTIDAD']}\n";
}
```

**Resultado:**
```
Producto: PPN-CODO A 45* DE 40 MH
  📦 Depósito: RONDEAU
  🏷️ Lote: SINLOTE
  📊 Cantidad: 3
```

### Opción 2: Sistema Propio de Ubicaciones

Si realmente necesitas ubicaciones detalladas, crear un sistema propio:

#### Base de Datos
```sql
CREATE TABLE product_locations (
    id BIGINT PRIMARY KEY,
    product_code VARCHAR(20) NOT NULL,
    warehouse_id VARCHAR(10) NOT NULL,
    aisle VARCHAR(10),           -- Pasillo
    shelf VARCHAR(10),           -- Estantería
    position VARCHAR(10),         -- Posición
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX(product_code),
    INDEX(warehouse_id)
);
```

#### Flujo de Trabajo
1. **Carga inicial:** Importar productos y asignar ubicaciones manualmente
2. **Mantenimiento:** Actualizar cuando cambien ubicaciones
3. **Consulta:** Join con pedidos para mostrar ubicación

**Ejemplo:**
```php
$location = DB::table('product_locations')
    ->where('product_code', $item['CODIGOPARTICULAR'])
    ->where('warehouse_id', $warehouseId)
    ->first();

if ($location) {
    echo "  📍 Pasillo: {$location->aisle}\n";
    echo "  📁 Estantería: {$location->shelf}\n";
    echo "  🔢 Posición: {$location->position}\n";
}
```

### Opción 3: Integración con Sistema de WMS

Si tienen un sistema de WMS (Warehouse Management System):
1. Integrar con ese sistema
2. Consultar ubicaciones en tiempo real
3. Mantener sincronización

---

## 🎯 Recomendación Final

**Para el MVP (Mínimo Producto Viable):**

Usar **Opción 1** - Mostrar información disponible de Flexxus:

```php
[
    'order' => [
        'number' => 'NP 623136',
        'warehouse' => 'RONDEAU',
        'warehouse_code' => '002'
    ],
    'items' => [
        [
            'code' => '08918',
            'description' => 'PPN-CODO A 45* DE 40 MH',
            'quantity' => 3,
            'lot' => 'SINLOTE',
            'warehouse' => 'RONDEAU',           // ← INFO DISPONIBLE
            'warehouse_address' => ''            // ← INFO DISPONIBLE
        ]
    ]
]
```

**Para Futuro:**

Evaluar si realmente necesitan ubicaciones granulares:
- Si SÍ → Implementar Opción 2 (sistema propio)
- Si NO → Mantener Opción 1 (suficiente para operación)

---

## 📊 Ejemplo de Implementación

### Con Información Disponible de Flexxus

```php
public function enrichWithLocationInfo(array $pickingList, array $warehouses): array
{
    // Crear mapa de depósitos
    $warehouseMap = [];
    foreach ($warehouses as $wh) {
        $warehouseMap[$wh['DESCRIPCION']] = $wh;
    }

    // Enriquecer cada item
    foreach ($pickingList as &$order) {
        $warehouseInfo = $warehouseMap[$order['warehouse']] ?? null;
        
        foreach ($order['items'] as &$item) {
            $item['location'] = [
                'warehouse' => [
                    'code' => $warehouseInfo['CODIGODEPOSITO'] ?? null,
                    'name' => $warehouseInfo['DESCRIPCION'] ?? null,
                    'address' => $warehouseInfo['UBICACION'] ?? 'No especificada',
                    'branch' => $warehouseInfo['SUCURSAL'] ?? null
                ],
                'lot' => $item['LOTE'] ?? 'Sin lote',
                'notes' => 'Ubicación específica no disponible en Flexxus'
            ];
        }
    }

    return $pickingList;
}
```

**Resultado JSON:**
```json
{
  "order_number": "NP 623136",
  "items": [
    {
      "code": "08918",
      "description": "PPN-CODO A 45* DE 40 MH",
      "quantity": 3,
      "location": {
        "warehouse": {
          "code": "002",
          "name": "RONDEAU",
          "address": "",
          "branch": "RONDEAU"
        },
        "lot": "SINLOTE",
        "notes": "Ubicación específica no disponible en Flexxus"
      }
    }
  ]
}
```

---

## 🚀 Implementación en el Script de Prueba

Voy a actualizar el script para mostrar esta información:

```php
// PASO 6: Enriquecer con información de depósitos
$warehousesResponse = $flexxus->request('GET', '/v2/warehouses');
$warehouses = $warehousesResponse['data'] ?? [];

foreach ($pickingList as &$order) {
    // Buscar info del depósito
    $warehouseInfo = null;
    foreach ($warehouses as $wh) {
        if ($wh['DESCRIPCION'] === $order['warehouse']) {
            $warehouseInfo = $wh;
            break;
        }
    }

    foreach ($order['items'] as &$item) {
        $item['warehouse_info'] = $warehouseInfo;
    }
}
```

---

## 📋 Checklist

- [x] Investigar endpoints de Flexxus
- [x] Verificar schema de stock
- [x] Probar endpoint de productos
- [x] Confirmar: NO hay ubicaciones granulares
- [ ] Actualizar script de prueba con info disponible
- [ ] Documentar para los operarios
- [ ] Evaluar necesidad de sistema propio de ubicaciones
