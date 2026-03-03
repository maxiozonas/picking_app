# Decisión Pendiente: Estrategia de Autenticación

**Fecha:** 2 de Marzo de 2026
**Para:** Dirección y Gerencia
**De:** Equipo de Desarrollo

---

## Resumen Ejecutivo

Descubrimos que **Flexxus devuelve el depósito del usuario en la respuesta del login**, lo cual simplifica el desarrollo pero crea un nuevo desafío que requiere decisión directiva.

---

## La Nueva Información

### Respuesta de Flexxus al hacer Login

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "CARLOSR",
    "full_name": "RODRIGUEZ CARLOS",
    "warehouse_id": "002",        // ← DEPÓSITO DEL USUARIO
    "warehouse_name": "RONDEAU"    // ← NOMBRE DEL DEPÓSITO
  },
  "config": {
    "warehouse_id": "002"
  }
}
```

**Lo que esto significa:**
✅ El depósito viene automáticamente en la respuesta
✅ No necesitamos sincronizar depósitos en una tabla separada
✅ Flexxus ya sabe qué depósito tiene asignado cada usuario

---

## El Problema que Surge

### Situación Actual

```
Tienen 3 depósitos:
├── 001 - DON BOSCO
├── 002 - RONDEAU
└── 003 - SOCRATES

Cuenta Flexxus actual: CARLOSR/W250
└── Está asignada a: 002 - RONDEAU
```

**El desafío:**
Si todos los operarios se loguean con CARLOSR, Flexxus les dice que están en RONDEAU, aunque trabajen en DON BOSCO o SOCRATES.

---

## Dos Opciones para Resolverlo

### Opción A: Cuentas de Flexxus por Depósito ✅ RECOMENDADA

**Solución:**
Crear una cuenta de Flexxus para cada depósito:
- `CARLOSR_DONBOSCO` → Asignada a 001 (DON BOSCO)
- `CARLOSR_RONDEAU` → Asignada a 002 (RONDEAU)
- `CARLOSR_SOCRATES` → Asignada a 003 (SOCRATES)

**Cómo funciona:**
```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  App Móvil  │ ───> │   Flexxus    │      │   Flexxus   │
│  Operario   │      │  Auth/ERP    │      │    API      │
└─────────────┘      └──────────────┘      └─────────────┘
     Usuario 1            CARLOSR_DONBOSCO    → Depósito 001
     Usuario 2            CARLOSR_RONDEAU     → Depósito 002
     Usuario 3            CARLOSR_SOCRATES    → Depósito 003
```

**Ventajas:**
- ✅ **Login directo a Flexxus** (más simple, sin backend intermedio)
- ✅ **Cada usuario se loguea con su cuenta de Flexxus**
- ✅ **El depósito viene automático** en la respuesta
- ✅ **Trazabilidad en Flexxus** (saben quién hizo qué)
- ✅ **Sin sincronización de depósitos** (ya viene en login)
- ✅ **Sin base de datos local compleja**

**Desventajas:**
- ❌ Requiere crear cuentas de Flexxus (gestión administrativa)
- ❌ Dependencia del depto de sistemas de Flexxus
- ❌ Posibles costos de licencias (confirmar)

**Implementación:**
```javascript
// App Móvil (React Native)
const login = async (username, password) => {
  const response = await axios.post('https://flexxus.url/auth/login', {
    username,
    password,
    deviceinfo: { uuid: deviceInfo }
  });

  const { token, user } = response.data;

  // Guardar token y depósito
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('warehouse_id', user.warehouse_id);
  await AsyncStorage.setItem('warehouse_name', user.warehouse_name);

  // Ya sabemos el depósito, no necesitamos pedirlo
};
```

---

### Opción B: Login Local con Cuenta Compartida

**Solución:**
- Mantener una sola cuenta de Flexxus (CARLOSR/W250)
- Crear login local en nuestra base de datos
- Cada operario tiene su usuario local
- Mapeamos manualmente qué operario trabaja en qué depósito

**Cómo funciona:**
```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  App Móvil  │ ───> │ Backend      │ ───> │   Flexxus   │
│  Operario   │      │  Laravel     │      │    API      │
└─────────────┘      │  Auth local  │      └─────────────┘
     Juan Pérez          ↓               CARLOSR/W250
     María López     Tabla users       (compartido)
     Carlos Ruiz     warehouse_id     (compartido)
