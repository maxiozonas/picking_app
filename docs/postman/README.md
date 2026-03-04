# Postman Collection - Picking App API

Colección completa de Postman para testear toda la API de Picking App.

## 📁 Archivos Incluidos

| Archivo | Descripción |
|---------|-------------|
| `Picking-App-API-Collection.json` | Colección principal con todos los endpoints |
| `Picking-App-Environment.json` | Environment con variables pre-configuradas |

---

## 🚀 Cómo Usar

### Paso 1: Importar en Postman

1. Abrir Postman
2. Ir a **File → Import**
3. Seleccionar ambos archivos JSON:
   - `Picking-App-API-Collection.json`
   - `Picking-App-Environment.json`

### Paso 2: Configurar Environment

1. En Postman, hacer click en el dropdown de environments (arriba a la derecha)
2. Seleccionar **"Picking App - Environment"**
3. Verificar que las variables están configuradas:
   - `base_url`: `http://localhost:8000/api` (o tu URL de producción)
   - `token`: (se填充 automáticamente después del login)
   - `order_number`: `NP-12345` (ordene de prueba)
   - `item_code`: `PROD-001` (producto de prueba)

### Paso 3: Ejecutar Tests

#### Opción A: Ejecutar Login Primero
1. Ir a **1. Autenticación → Login - Obtener Token**
2. Click en **Send**
3. Verificar que el token se almacenó en la variable `{{token}}`

#### Opción B: Flujo Completo E2E
1. Ir a **8. Flujo Completo (E2E)**
2. Click en **Run**
3. Seleccionar **"Iterate"** y configurar количество iteraciones
4. Ejecutar todo el flujo en orden

---

## 📋 Endpoints Incluidos

### 1. Autenticación
- `POST /api/auth/login` - Login y obtener token
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### 2. Órdenes de Picking
- `GET /api/picking/orders` - Listar órdenes disponibles
- `GET /api/picking/orders/{order_number}` - Ver detalle de orden
- `POST /api/picking/orders/{order_number}/start` - Iniciar preparación

### 3. Picking de Items
- `POST /api/picking/orders/{order_number}/items/{item_code}/pick` - Marcar item
- `POST /api/picking/orders/{order_number}/complete` - Completar orden

### 4. Validación de Stock (NUEVO)
- `GET /api/picking/orders/{order_number}/stock/{item_code}` - Obtener stock
- `GET /api/picking/orders/{order_number}/stock-validations` - Ver historial de validaciones

### 5. Alertas
- `POST /api/picking/alerts` - Crear alerta
- `GET /api/picking/alerts` - Listar alertas
- `PATCH /api/picking/alerts/{id}/resolve` - Resolver alerta

### 6. Depósitos
- `GET /api/warehouses` - Listar depósitos

### 7. Tests de Error
- `401` - Sin autenticación
- `404` - Orden no encontrada
- `400` - Estado de orden inválido

### 8. Flujo Completo (E2E)
- 9 pasos secuenciales para probar el flujo completo

---

## ✅ Tests Automáticos Incluidos

Cada request incluye tests de verificación:

| Request | Test |
|---------|------|
| Login | Token almacenado correctamente |
| Stock de Item | Stock obtenido correctamente |
| Validaciones | Estructura de respuesta correcta |
| Pick Item | Validación de stock incluida en respuesta |
| Error 401 | Retorna 401 sin token |
| Error 404 | Error code ORDER_NOT_FOUND |

---

## 🔧 Configuración Avanzada

### Cambiar URL de API
1. Click en **Environments** (icono de engranaje)
2. Editar variable `base_url`
3. Guardar cambios

### Agregar Nuevos Tokens
Los tokens de Sanctum expiran. Para renovarlos:
1. Ejecutar Login novamente
2. El test automáticamente actualiza `{{token}}`

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `base_url` | URL base de la API | `http://localhost:8000/api` |
| `token` | Token de autenticación | (auto-llenado) |
| `order_number` | Número de orden de prueba | `NP-12345` |
| `item_code` | Código de producto de prueba | `PROD-001` |
| `warehouse_code` | Código de depósito | `01` |

---

## 📊 Coverage de la Colección

| Categoría | Endpoints | Tests |
|-----------|-----------|-------|
| Autenticación | 3 | 1 |
| Órdenes | 3 | 0 |
| Picking | 3 | 2 |
| Stock (NUEVO) | 2 | 2 |
| Alertas | 4 | 1 |
| Warehouses | 1 | 0 |
| Errores | 3 | 3 |
| E2E | 9 | 0 |
| **TOTAL** | **28** | **9** |

---

## 🎯 Cómo Probar Escenarios de Error

### OverPick (Marcar más de lo pedido)
1. Ejecutar **3. Picking de Items → Error - Marcar más de lo Pedido (OverPick)**
2. Verificar que retorna:
   - Status: `400`
   - Error code: `OVER_PICK`

### Stock Insuficiente
1. Configure un order con stock bajo en Flexxus
2. Intente pickear
3. Verificar que retorna:
   - Status: `400`
   - Error code: `PHYSICAL_STOCK_INSUFFICIENT`

### Re-picking (Item ya completado)
1. Complete un item primero
2. Intente pickear nuevamente
3. Verificar que retorna:
   - Status: `400`
   - Error code: `ALREADY_PICKED`

---

## 📝 Notas

- Los tests asumen que existe un usuario `admin@picking.app` con password `password123`
- Reemplazar `order_number` e `item_code` con valores reales de tu base de datos
- Para producción, cambiar `base_url` al dominio correspondiente

---

**Versión**: 1.0.0  
**Fecha**: 2026-03-04  
**Proyecto**: picking.app - improve-picking-stock-validation
