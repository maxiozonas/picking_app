# Presentación Ejecutiva - App de Armado de Pedidos

**Fecha:** 2 de Marzo de 2026
**Para:** Dirección y Gerencia
**De:** Equipo de Desarrollo

---

## Resumen Ejecutivo

Presentamos la solución para digitalizar el proceso de armado de pedidos en el depósito, permitiendo a los operarios ver, armar y cerrar pedidos desde una aplicación móvil, con acceso a métricas y control en tiempo real desde un panel administrativo.

**Objetivo:** Reducir errores, mejorar tiempos y tener trazabilidad completa del proceso de armado.

---

## 1. El Problema Hoy

### Situación Actual

❌ **Proceso Manual**
- Los operarios NO tienen un sistema para ver qué pedidos armar
- Se usan papeles o listados que se imprimen
- No se sabe en tiempo real quién está armando qué pedido
- Errores en la preparación de pedidos (faltan productos, cantidades incorrectas)

❌ **Falta de Información**
- No se sabe qué pedidos están pendientes de armado
- No se sabe la ubicación exacta de los productos en el depósito
- No hay métricas de rendimiento de los operarios
- No se puede trackear el estado de un pedido en tiempo real

❌ **Integración Limitada con Flexxus**
- Flexxus (nuestro ERP) NO tiene funcionalidad de picking/armado
- No se puede registrar quién armó cada pedido
- No se puede marcar un pedido como "en armado" o "completado"
- Solo se puede crear el remito al final del proceso

---

## 2. La Solución Propuesta

