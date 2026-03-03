# 📮 Colección de Postman - Picking App API

## 🚀 Configuración Rápida

### 1. Importar la Colección

1. Abrir Postman
2. Click en **Import** (esquina superior izquierda)
3. Seleccionar el archivo: `docs/Picking-App-API.postman_collection.json`
4. Click en **Import**

### 2. Configurar Variables

La colección tiene 4 variables predefinidas:

| Variable | Valor Inicial | Descripción |
|----------|---------------|-------------|
| `base_url` | `http://localhost:8000` | URL base de la API |
| `token` | *(se llena automáticamente)* | Token de autenticación Bearer |
| `order_number` | `NP 623136` | Número de pedido (ejemplo) |
| `product_code` | `04535` | Código de producto (ejemplo) |

**Para cambiar variables:**
- Click en la colección "Picking App API"
- Ir a la tab **Variables**
- Modificar `base_url` si tu servidor está en otro puerto

---

## 📋 Estructura de la Colección

```
Picking App API
├── 01 - Authentication
│   ├── Login (guarda token automáticamente)
│   ├── Get Current User
│   └── Logout
├── 02 - Picking Orders
│   ├── List Available Orders
│   ├── Get Order Detail
│   ├── Start Order Preparation
│   ├── Pick Item Quantity
│   ├── Complete Order
│   └── Create Alert
├── 03 - Alerts (Admin)
│   ├── Get All Alerts
│   ├── Get Unresolved High Severity Alerts
│   └── Resolve Alert
└── 04 - Examples & Tests
    ├── Complete Picking Flow (Step-by-Step)
    └── Stock Insufficiency Scenario
```

---

## ✨ Características Especiales

### 🤖 Automatización de Token

El request **Login** tiene un script que automáticamente guarda el token:

```javascript
// Test Script del Login
var jsonData = pm.response.json();
pm.collectionVariables.set("token", jsonData.data.token);
pm.collectionVariables.set("user_id", jsonData.data.user.id);
```

**¿Qué significa?**
1. Ejecutas el request **Login** con tus credenciales
2. El token se guarda automáticamente en la variable `{{token}}`
3. Todos los demás requests usan `{{token}}` - no tenés que copiar/pegar manualmente

### 📊 Tests Automatizados

Cada request tiene tests que verifican:
- Status code (200, 201, etc.)
- Estructura de la respuesta
- Datos esperados presentes

---

## 🧪 Guias de Testing Rápidas

### Test 1: Flujo Completo de Picking (5 minutos)

**Objetivo:** Probar todo el ciclo de vida de un pedido

1. **Ejecutar en orden:**
   ```
   04 - Examples & Tests
   └── Complete Picking Flow (Step-by-Step)
       ├── 1: Login and Start
       ├── 2: List Orders
       ├── 3: Get Order Detail
       ├── 4: Start Preparation
       ├── 5: Pick Item
       └── 6: Complete Order
   ```

2. **Verificar:**
   - ✅ Login devuelve token
   - ✅ Orders muestra pedidos de TU depósito
   - ✅ Order detail muestra items y stock
   - ✅ Start cambia status a "in_progress"
   - ✅ Pick actualiza quantity_picked
   - ✅ Complete cambia status a "completed"

### Test 2: Reportar Stock Insuficiente (3 minutos)

**Objetivo:** Probar sistema de alertas

1. **Ejecutar en orden:**
   ```
   04 - Examples & Tests
   └── Stock Insufficiency Scenario
       ├── 1: Create Stock Alert
       ├── 2: View Alerts as Admin
       └── 3: Resolve Alert
   ```

2. **Verificar:**
   - ✅ Alert se crea correctamente
   - ✅ Filtros funcionan (severity=critical, resolved=false)
   - ✅ Resolve marca is_resolved=true

### Test 3: Error Handling (5 minutos)

**Objetivo:** Probar validaciones y errores

1. **Login con credenciales inválidas:**
   - Cambiar username/password en request **Login**
   - Expected: `401 Unauthorized`

2. **Marcar más cantidad que la requerida:**
   - Usar **Pick Item** con quantity mayor a required
   - Expected: `400/422 Validation Error`

3. **Completar pedido sin marcar todos los items:**
   - Usar **Complete Order** antes de marcar todo
   - Expected: `400 Cannot complete order with incomplete items`

4. **Acceder a pedido de otro depósito:**
   - Crear usuario con otro warehouse_id
   - Intentar acceder a pedido de RONDEAU
   - Expected: `403 Forbidden` o `404 Not Found`

---

## 📝 Cuerpos de Request de Ejemplo

### Login (modificar credenciales)

```json
{
  "username": "TU_USERNAME",
  "password": "TU_PASSWORD"
}
```

### Pick Item (modificar cantidad)

```json
{
  "quantity": 2,
  "mark_as_completed": false
}
```

### Create Alert (ejemplo stock insuficiente)

```json
{
  "order_number": "NP 623136",
  "alert_type": "insufficient_stock",
  "product_code": "04535",
  "message": "Solo hay 2 unidades, se necesitan 10",
  "severity": "high"
}
```

**Alert types disponibles:**
- `insufficient_stock`
- `product_missing`
- `order_issue`

**Severity levels:**
- `low`
- `medium`
- `high`
- `critical`

### Complete Order

```json
{
  "all_items_completed": true
}
```

---

## 🔧 Troubleshooting

### Error: "401 Unauthorized"

**Problema:** Token inválido o expirado

**Solución:**
1. Ejecutar request **Login** nuevamente
2. Verificar que la variable `token` se actualizó
3. Reintentar el request fallido

### Error: "403 Forbidden - You don't have permission"

**Problema:** Usuario no tiene acceso al recurso

