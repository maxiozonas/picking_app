# Análisis de Estrategia de Autenticación - App de Picking Flexxus

**Fecha:** 2026-03-02
**Versión:** 1.0
**Autor:** OpenCode AI Agent
**Destinatario:** Dirección / Sistemas / Operaciones

---

## Resumen Ejecutivo

Este documento analiza dos estrategias de autenticación para la aplicación móvil de armado de pedidos, considerando aspectos técnicos, operativos y de negocio. **Se recomienda la Estrategia A (Login Local Independiente)** por mayor control, independencia y rapidez de implementación.

---

## Contexto del Proyecto

**Objetivo:** Aplicación móvil para operarios de depósito que permite ver pedidos, tomarlos, registrar el armado por línea y finalizarlos.

**Situación Actual:**
- Credenciales de Flexxus existentes: `CARLOSR / W250`
- La API de Flexxus **NO** tiene endpoint para marcar pedidos como "armados"
- El estado operativo debe vivir en sistema propio (Laravel)
- Se necesita trazabilidad de QUIÉN armó cada pedido

---

## Estrategia A: Login Local Independiente (RECOMENDADA ✅)

### Descripción
Cada operario tiene su propia cuenta de usuario en la base de datos de la aplicación. El backend utiliza una sola cuenta de Flexxus (compartida) para comunicarse con el ERP. La aplicación registra localmente qué usuario realizó cada acción.

### Arquitectura

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  App Móvil  │ ───> │ Backend Laravel│ ───> │   Flexxus   │
│   (Operario) │      │  (Auth Local) │      │    ERP      │
└─────────────┘      └──────────────┘      └─────────────┘
     Usuario 1           Sistema propio       CARLOSR
     Usuario 2           con trazabilidad     (compartido)
     Usuario 3           independiente
```

### Flujo de Autenticación

1. **Login del Operario:**
   - Operario ingresa username/password en la app móvil
   - Backend Laravel valida credenciales en su propia base de datos
   - Backend genera token JWT/Sanctum
   - App móvil recibe token + datos del usuario + depósito asignado

2. **Operaciones:**
   - App envía token en cada request
   - Backend valida token y identifica al usuario
   - Backend registra todas las acciones con ID de usuario
   - Backend se comunica con Flexxus usando credenciales compartidas

### Ventajas

| Aspecto | Beneficio |
|---------|-----------|
| **Independencia** | No depende de que Flexxus cree cuentas para operarios |
| **Control Total** | Trazabilidad completa en sistema propio |
| **Permisos** | Flexibilidad para definir roles y permisos locales |
| **Disponibilidad** | Si Flexxus cae, la app puede seguir operando en modo local |
| **Velocidad** | Implementación inmediata, sin gestiones administrativas |
| **Seguridad** | Credenciales de Flexxus nunca salen del servidor |
| **Auditoría** | Registro de every acción con timestamps y usuario |

### Desventajas

| Aspecto | Impacto | Mitigación |
|---------|---------|------------|
| Trazabilidad solo local | Auditoría no visible en Flexxus | Exportar reportes a CSV/Excel cuando lo soliciten |
| Usuarios duplicados | Admin debe mantener usuarios en 2 sistemas | Herramienta de sincronización futura |

### Especificaciones Técnicas

**Base de Datos Local:**
```sql
-- Tabla users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  warehouse_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Tabla pickings (registros de armado)
CREATE TABLE pickings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_type VARCHAR(10),
  order_number INT,
  warehouse_id INT,
  assigned_user_id INT,  -- ← Trazabilidad del operario
  status ENUM('PENDIENTE', 'EN_ARMADO', 'ARMADO', 'SINCRONIZADO'),
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  FOREIGN KEY (assigned_user_id) REFERENCES users(id)
);
```

**API Endpoints:**
```
POST   /api/auth/login              → Login local
GET    /api/auth/me                 → Usuario actual
GET    /api/pickings                → Pedidos por depósito del usuario
POST   /api/pickings/{id}/start     → Asignar pedido al usuario
POST   /api/pickings/{id}/complete  → Finalizar armado
GET    /api/pickings/{id}/timeline  → Auditoría de quién hizo qué
```

---

## Estrategia B: Login Directo a Flexxus

### Descripción
Cada operario se autentica directamente contra Flexxus usando su cuenta individual del ERP. La aplicación móvil obtiene un token de Flexxus y lo utiliza para todas las operaciones.

### Arquitectura

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  App Móvil  │ ───> │   Flexxus    │ ───> │ Backend App │
│   (Operario) │      │  Auth/ERP    │      │ (Opcional)  │
└─────────────┘      └──────────────┘      └─────────────┘
     Usuario 1           Cuentas de
     Usuario 2           Flexxus
     Usuario 3           (1 por operario)
```