```

**Ventajas:**
- ✅ **No depende de crear cuentas en Flexxus**
- ✅ **Control total** (pueden cambiar depósitos sin depender de nadie)
- ✅ **Implementación inmediata** (sin gestiones externas)
- ✅ **Trazabilidad local completa**

**Desventajas:**
- ❌ Requiere backend intermedio (más complejo)
- ❌ Depósitos no sincronizados con Flexxus
- ❌ No hay trazabilidad en Flexxus
- ❌ Más componentes que mantener

---

## Comparativa Rápida

| Aspecto | Opción A (Cuentas Flexxus) | Opción B (Login Local) |
|---------|--------------------------|---------------------|
| **Complexidad** | Baja ⭐ | Media ⭐⭐ |
| **Implementación** | 1-2 semanas | 3-4 semanas |
| **Control** | Medio (depende de Flexxus) | Alto (independiente) |
| **Trazabilidad Flexxus** | Sí ✅ | No ❌ |
| **Trazabilidad Local** | Sí ✅ | Sí ✅ |
| **Cambio de depósito** | Solicitar a Flexxus | Cambio local inmediato |
| **Costos** | Posibles licencias | Sin costos |
| **Sincronización** | No requiere | Sincronizar depósitos |
| **Dependencia externa** | Alta (crear cuentas) | Baja (autónomo) |

---

## Recomendación Técnica

### Si eligen Opción A (Cuentas Flexxus) ✅

**Sistema más simple:**
- App móvil se conecta directamente a Flexxus
- Sin backend Laravel
- Base de datos mínima (solo para estado de picking)

**Componentes:**
```
App Móvil (React Native)
    ↓
Flexxus API (Login + Pedidos)
    ↓
Base de Datos Local (SQLite en el móvil)
    ↓
Panel Admin (Web simple)
```

**Implementación:** 2-3 semanas

---

### Si eligen Opción B (Login Local)

**Sistema más robusto:**
- Backend Laravel con Sanctum
- Login local independiente
- Trazabilidad completa
- Más control

**Componentes:**
```
App Móvil (React Native)
    ↓
Backend Laravel (Auth + Lógica)
    ↓
Base de Datos MySQL (Users + Pickings)
    ↓
Flexxus API (Cuenta compartida CARLOSR/W250)
    ↓
Panel Admin (Laravel Nova)
```

**Implementación:** 6-8 semanas

---

## Preguntas para Directivos

### Sobre Opción A (Cuentas Flexxus)

1. **¿Flexxus puede crear cuentas por depósito?**
   - ¿Hay costos por licencia adicional?
   - ¿Cuánto tiempo demora?

2. **¿Es problema que los operarios compartan credenciales de Flexxus?**
   - ¿Preferimos que cada uno tenga su cuenta?
   - ¿O da igual que compartan CARLOSR_DONBOSCO?

3. **¿Quién gestiona las contraseñas?**
   - ¿Los operarios pueden cambiar su contraseña?
   - ¿O lo hace el admin?

---

## Información Adicional

### Depósitos Actuales

| Código | Nombre | Observación |
|--------|--------|-------------|
| 001 | DON BOSCO | Depósito principal |
| 002 | RONDEAU | Depósito secundario |
| 003 | SOCRATES | Tercer depósito |

### Cuenta Flexxus Actual

- **Usuario:** CARLOSR
- **Password:** W250
- **Depósito asignado:** 002 (RONDEAU)

---

## Próximos Pasos

### Inmediato

1. ✅ **Reunión con directivos** para presentar las 2 opciones
2. ✅ **Confirmar con Flexxus:**
   - Si pueden crear cuentas por depósito
   - Costos de licencias (si aplica)
   - Tiempos de implementación

### Según decisión

**Si eligen Opción A:**
- Contactar a Flexxus para crear CARLOSR_DONBOSCO, CARLOSR_SOCRATES
- Implementar login directo en app móvil
- Simplificar arquitectura (sin backend)

**Si eligen Opción B:**
- Implementar backend Laravel con Sanctum
- Crear sistema de usuarios local
- Mapeo manual de usuarios a depósitos

---

## Documentación Relacionada

- **Análisis completo de autenticación:** `docs/plans/2026-03-02-auth-strategy-analysis.md`
- **Respuesta real de Flexxus:** Ver JSON arriba (línea 30-72)
- **Guía de desarrollo:** `docs/GUIA_DESARROLLO_COMPLETA.md`

---

**Preparado por:** Equipo de Desarrollo
**Fecha:** 2 de Marzo de 2026
**Estado:** Esperando decisión directiva