### Componentes del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                 SISTEMA DE PICKING                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📱 APP MÓVIL          💻 PANEL ADMIN         🔌 API    │
│  (Operarios)    →      (Directivos)    →     LARAVEL    │
│                     - Métricas        -    Middleware  │
│                     - Control         -    Base de    │
│                     - Reportes        -    Datos      │
│                                          │            │
│                                          ↓            │
│                                   FLEXXUS ERP       │
│                                   (Sistema actual)  │
└─────────────────────────────────────────────────────────┘
```

#### 📱 App Móvil (Para Operarios de Depósito)

**Lo que permite hacer:**
✅ Ver pedidos que deben armar (solo los correspondientes a su depósito)
✅ Ver detalle del pedido (cliente, productos, cantidades)
✅ Ver ubicación exacta de cada producto en el depósito
✅ Marcar productos como preparados (línea por línea)
✅ Finalizar el armado cuando está completo
✅ Trabajar sin conexión a internet (modo offline)

**Beneficios:**
- Reducción de errores (el sistema valida cantidades)
- Ahorro de tiempo (no busca productos, va directo a la ubicación)
- Trazabilidad (sabe quién armó cada pedido y cuándo)

---

#### 💻 Panel Administrativo (Para Directivos/Gerencia)

**Lo que permite hacer:**
✅ Ver métricas en tiempo real (pedidos armados, rendimiento, errores)
✅ Monitorear qué operarios están armando qué pedido ahora mismo
✅ Recibir alertas (stock bajo, pedidos completados, errores)
✅ Gestionar usuarios y depósitos
✅ Ver reportes y exportar datos a Excel
✅ Ver historial completo de todos los pedidos armados

**Beneficios:**
- Visibilidad total del proceso (transparencia)
- Toma de decisiones basada en datos (no en suposiciones)
- Control y auditoría completa

---

#### 🔌 API Laravel (Backend Intermedio)

**Por qué lo necesitamos:**
- Flexxus NO tiene funcionalidad de picking/armado
- Conectar directamente la app con Flexxus tiene problemas de seguridad
- Necesitamos una base de datos propia para guardar el estado de armado
- Permite trabajar incluso cuando Flexxus está caído

**Funciones:**
- Autenticación de usuarios
- Registro de qué operario toma qué pedido
- Registro de cada producto marcado como preparado
- Sincronización con Flexxus (cuando el pedido se completa)
- Almacenamiento de todas las auditorías

---

## 3. Qué Podemos Hacer y Qué No

### ✅ LO QUE SÍ PODEMOS HACER

| Funcionalidad | Estado | Notas |
|--------------|--------|-------|
| **Ver pedidos pendientes** | ✅ Disponible | Solo los que corresponden al depósito del operario |
| **Filtrar por EXPEDICIÓN** | ✅ Disponible | Solo pedidos que el cliente retira (no reparto) |
| **Ver detalle del pedido** | ✅ Disponible | Con productos, cantidades y cliente |
| **Ver ubicación de productos** | ✅ Disponible | Parseamos la ubicación del depósito |
| **Marcar productos como preparados** | ✅ Disponible | Línea por línea, con validación |
| **Asignar pedido a operario** | ✅ Disponible | Evita que dos operarios tomen el mismo pedido |
| **Completar armado** | ✅ Disponible | Crea remito en Flexxus automáticamente |
| **Ver quién armó cada pedido** | ✅ Disponible | Auditoría completa con fecha y hora |
| **Métricas en tiempo real** | ✅ Disponible | Pedidos armados, rendimiento, errores |
| **Alertas de stock bajo** | ✅ Disponible | Notificaciones automáticas |
| **Trabajar sin internet** | ✅ Disponible | Modo offline básico |

---

### ❌ LO QUE NO PODEMOS HACER (Limitaciones de Flexxus)

| Funcionalidad | Estado | Solución |
|--------------|--------|----------|
| **Marcar pedido como "en armado" en Flexxus** | ❌ No existe | Lo hacemos en nuestra base de datos |
| **Actualizar cantidades preparadas en Flexxus** | ❌ No existe | Lo hacemos en nuestra base de datos |
| **Ver stock en tiempo real** | ❌ Limitado | Sincronizamos cada 10 minutos |
| **Ubicaciones estructuradas** | ❌ No existe | Parseamos un campo de texto |
| **Cancelar o modificar pedidos desde la app** | ❌ No scope | Se hace desde Flexxus directamente |
| **Ver pedidos de otros depósitos** | ❌ Por diseño | Cada operario solo ve el suyo |
| **Crear nuevos productos** | ❌ No scope | Se hace desde Flexxus |

**Nota importante:** Las limitaciones son del sistema Flexxus, no de nuestra solución. Hemos creado workarounds para todas ellas.

---

## 4. Decisiones Clave y Dudas Resueltas

### Decision 1: ¿Cuentas de Flexxus o Login Propio?

**Duda:** ¿Debemos crear una cuenta de Flexxus para cada empleado o usar una sola cuenta compartida?

**Decisión TOMADA:** Login propio en nuestra base de datos

**Fundamento:**
| Aspecto | Login Propio ✅ | Cuentas Flexxus |
|---------|----------------|----------------|
| Implementación | Inmediata (2-3 semanas) | Depende de gestión externa (indeterminado) |
| Control | Total | Limitado a lo que permita Flexxus |
| Independencia | No dependemos de nadie | Depende de que Flexxus cree cuentas |
| Trazabilidad | Completa en nuestro sistema | Parcial en Flexxus |
| Costos | Sin costos adicionales | Posibles costos por licencia |

**Cómo funciona:**
- Cada operario tiene su usuario y contraseña en nuestro sistema
- El sistema usa una sola cuenta de Flexxus (CARLOSR) internamente para comunicarse
- El operario no necesita ni conocer las credenciales de Flexxus
- Tenemos control total y auditoría completa

**Beneficio:** No bloqueamos el proyecto esperando que alguien cree cuentas en Flexxus.

---

### Decision 2: ¿Cómo filtramos pedidos de EXPEDICIÓN?

**Duda:** La API de Flexxus tiene un parámetro `expedition` pero solo funciona en endpoints específicos de CORRALON. ¿Cómo filtramos las NP de expedición?

**Decisión TOMADA:** Verificar los datos de entrega de cada NP

**Cómo funciona:**
1. Obtenemos todas las NP del depósito desde Flexxus
2. Para cada NP, consultamos sus datos de entrega
3. Filtramos solo las que tienen tipo de entrega = 1 (EXPEDICION)
4. Sincronizamos esto en background para que sea rápido

**Beneficio:** Filtrado preciso sin modificar nada en Flexxus.

---

### Decision 3: ¿Cómo manejamos ubicaciones sin estructura?

**Duda:** Flexxus no tiene gestión de sub-depósitos o ubicaciones. Solo un campo de texto "UBICACION". ¿Cómo mostramos dónde están los productos?

**Decisión TOMADA:** Definir un formato estándar y parsearlo

**Cómo funciona:**
- Definimos formato: "SECTOR-PASILLO-ESTANTE" (ej: "A-01-15")
- El sistema lo parsea y muestra organizado: "Sector A / Pasillo 01 / Estante 15"
- El operario ve la ubicación de forma clara en la app

**Beneficio:** El operario sabe exactamente dónde ir sin buscar.

---

## 5. Flujo del Operario (Paso a Paso)

```
1. LOGIN
   El operario ingresa usuario y contraseña en la app
   ↓