**Solución:**
1. Verificar que el usuario tenga el `warehouse_id` correcto
2. Verificar que el pedido sea del mismo depósito
3. Verificar que el pedido esté en estado "pending" o "in_progress"

### Error: "404 Not Found"

**Problema:** Pedido o item no existe

**Solución:**
1. Verificar que el número de pedido sea correcto (formato: NP XXXXXX)
2. Verificar que el pedido exista en Flexxus
3. Verificar que sea tipo EXPEDICION
4. Verificar que sea del día actual

### Error: "422 Validation Error"

**Problema:** Datos inválidos en el request

**Solución:**
1. Leer el mensaje de error en la respuesta
2. Verificar campos requeridos
3. Verificar tipos de datos (enteros, strings, etc.)
4. Ejemplo común: quantity > required (marcar más de lo necesario)

### Error: "Cannot complete order with incomplete items"

**Problema:** Intentando completar pedido sin marcar todos los items

**Solución:**
1. Usar **Get Order Detail** para ver estado de items
2. Marcar todos los items como completos (quantity_picked >= quantity_required)
3. Recién después usar **Complete Order**

---

## 🚀 Casos de Prueba Avanzados

### Caso 1: Picking Parcial (Marcar de a uno)

1. **Start Order** → `NP 623136`
2. **Pick Item** → `04535` con quantity=1
3. **Get Order Detail** → Verificar quantity_picked=1, status=in_progress
4. **Pick Item** → `04535` con quantity=2
5. **Get Order Detail** → Verificar quantity_picked=3, status=completed
6. **Complete Order** → Finalizar

### Caso 2: Múltiples Alertas

1. **Create Alert** → Stock insuficiente producto 1 (high)
2. **Create Alert** → Producto faltante (critical)
3. **Get Alerts** → ?severity=high&resolved=false
4. Verificar que ambas aparezcan
5. **Resolve Alert** → Resolver una
6. **Get Alerts** → ?resolved=false
7. Verificar que solo quede la crítica

### Caso 3: Override de Depósito

1. **Login** → Usuario con can_override_warehouse=true
2. **Get Current User** → Verificar available_warehouses
3. **POST /api/auth/override-warehouse** → Cambiar a otro depósito
4. **Get Orders** → Verificar que ahora ve pedidos del nuevo depósito

---

## 📊 Respuestas Esperadas

### List Orders (200 OK)

```json
{
  "data": [
    {
      "order_number": "NP 623136",
      "customer": "GILI PRESUPUESTO",
      "warehouse": {
        "id": 1,
        "code": "RONDEAU",
        "name": "Depósito RONDEAU"
      },
      "total": 15624.49,
      "created_at": "2026-03-02T10:30:00Z",
      "delivery_type": "EXPEDICION",
      "items_count": 2,
      "status": "pending",
      "started_at": null
    }
  ]
}
```

### Get Order Detail (200 OK)

```json
{
  "data": {
    "order_number": "NP 623136",
    "customer": "GILI PRESUPUESTO",
    "warehouse": {...},
    "total": 15624.49,
    "status": "in_progress",
    "items": [
      {
        "product_code": "04535",
        "description": "PPN-CODO A 45* DE 40 MH",
        "quantity_required": 3,
        "quantity_picked": 1,
        "lot": "SINLOTE",
        "status": "in_progress",
        "stock_info": {
          "available": 4,
          "is_local": true,
          "is_sufficient": true,
          "shortage": 0
        }
      }
    ],
    "alerts": []
  }
}
```

### Pick Item (200 OK)

```json
{
  "data": {
    "product_code": "04535",
    "quantity_required": 3,
    "quantity_picked": 2,
    "status": "in_progress",
    "remaining": 1
  }
}
```

---

## 💡 Tips de Productividad

### 1. Usar "Run Collection" en secuencia

```
1. Seleccionar carpeta "Complete Picking Flow"
2. Click derecho → Run collection
3. Postman ejecuta todos los requests en orden
4. Verificar resultados en la consola
```

### 2. Usar "Environment Switcher"

```
1. Crear múltiples entornos:
   - Development (localhost:8000)
   - Staging (staging-api.com)
   - Production (api.com)

2. Cambiar rápidamente entre entornos
3. No copiar/pegar URLs
```

### 3. Usar "Tests" como documentación

```
1. Cada request tiene tests que muestran la estructura esperada
2. Leer los tests para entender qué devuelve la API
3. Modificar tests para adaptarlos a tu flujo
```

### 4. Exportar/Importar para compartir

```
1. Click derecho en colección → Export
2. Enviar JSON al equipo
3. Equipo importa en su Postman
4. Todos tienen la misma configuración
```

---

## 🎯 Checklist Antes de Frontend

Antes de integrar con React Native:

- [ ] Login funciona y guarda token
- [ ] List Orders muestra pedidos filtrados por depósito
- [ ] Get Order Detail muestra items con stock
- [ ] Start Order crea progreso correctamente
- [ ] Pick Item actualiza quantity_picked
- [ ] Complete Order marca como completed
- [ ] Create Alert notifica correctamente
- [ ] Get Alerts filtra por parámetros
- [ ] Resolve Alert marca is_resolved=true
- [ ] Validaciones funcionan (422 errors)
- [ ] Permisos funcionan (403 errors)
- [ ] Token expiration funciona (401 errors)

---

## 📞 Soporte

Si encontrás algún problema:

1. **Verificar servidor:** `php artisan serve` corriendo
2. **Verificar rutas:** `php artisan route:list --path=picking`
3. **Verificar logs:** `php artisan pail` (logs en tiempo real)
4. **Verificar tests:** `php artisan test --filter=Picking`

---

## 🎉 ¡Listo para Testear!

Importa la colección en Postman y empezá a testear la API en segundos. 🚀
