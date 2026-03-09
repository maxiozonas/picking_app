# 📦 Colección de Postman: Warehouse Flexxus Credentials

Guía completa para testear el sistema de credenciales Flexxus por depósito implementado en el cambio `warehouse-flexxus-credentials`.

---

## 🚀 Configuración Inicial

### 1. Importar la Colección

1. Abre Postman
2. Click en **Import** → **Upload Files**
3. Selecciona `Picking-App-Warehouse-Credentials.postman_collection.json`
4. La colección se importará con 14 requests preconfigurados

### 2. Configurar Variables de Entorno

La colección usa variables automáticas que se van seteando durante la ejecución:

| Variable | Descripción | Se setea en |
|----------|-------------|--------------|
| `BASE_URL` | URL base de la API | Valor inicial: `http://localhost:8000` |
| `admin_token` | Token Sanctum del admin | Request 01 (Login Admin) |
| `operador_token` | Token Sanctum del operario | Request 02 (Login Operario) |
| `admin_id` | ID del usuario admin | Request 01 |
| `operador_id` | ID del operario | Request 02 |
| `warehouse_001_id` | ID del warehouse Don Bosco | Request 04 |
| `warehouse_002_id` | ID del warehouse Rondeau | Request 04 |
| `warehouse_004_id` | ID del warehouse Socrates | Request 04 |

---

## 📋 Orden de Ejecución Recomendado

### **Paso 1: Autenticación**
```
01 - Auth - Login (Admin)
02 - Auth - Login (Operario Rondeau)
03 - Auth - Login (Operario Don Bosco)
```

**¿Qué hace?**
- Loguea como admin para obtener token
- Loguea como operario de Rondeau (depósito 002)
- Loguea como operario de Don Bosco (depósito 001)

**Tests automáticos:**
- ✅ Status 200
- ✅ Token devuelto
- ✅ Rol correcto
- ✅ Warehouse correcto

---

### **Paso 2: Gestión de Credenciales (Admin)**
```
04 - Admin - Listar Warehouses
05 - Admin - Actualizar Credenciales (Rondeau 002)
06 - Admin - Actualizar Credenciales (Don Bosco 001)
07 - Admin - Actualizar Credenciales (Socrates 004)
```

**¿Qué hace?**
- Lista todos los warehouses del sistema
- Configura credenciales Flexxus para cada depósito:
  - **Rondeau (002)**: PREPR / 1234
  - **Don Bosco (001)**: PREPDB / 1234
  - **Socrates (004)**: PREPVM / 1234

**Tests automáticos:**
- ✅ Status 200
- ✅ **NO expone** `flexxus_username` ni `flexxus_password` (seguridad)
- ✅ Expone `has_flexxus_credentials: true` (sin secretos)

---

### **Paso 3: Asignación de Warehouse**
```
08 - Admin - Asignar Warehouse a Operario
```

**¿Qué hace?**
- Asigna el depósito Rondeau (002) a un operario
- Reemplaza cualquier warehouse anterior
- **IMPORTANTE**: Ya no existe `original_warehouse_id`, solo `warehouse_id`

**Tests automáticos:**
- ✅ Operario ahora tiene `warehouse_id = 002`
- ✅ Respuesta NO expone credenciales del warehouse

---

### **Paso 4: Operaciones de Picking (Operario)**
```
09 - Operario - Obtener Órdenes Disponibles
10 - Operario - Ver Detalle de Orden
```

**¿Qué hace?**
- Obtiene órdenes de picking disponibles
- **SOLO** órdenes del warehouse del operario (Rondeau 002)
- Filtradas por tipo EXPEDICION
- Estado: `pending` o `in_progress`

**Tests automáticos:**
- ✅ Status 200
- ✅ NO incluye credenciales Flexxus en respuesta
- ✅ Solo órdenes del warehouse correcto

---

### **Paso 5: Override de Warehouse (Admin)**
```
11 - Admin - Override Warehouse (via Header)
```

**¿Qué hace?**
- Admin accede a órdenes usando header `X-Warehouse-Override: 001`
- Usa credenciales del depósito 001 (Don Bosco) temporalmente
- **NO modifica** el `warehouse_id` del admin en BD
- Solo válido para ese request específico

**Tests automáticos:**
- ✅ Status 200
- ✅ Órdenes son del warehouse 001, no del admin

---

### **Paso 6: Seguridad y Permisos**
```
12 - Admin - Eliminar Credenciales de Warehouse
13 - Security - Non-Admin No Puede Acceder Admin Endpoints
```

**¿Qué hace?**
- **Request 12**: Elimina credenciales de un warehouse
  - ⚠️ Después de esto, operarios de ese warehouse NO pueden hacer picking
- **Request 13**: Verifica que operarios NO pueden gestionar credenciales
  - Debe retornar 403 Forbidden

**Tests automáticos:**
- ✅ Request 12: `has_flexxus_credentials = false`
- ✅ Request 13: Status 403 Forbidden

---

### **Paso 7: Verificación de Usuario**
```
14 - Auth - Obtener Usuario Actual (Me)
```

**¿Qué hace?**
- Obtiene información del usuario autenticado
- Incluye warehouse del usuario
- **NO expone** credenciales Flexxus del warehouse
- Para admins: incluye `available_warehouses` y `can_override_warehouse`

