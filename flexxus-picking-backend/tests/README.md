# Prueba de Flujo de Picking

Este directorio contiene pruebas de concepto para el flujo de picking de la aplicación.

## 📋 Contenido

### ✅ test-picking-with-flexxus-client.php (RECOMENDADO)
**Prueba completa FUNCIONAL** que utiliza el `FlexxusClient` existente del proyecto.

**Uso:**
```bash
cd flexxus-picking-backend
php tests/test-picking-with-flexxus-client.php
```

**Resultado exitoso (2026-03-02):**
```
✅ 2 PEDIDOS DE PICKING ENCONTRADOS
Total: $150,205.46
Items: 3
Depósito: RONDEAU
Tipo: EXPEDICION

📦 PEDIDO #1: NP 623136 - GILI PRESUPUESTO ($15,624.49)
   - PPN-CODO A 45* DE 40 MH (x3)
   - PPN.PROLONGADOR DE CAMARA (x1)

📦 PEDIDO #2: NP 623138 - OZONAS GUSTAVO ($134,580.98)
   - 1RA 38X38 FORTALEZA GRAFITO X 2.02-CCN (x10)
```

### test-picking-flow.php
Prueba original del flujo de picking (usa CURL directo, requiere licencia disponible).

### inspect-deliverydata.php
Herramienta de diagnóstico para inspeccionar la respuesta del endpoint `deliverydata`.

## 🎯 Objetivo

Demonstrar que podemos:
1. ✅ Autenticarnos con Flexxus
2. ✅ Obtener el depósito asignado al usuario
3. ✅ Obtener pedidos del día
4. ✅ Filtrar por depósito específico (ej: RONDEAU)
5. ✅ Filtrar por tipo de entrega (EXPEDICION - retiro en sucursal)
6. ✅ Mostrar detalles completos de picking (items, cantidades, precios)

## 🚀 Cómo Ejecutar

### Requisitos Previos
- PHP 7.4 o superior instalado
- Extensión `curl` de PHP habilitada
- Conexión a internet activa
- Credenciales válidas de Flexxus

### Verificar Requisitos

```bash
# Verificar versión de PHP
php --version

# Verificar extensión curl
php -m | grep curl
```

### Ejecutar la Prueba

```bash
# Desde el directorio raíz del proyecto
php flexxus-picking-backend/tests/test-picking-flow.php
```

### Salida Esperada

Si todo funciona correctamente, verás:

```
🚀 INICIANDO PRUEBA DE FLUJO DE PICKING
======================================================================
Fecha de prueba: 2026-03-02
Depósito objetivo: RONDEAU
======================================================================

⏳ PASO 1: Autenticando con Flexxus...
✅ Login exitoso
   Usuario: CARLOSR
   Depósito: RONDEAU (002)
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJDQVJ...

⏳ PASO 2: Obteniendo pedidos del día 2026-03-02...
✅ Se encontraron 3 pedidos en total

📊 Todos los pedidos del día:
   - NP 623133: DON BOSCO - PRESUPUESTO [Pendiente]
   - NP 623135: SOCRATES - GILI PRESUPUESTO [Pendiente]
   - NP 623136: RONDEAU - GILI PRESUPUESTO [Pendiente]

⏳ PASO 3: Filtrando por depósito RONDEAU...
✅ 1 pedidos de RONDEAU

⏳ PASO 4: Filtrando por EXPEDICION (retiro en sucursal)...
✅ 1 pedidos de EXPEDICION

======================================================================
📋 LISTA DE PICKING - EXPEDICION
======================================================================

📦 PEDIDO #1
----------------------------------------------------------------------
Número: NP 623136
Cliente: GILI PRESUPUESTO
Fecha: 02/03/2026
Depósito: RONDEAU
Total: $15,624.49
Tipo Entrega: EXPEDICION (Retiro en sucursal)

📦 ITEMS A PREPARAR:
----------------------------------------------------------------------

  ➤ PPN-CODO A 45* DE  40 MH
     Cód: 08918
     Cantidad: 3
     Pendiente: 3
     Remitido: 0
     Precio Unit.: $455.53
     Subtotal: $1,366.60

  ➤ PPN.PROLONGADOR DE CAMARA
     Cód: 54212
     Cantidad: 1
     Pendiente: 1
     Remitido: 0
     Precio Unit.: $17,539.03
     Subtotal: $17,539.03

======================================================================

✅ PRUEBA COMPLETADA CON ÉXITO
   Se encontraron 1 pedidos de picking para RONDEAU
   Fecha: 2026-03-02
   Tipo: EXPEDICION (retiro en sucursal)

📊 RESUMEN:
======================================================================
Total de pedidos: 1
Total de items: 2
Monto total: $15,624.49
======================================================================
```

