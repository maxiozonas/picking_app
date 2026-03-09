# 🚀 Guía Rápida - Testing con Postman

## ⚡ Setup en 3 Pasos

### 1. Preparar la Base de Datos
```bash
# Windows
cd postman
setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

Esto hará:
- ✅ Migraciones fresh
- ✅ Seeders (roles, permisos, warehouses)
- ✅ Inicia servidor en `http://localhost:8000`

### 2. Importar Colección en Postman
1. Abre Postman
2. **Import** → **Upload Files**
3. Selecciona `Picking-App-Warehouse-Credentials.postman_collection.json`
4. Listos: 14 requests preconfigurados

### 3. Ejecutar Tests en Orden
```
01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14
```

## 🔑 Credenciales

**Admin (Login)**:
- Username: `admin`
- Password: `password`

**Operario Rondeau (Login)**:
- Username: `operador_rondeau`
- Password: `password`
- Warehouse: 002 (Rondeau)

**Operario Don Bosco (Login)**:
- Username: `operador_donbosco`
- Password: `password`
- Warehouse: 001 (Don Bosco)

**Credenciales Flexxus (Configurar en Request 05/06/07)**:
- Rondeau (002): `PREPR` / `1234`
- Don Bosco (001): `PREPDB` / `1234`
- Socrates (004): `PREPVM` / `1234`

## ✅ Qué Validar

1. **Seguridad**: NINGÚN request debe exponer `flexxus_username` ni `flexxus_password`
2. **Aislamiento**: Operario Rondeau SOLO ve órdenes de Rondeau
3. **Override**: Admin con header `X-Warehouse-Override` usa credenciales de otro warehouse
4. **Reasignación**: Cambiar warehouse de operario cambia las credenciales usadas

## 🧪 Scenarios Clave

**Scenario 1: Flujo Operario**
```
01 (Login Admin)
02 (Login Operario Rondeau)
08 (Asignar warehouse 002)
09 (Obtener órdenes)
```
✅ Verificar: Solo órdenes de Rondeau (002)

**Scenario 2: Override Admin**
```
01 (Login Admin)
09 (Órdenes sin override)
11 (Órdenes CON override X-Warehouse-Override: 001)
```
✅ Verificar: Request 11 devuelve órdenes de Don Bosco (001)

**Scenario 3: Seguridad**
```
02 (Login Operario)
05 (Actualizar credenciales como operario)
```
✅ Verificar: Status 403 Forbidden (operario no puede gestionar credenciales)

## 📊 Esperado

- **14 Requests** en total
- **50+ Tests** automáticos
- **Todos los tests** deben pasar ✅
- **Tiempo estimado**: 5-10 minutos

---

**¿Problemas?**
1. Servidor no inicia → `php artisan serve`
2. Token expira → Re-ejecutar login (01 o 02)
3. Tests fallan → Verificar que ejecutaste `setup.bat` primero

**Listo para continuar con Picking y Stock después de testing!** 🎯