**Tests automáticos:**
- ✅ Status 200
- ✅ Incluye warehouse info
- ✅ NO expone credenciales

---

## 🔐 Tests de Seguridad Automatizados

Cada request incluye tests automáticos que validan:

1. **Redacción de Secretos**
   ```javascript
   pm.test("Does NOT expose flexxus credentials", function () {
       pm.expect(jsonData).to.not.have.property('flexxus_username');
       pm.expect(jsonData).to.not.have.property('flexxus_password');
   });
   ```

2. **Status Codes Correctos**
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });
   ```

3. **Permisos de Acceso**
   ```javascript
   pm.test("Non-admin gets 403", function () {
       pm.response.to.have.status(403);
   });
   ```

---

## 📊 Credenciales de Prueba

### **Credenciales de App (Laravel)**
```
Admin:
- Username: admin
- Password: password

Operario Rondeau:
- Username: operador_rondeau (o cualquier operario con warehouse_id = 2)
- Password: password

Operario Don Bosco:
- Username: operador_donbosco (o cualquier operario con warehouse_id = 1)
- Password: password
```

### **Credenciales de Flexxus (ERP Externo)**
```
Rondeau (código 002):
- Username: PREPR
- Password: 1234

Don Bosco (código 001):
- Username: PREPDB
- Password: 1234

Socrates (código 004):
- Username: PREPVM
- Password: 1234
```

---

## 🧪 Scenarios de Testing

### **Scenario 1: Flujo Completo de Operario**
```
1. Login como operador Rondeau → Request 02
2. Admin asigna warehouse Rondeau → Request 08
3. Operador obtiene órdenes → Request 09
4. Verificar: Solo órdenes de Rondeau (002)
5. Verificar: NO hay credenciales Flexxus en respuesta
```

### **Scenario 2: Cambio de Warehouse**
```
1. Login como operador Rondeau → Request 02
2. Admin reasigna a Don Bosco → Request 08 (usar warehouse_001_id)
3. Operario obtiene órdenes → Request 09
4. Verificar: Ahora son órdenes de Don Bosco (001)
5. Verificar: Credenciales usadas son PREPDB (no PREPR)
```

### **Scenario 3: Override de Admin**
```
1. Login como admin → Request 01
2. Obtener órdenes SIN override → Request 09
3. Obtener órdenes CON override → Request 11 (X-Warehouse-Override: 001)
4. Verificar: Request 11 usa credenciales de 001
5. Verificar: warehouse_id del admin NO cambió en BD
```

### **Scenario 4: Seguridad - No Exposición de Secretos**
```
1. Ejecutar requests 05, 06, 07 (actualizar credenciales)
2. Verificar responses: NUNCA incluyen flexxus_username/password
3. Ejecutar request 14 (me)
4. Verificar: warehouse info NO incluye credenciales
```

### **Scenario 5: Eliminación de Credenciales**
```
1. Configurar credenciales Rondeau → Request 05
2. Operario Rondeau obtiene órdenes → Request 09
3. Admin elimina credenciales Rondeau → Request 12
4. Operador Rondeau obtiene órdenes → Request 09
5. Verificar: Ahora falla (no hay credenciales)
```

---

## ⚠️ Errores Comunes y Soluciones

### **Error 401 Unauthorized**
**Causa**: Token expiró o es inválido
**Solución**: Ejecutar nuevamente el request de login (01 o 02)

### **Error 403 Forbidden**
**Causa**: Usuario sin permisos intentando acceder a endpoints de admin
**Solución**: Usar cuenta de admin, no de operario

### **Error 404 Not Found**
**Causa**: Warehouse ID no existe
**Solución**: Ejecutar primero request 04 para listar warehouses

### **Error: "Warehouse has no Flexxus credentials"**
**Causa**: El warehouse no tiene credenciales configuradas
**Solución**: Ejecutar requests 05, 06, 07 para configurar credenciales

---

## 📈 Verificación de Implementación

Después de ejecutar todos los requests, verifica:

- ✅ **Todos los tests pasan** (checks verdes en Postman)
- ✅ **Credenciales NUNCA se exponen** en ninguna respuesta
- ✅ **Operarios solo ven órdenes** de su warehouse
- ✅ **Admin puede hacer override** temporalmente
- ✅ **Cambio de warehouse** cambia las credenciales usadas

---

## 🚀 Próximos Pasos Después de Testing

Una vez verificado que todo funciona correctamente:

1. **Continuar con funcionalidades de picking**: Stock validation, alertas, completado de órdenes
2. **Implementar mejoras de caché**: TTL más largo, invalidación inteligente
3. **Dashboard de progreso**: Tiempo por orden, items/hora
4. **Sincronización con Flexxus**: Jobs programados, retry logic

---

## 📞 Soporte

Si encuentras algún error durante el testing:

1. **Verifica que el servidor está corriendo**: `php artisan serve`
2. **Ejecuta las migraciones**: `php artisan migrate`
3. **Ejecuta los seeders**: `php artisan db:seed`
4. **Revisa logs**: `php artisan pail`

---

**Colección creada para**: `warehouse-flexxus-credentials` change (v1.1.0)
**Fecha**: 2026-03-09
**Total Requests**: 14
**Tests Automatizados**: 50+