### Flujo de Autenticación

1. **Login del Operario:**
   - Operario ingresa username/password de Flexxus
   - App llama directamente a `/auth/login` de Flexxus
   - Flexxus valida y retorna token
   - App guarda token de Flexxus localmente

2. **Operaciones:**
   - App usa token de Flexxus para llamar endpoints del ERP
   - Flexxus registra todas las acciones con el usuario que hizo la llamada

### Ventajas

| Aspecto | Beneficio |
|---------|-----------|
| **Trazabilidad Nativa** | Auditoría vive directamente en Flexxus |
| **Menos Código** | No requiere backend propio de auth |
| **Usuarios Únicos** | Mismo usuario para Flexxus y la app |
| **Sincronización** | Siempre actualizado con usuarios de Flexxus |

### Desventajas

| Aspecto | Impacto | Mitigación |
|---------|---------|------------|
| **Dependencia Crítica** | REQUIERE que Flexxus cree cuentas para todos | ❌ Bloqueante |
| **Gestión Administrativa** | Alta dependencia del depto de sistemas de Flexxus | ❌ Demoras |
| **Control Limitado** | Permisos definidos por Flexxus, no por la app | Riesgo operativo |
| **Punto Único de Fallo** | Si Flexxus cae, la app no funciona | Disponibilidad afectada |
| **Seguridad** | Tokens en dispositivos móviles | Riesgo mayor |
| **Costos** | Posibles costos de licenciass | Confirmar con proveedor |

### Requisitos Previos

**CRÍTICO - Esta estrategia NO puede implementarse hasta:**

1. ✅ Confirmar que no hay costos por licencia adicional (CONFIRMADO)
2. ❌ **PENDIENTE:** Crear cuenta de Flexxus para cada operario
3. ❌ **PENDIENTE:** Definir permisos de usuarios en Flexxus
4. ❌ **PENDIENTE:** Coordinar con departamento de sistemas de Flexxus

### Especificaciones Técnicas

**Base de Datos:**
- No requerida (o mínima para cache temporal)

**API Endpoints:**
```
POST   https://flexxus.url/auth/login           → Login a Flexxus
GET    https://flexxus.url/v2/orders            ← Pedidos desde Flexxus
GET    https://flexxus.url/v2/warehouses        ← Depósitos desde Flexxus
```

---

## Comparativa Detallada

| Aspecto | Estrategia A (Local) | Estrategia B (Flexxus) | Ganador |
|---------|---------------------|------------------------|---------|
| **Tiempo de Implementación** | 2-3 semanas | 8-12 semanas* | A |
| **Dependencia Externa** | Baja | Alta | A |
| **Trazabilidad** | Completa (local) | Completa (Flexxus) | Empate |
| **Control de Permisos** | Total | Limitado | A |
| **Disponibilidad (si Flexxus cae)** | App sigue funcionando | App se cae | A |
| **Seguridad** | Alta (credenciales en servidor) | Media (tokens en móvil) | A |
| **Mantenimiento** | Independiente | Dependiente de Flexxus | A |
| **Costos Iniciales** | Bajos | Posibles costos de licencias* | A |
| **Complejidad Técnica** | Media | Baja | B |
| **Escalabilidad** | Alta | Media | A |
| **Migración Futura** | Flexible a B | Difícil a A | A |