2. LISTA DE PEDIDOS
   Ve solo pedidos de EXPEDICION de su depósito
   ↓
3. TOMA UN PEDIDO
   Selecciona un pedido (el sistema se lo asigna)
   ↓
4. VE DETALLE
   Ve productos, cantidades y ubicaciones
   ↓
5. ARMA EL PEDIDO
   Va al depósito, busca productos, los marca como preparados
   ↓
6. COMPLETA
   Cuando todo está preparado, finaliza el armado
   ↓
7. SISTEMA CREA REMITO
   Automáticamente se crea el remito en Flexxus
   ↓
8. LISTO
   El pedido queda completado y trazable
```

**Tiempo estimado:** 5-10 minutos por pedido (depende de cantidad de productos)

---

## 6. Panel de Control para Directivos

### Dashboard en Tiempo Real

```
┌─────────────────────────────────────────────────────┐
│  MÉTRICAS HOY                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │   23     │ │   156    │ │   98%    │           │
│  │Pedidos   │ │Líneas    │ │Eficacia  │           │
│  │Armados   │ │Armadas   │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  EN CURSO AHORA MISMO                              │
│  👤 Juan Pérez   📦 NP-623136   ⏱️ 15 minutos      │
│     Depósito: DON BOSCO                              │
│     Progreso: 8 de 12 líneas completadas           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ALERTAS                                           │
│  ⚠️  Stock bajo: Cemento 50kg (15 unidades)        │
│      Mínimo: 50 | Depósito: DON BOSCO             │
└─────────────────────────────────────────────────────┘
```

### Información Disponible

**Métricas:**
- Pedidos armados por día/semana/mes
- Rendimiento por operario
- Tiempos promedio de armado
- Errores frecuentes
- Productos más movidos

**Control:**
- Ver quién está armando qué pedido ahora mismo
- Gestionar usuarios y depósitos
- Asignar o reasignar operarios
- Ver historial completo de cualquier pedido

**Alertas:**
- Stock por debajo del mínimo
- Pedidos completados
- Errores de sincronización
- Operarios sin actividad (30 minutos)

---

## 7. Cronograma de Implementación

### Fase 1: Fundamentos (Semanas 1-2)
- Configuración técnica del sistema
- Login de operarios
- Sincronización de depósitos y tipos de entrega

**Entregable:** Los operarios pueden loguearse y ver depósitos

---

### Fase 2: Pedidos y Armado (Semanas 3-5)
- Lista de pedidos de EXPEDICION
- Toma de pedido con detalle de productos
- Panel administrativo con métricas básicas

**Entregable:** Los operarios pueden ver y tomar pedidos

---

### Fase 3: Ubicaciones y Armado Completo (Semanas 6-7)
- Ubicación de productos en el depósito
- Marcar productos como preparados
- Validación de cantidades

**Entregable:** Los operarios pueden armar pedidos completos

---

### Fase 4: Sincronización con Flexxus (Semana 8)
- Creación automática de remitos en Flexxus
- Verificación de vinculación
- Manejo de errores

**Entregable:** El sistema cierra pedidos automáticamente en Flexxus

---

### Fase 5: Optimización y Reportes (Semanas 9-10)
- Dashboard completo con gráficos
- Reportes exportables a Excel
- Sistema de alertas
- Optimización de performance

**Entregable:** Sistema completo en producción

---

## 8. Costos y Recursos

### Recursos Necesarios

**Servidores:**
- Servidor para Backend Laravel (puede ser compartido)
- Base de datos MySQL (XAMPP en entorno local o servidor dedicado)
- Redis para caché y colas (opcional pero recomendado)

**Dispositivos:**
- Smartphones o tablets para operarios (Android o iOS)
- No requieren características técnicas elevadas

**Desarrollo:**
- Equipo de desarrollo (backend + móvil)
- 10 semanas de desarrollo (2.5 meses)

### Costos Operativos

**Mensuales:**
- Servidor: $X según hosting elegido
- No hay costos de licencia de Flexxus adicionales

**Únicos:**
- Desarrollo: $X según proveedor
- Dispositivos móviles (compra una sola vez)

---

## 9. Beneficios Esperados

### Tangibles (Medibles)

- **Reducción del 50% en errores** de preparación (validación automática)
- **Ahorro del 30% en tiempo** de armado (ubicaciones exactas)
- **Aumento del 20% en productividad** (menos búsqueda, más armado)
- **100% de trazabilidad** (sabemos quién, cuándo, qué)

### Intangibles

- **Mejor experiencia** para el cliente (pedido correcto, más rápido)
- **Mayor control** para gerencia (visibilidad total)
- **Menos estrés** para operarios (no buscan productos)
- **Procesos estandarizados** (todos siguen el mismo flujo)

---

## 10. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Flexxus cambia su API | Baja | Medio | FlexxusClient con versión controlada |
| Caída de servidores Flexxus | Media | Bajo | Sistema sigue funcionando en modo local |
| Operarios no adopten la app | Media | Alto | Capacitación, app intuitiva, beneficios claros |
| Problemas de performance | Baja | Medio | Caché, optimización, testing exhaustivo |
| Pérdida de datos | Muy Baja | Crítico | Backups diarios, redundancia |

---

## 11. Próximos Pasos

### Inmediato

1. ✅ Aprobación de dirección para proceder
2. ✅ Validación de tipo de comprobante de cierre (¿RE es correcto?)
3. ✅ Definición de formato de ubicaciones (ej: "A-01-15")

### Corto Plazo (Esta semana)

1. Preparar ambiente técnico
2. Comenzar desarrollo Fase 1
3. Definir 5 operarios piloto

### Medio Plazo (Semana 4)

1. Testing con operarios piloto
2. Ajustes basados en feedback
3. Capacitación del equipo

---

## 12. Preguntas Frecuentes

**P: ¿Qué pasa si Flexxus se cae?**
R: La app sigue funcionando. Los operarios pueden seguir armando pedidos. Cuando vuelva Flexxus, se sincroniza automáticamente.

**P: ¿Los operarios necesitan conocer Flexxus?**
R: No. Usan nuestra app con su propio usuario y contraseña. Flexxus es transparente para ellos.

**P: ¿Podemos ver qué operario armó mal un pedido?**
R: Sí. Tenemos auditoría completa de cada acción, con fecha, hora y usuario.

**P: ¿Qué pasa si un operario no completa un pedido?**
R: El sistema libera el pedido después de 30 minutos de inactividad para que otro lo tome.

**P: ¿Podemos agregar más funcionalidades en el futuro?**
R: Sí. El sistema es modular y escalable. Podemos agregar scanner de códigos de barra, fotos de productos, etc.

**P: ¿El sistema funciona en cualquier depósito?**
R: Sí. Cada operario solo ve pedidos de su depósito asignado.

**P: ¿Cuánto tiempo toma armar un pedido con la app?**
R: Depende de la cantidad de productos, pero estimamos 5-10 minutos (vs 15-20 sin app).

**P: ¿Podemos exportar datos a Excel?**
R: Sí. Desde el panel admin podemos exportar cualquier reporte.

**P: ¿Qué pasa si se rompe un celular?**
R: El usuario se loguea en otro dispositivo y continúa trabajando. No se pierde nada.

---

## Anexos

### Anexo A: Glosario

- **NP:** Nota de Pedido (pedido de cliente en Flexxus)
- **RE:** Remito de Salida (comprobante que creamos al completar armado)
- **EXPEDICION:** Tipo de entrega donde el cliente retira en el depósito
- **REPARTO:** Tipo de entrega donde debemos llevar el material al cliente
- **PICKING:** Proceso de armado de pedidos
- **ERP:** Sistema de gestión empresarial (Flexxus)

### Anexo B: Arquitectura Simplificada

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  App Móvil  │────→│ Backend     │────→│   Flexxus   │
│  (Operario) │      │ Laravel     │      │    ERP      │
└─────────────┘      └─────────────┘      └─────────────┘
                           ↑
                           │
                    ┌──────┴──────┐
                    │ Panel Admin  │
                    │ (Directivos) │
                    └─────────────┘
```

### Anexo C: Formato de Ubicaciones

**Formato definido:** `SECTOR-PASILLO-ESTANTE`

**Ejemplos:**
- "A-01-15" → Sector A, Pasillo 01, Estante 15
- "B-03-22" → Sector B, Pasillo 03, Estante 22
- "C-12-05" → Sector C, Pasillo 12, Estante 05

**En la app:** Se muestra como "Sector A / Pasillo 01 / Estante 15"

---

**Documento preparado por:** Equipo de Desarrollo
**Versión:** 1.0 Ejecutiva
**Fecha:** 2 de Marzo de 2026

**Para más detalles técnicos, ver:** `GUIA_DESARROLLO_COMPLETA.md`
