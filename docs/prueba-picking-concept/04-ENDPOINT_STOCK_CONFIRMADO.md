# ✅ Endpoint de Stock Confirmado

## 🔍 Descubrimiento

El usuario confirmó que el endpoint `/v2/products/{codigo}/stock` **SÍ funciona correctamente**.

### Ejemplo que Funciona

```bash
GET /v2/products/04535/stock
```

**Response:**
```json
{
  "error": false,
  "message": "success",
  "Product_Stock": [
    {
      "ESDEPOSITOLOCAL": 1,
      "DEPOSITO": "RONDEAU",
      "LOTE": "SINLOTE",
      "STOCKTOTAL": 4
    }
  ]
}
```

## 📊 Información Proporcionada

Por cada producto, el endpoint devuelve un array con stock por depósito:

```json
{
  "Product_Stock": [
    {
      "ESDEPOSITOLOCAL": 1,      // ¿Es depósito local?
      "DEPOSITO": "RONDEAU",      // Nombre del depósito
      "LOTE": "SINLOTE",         // Lote del producto
      "STOCKTOTAL": 4            // Stock total disponible
    }
  ]
}
```

## 💡 Implementación en el Script de Picking

### Código Actualizado

```php
// Por cada item del pedido
foreach ($order['items'] as $item) {
    $productCode = $item['CODIGOPARTICULAR'];
    
    // Obtener stock del producto
    $stockResponse = $flexxus->request('GET', "/v2/products/{$productCode}/stock");
    $stockArray = $stockResponse['Product_Stock'] ?? [];
    
    // Buscar stock en el depósito del pedido
    $stockInfo = null;
    foreach ($stockArray as $stock) {
        if ($stock['DEPOSITO'] === $order['DEPOSITO']) {
            $stockInfo = $stock;
            break;
        }
    }
    
    // Mostrar información
    if ($stockInfo) {
        echo "Stock disponible: {$stockInfo['STOCKTOTAL']} unidades\n";
        echo "Lote: {$stockInfo['LOTE']}\n";
        echo "Depósito local: " . ($stockInfo['ESDEPOSITOLOCAL'] ? 'Sí' : 'No') . "\n";
        
        // Alerta de stock insuficiente
        if ($item['PENDIENTE'] > $stockInfo['STOCKTOTAL']) {
            echo "⚠️  STOCK INSUFICIENTE\n";
            echo "   Solicitado: {$item['PENDIENTE']}\n";
            echo "   Disponible: {$stockInfo['STOCKTOTAL']}\n";
            echo "   Faltan: " . ($item['PENDIENTE'] - $stockInfo['STOCKTOTAL']) . "\n";
        }
    } else {
        echo "⚠️  Sin stock registrado en este depósito\n";
    }
}
```

## 📋 Estructura de Datos Final

### Con Información de Stock

```json
{
  "order": {
    "number": "NP 623136",
    "warehouse": "RONDEAU",
    "items": [
      {
        "code": "04535",
        "description": "PRODUCTO DE EJEMPLO",
        "quantity": 3,
        "pending": 3,
        "stock_info": {
          "DEPOSITO": "RONDEAU",
          "LOTE": "SINLOTE",
          "STOCKTOTAL": 4,
          "ESDEPOSITOLOCAL": 1,
          "stock_sufficient": true,
          "shortage": 0
        }
      }
    ]
  }
}
```

### Sin Información de Stock

```json
{
  "order": {
    "number": "NP 623136",
    "warehouse": "RONDEAU",
    "items": [
      {
        "code": "08918",
        "description": "PPN-CODO A 45* DE 40 MH",
        "quantity": 3,
        "pending": 3,
        "stock_info": null,
        "warning": "Producto sin stock registrado en este depósito"
      }
    ]
  }
}
```

## ⚠️ Casos Especiales

### 1. Producto Sin Stock

**Cuando pasa:** El producto no tiene stock registrado en el depósito

**Posibles causas:**
- Producto agotado (sin stock)
- Producto nuevo (sin movimiento de stock)
- Producto especial (no controla stock)
- Error en código de producto

**Cómo manejarlo:**
```php
if (!$stockInfo) {
    echo "⚠️  Producto sin stock registrado\n";
    echo "   Puede que:\n";
    echo "   - Este producto no controles stock\n";
    echo "   - Esté agotado actualmente\n";
    echo "   - Sea un producto especial\n";
}
```

### 2. Stock Insuficiente

**Cuando pasa:** El pedido solicita más unidades de las que hay en stock

**Cómo detectarlo:**
```php
if ($stockInfo && $item['PENDIENTE'] > $stockInfo['STOCKTOTAL']) {
    $shortage = $item['PENDIENTE'] - $stockInfo['STOCKTOTAL'];
    echo "⚠️  STOCK INSUFICIENTE (faltan {$shortage} unidades)\n";
}
```

### 3. Múltiples Lotes

**Cuando pasa:** El producto tiene stock en múltiples lotes

**Ejemplo:**
```json
{
  "Product_Stock": [
    {"DEPOSITO": "RONDEAU", "LOTE": "LOTE1", "STOCKTOTAL": 2},
    {"DEPOSITO": "RONDEAU", "LOTE": "LOTE2", "STOCKTOTAL": 5}
  ]
}
```

**Cómo manejarlo:**
```php
$totalStock = 0;
foreach ($stockArray as $stock) {
    if ($stock['DEPOSITO'] === $order['DEPOSITO']) {
        $totalStock += $stock['STOCKTOTAL'];
    }
}
echo "Stock total: {$totalStock}\n";
```

## 🚀 Ventajas de Este Endpoint

### ✅ Información en Tiempo Real
- Stock actual al momento de la consulta
- Por depósito y por lote
- Distingue depósitos locales

### ✅ Prevención de Errores
- Alerta de stock insuficiente antes de picking
- Evita desperdicio de tiempo buscando productos sin stock
- Permite planificar reposición

### ✅ Mejor Experiencia del Operario
- Saben exactamente cuánto stock hay
- Pueden alertar sobre faltantes
- Conocen el lote específico a retirar

## 📝 Script Actualizado

El script `test-picking-with-stock-info.php` ya incluye esta funcionalidad.

### Para Ejecutar

```bash
cd flexxus-picking-backend
php tests/test-picking-with-stock-info.php
```

### Resultado Esperado

```
📦 ITEM: PRODUCTO CON STOCK
  Código: 04535
  Lote pedido: SINLOTE
  Lote en stock: SINLOTE
  Stock disponible: 4 unidades
  Depósito local: Sí
  Solicitada: 3
  Pendiente: 3
  ✅ Stock suficiente

📦 ITEM: PRODUCTO SIN STOCK
  Código: 08918
  ⚠️  Producto sin stock registrado en este depósito
```

## 📚 Referencias

- [Script con stock info](../../flexxus-picking-backend/tests/test-picking-with-stock-info.php)
- [Documentación de ubicaciones](./03-UBICACIONES_DE_PRODUCTOS.md)
- [Guía de endpoints](./02-GUIA_ENDPOINTS.md)