## 🔧 Configuración

Para modificar la configuración de la prueba, edita el archivo `test-picking-flow.php` y modifica la sección de configuración al inicio:

```php
$config = [
    'flexxus' => [
        'base_url' => 'https://apicasa.cflex.com.ar',
        'username' => 'CARLOSR',        // Cambiar por otro usuario si es necesario
        'password' => 'W250',           // Cambiar por otra contraseña si es necesario
        'deviceinfo' => [...]
    ],
    'test' => [
        'date' => '2026-03-02',         // Cambiar fecha de prueba
        'warehouse' => 'RONDEAU'        // Cambiar depósito (DON BOSCO, SOCRATES, etc.)
    ]
];
```

## 📊 Métricas de Éxito

La prueba se considera exitosa si:
- ✅ Autenticación funciona (token recibido)
- ✅ Obtiene pedidos del día especificado
- ✅ Filtra correctamente por depósito
- ✅ Verifica tipo de entrega EXPEDICION
- ✅ Muestra los items con sus detalles
- ✅ Todo el flujo completa sin errores

## ❌ Solución de Problemas

### Error: "Call to undefined function curl_init()"
**Solución:** Instalar la extensión curl de PHP
```bash
# Ubuntu/Debian
sudo apt-get install php-curl

# Windows
# Descomentar la línea ;extension=curl en php.ini
```

### Error: "HTTP 401: Unauthorized"
**Solución:** Verificar que las credenciales (username/password) sean correctas

### Error: "HTTP 500: Internal Server Error"
**Solución:** 
- Verificar que la API de Flexxus esté disponible
- Revisar si la fecha de prueba tiene pedidos registrados

### Error: "No se encontraron pedidos de EXPEDICION"
**Posibles causas:**
- No hay pedidos de EXPEDICION en esa fecha
- Todos los pedidos son de REPARTO (delivery)
- Los pedidos ya fueron marcados como entregados

## 📝 Notas

- Esta prueba NO requiere base de datos ni Laravel
- Es un script PHP independiente que se conecta directamente a Flexxus
- Utiliza los mismos endpoints que usará la aplicación final
- Sirve como prueba de concepto antes de implementar el backend completo

## 🔗 Endpoints Utilizados

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/auth/login` | POST | Autenticación |
| `/v2/orders` | GET | Pedidos del día |
| `/v2/deliverydata/NP/{id}` | GET | Tipo de entrega |
| `/v2/orders/NP/{id}` | GET | Detalle de orden |

## 📚 Documentación Adicional

- [Guía de Desarrollo Completa](../../docs/GUIA_DESARROLLO_COMPLETA.md)
- [Cheatsheet de Endpoints](../../docs/CHEATSHEET_ENDPOINTS.md)
- [Documentación de Flexxus](../../docs/swagger-ui-init.js)

## ✅ Próximos Pasos

Una vez verificada la prueba:
1. Crear el endpoint en Laravel: `POST /api/login`
2. Crear el endpoint en Laravel: `GET /api/orders`
3. Implementar el filtrado por depósito en el backend
4. Crear el frontend en React Native para mostrar los pedidos