\*Tiempos estimados considerando gestión administrativa

---

## Análisis de Riesgos

### Estrategia A: Login Local

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Auditoría no visible en Flexxus | Media | Bajo | Exportar reportes, dashboard web |
| Usuarios desincronizados | Baja | Medio | Herramienta de sync en el futuro |
| Mantenimiento de usuarios duplicados | Alta | Bajo | Script de migración si pasan a B |

### Estrategia B: Login Directo a Flexxus

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| **Flexxus no cree cuentas** | Alta | **Crítico** | ❌ Proyecto bloqueado |
| **Demora en creación de cuentas** | Alta | Alto | ❌ Proyecto retrasado meses |
| Flexxus cae = app cae | Media | Alto | ❌ Operaciones detenidas |
| Permisos insuficientes en Flexxus | Media | Medio | Negociar con proveedor |
| Costos de licencias no previstos | Baja | Alto | Validar en contrato |

---

## Recomendación

### ✅ ESTRATEGIA A: Login Local Independiente

**Razones principales:**

1. **Independencia Operativa**
   - No dependemos de terceros para crear cuentas
   - Podemos implementar inmediatamente
   - Control total del proyecto

2. **Menor Riesgo**
   - Proyecto no se bloquea por decisiones externas
   - Disponibilidad garantizada incluso si Flexxus cae
   - Seguridad: credenciales nunca dejan el servidor

3. **Mayor Flexibilidad**
   - Podemos definir permisos y roles según necesidad operativa
   - Trazabilidad completa en sistema propio
   - Fácil migración a Estrategia B en el futuro si lo desean

4. **Costo-Beneficio**
   - Implementación en 2-3 semanas vs 8-12 semanas
   - Sin costos adicionales de licencias
   - Menor complejidad administrativa

### Plan de Implementación (Estrategia A)

**Fase 1: Semana 1-2**
- ✅ Backend Laravel con autenticación local (YA DISEÑADO)
- ✅ Sistema de usuarios y depósitos (YA DISEÑADO)
- ✅ Trazabilidad de acciones (YA DISEÑADO)

**Fase 2: Semana 3-4**
- API de pedidos y asignación
- App móvil con login y listado de pedidos
- Flujo de armado por línea

**Fase 3: Semana 5-6**
- Sincronización con Flexxus
- Dashboard web de monitoreo
- Reportes de auditoría

---

## Roadmap Futuro: Opción Híbrida

Si en el futuro desean migrar a cuentas individuales de Flexxus, podemos implementar una **Estrategia C Híbrida**:

```sql
-- Agregar campo para vincular cuenta de Flexxus
ALTER TABLE users ADD COLUMN flexxus_username VARCHAR(255);
ALTER TABLE users ADD COLUMN flexxus_password VARCHAR(255); -- encriptado
```

**Comportamiento:**
- Si el usuario tiene cuenta de Flexxus vinculada → usa esa
- Si no → usa la cuenta compartida del backend

**Beneficio:** Migración gradual sin interrumpir operaciones

---

## Conclusión

Se recomienda **Estrategia A (Login Local Independiente)** por ser la opción de menor riesgo, implementación inmediata y mayor control operativo. Esta estrategia no impide migrar a un modelo basado en cuentas de Flexxus en el futuro, sino que establece una base operativa sólida e independiente.

**Próximos Pasos:**
1. Aprobación de dirección para proceder con Estrategia A
2. Revisión del diseño técnico detallado (ver documento: `2026-03-02-auth-system-design.md`)
3. Inicio de desarrollo Fase 1 (auth + usuarios + depósitos)

---

## Anexos

- **Diseño Técnico Completo:** `docs/plans/2026-03-02-auth-system-design.md`
- **Integración con Flexxus:** `docs/plans/2026-03-02-flexxus-warehouse-integration-plan.md`
- **Brief del Proyecto:** `docs/Brief_Agente_IA_App_Picking_Flexxus.md`
