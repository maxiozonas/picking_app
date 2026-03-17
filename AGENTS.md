# AGENTS.md

Guia operativa corta para agentes que trabajen en `picking.app`.

## 1) Objetivo del repo

Monorepo con 3 apps:

- `flexxus-picking-backend`: API Laravel 12 (auth, picking, stock, alertas, admin).
- `flexxus-picking-desktop`: React + Vite para administracion.
- `flexxus-picking-mobile`: Expo/React Native para operarios.

Flexxus ERP sigue siendo fuente externa para pedidos/stock, pero los listados de pedidos ya no dependen de llamada remota por request.

## 2) Prioridades del agente

1. Identificar primero que app/modulo toca el cambio.
2. Preservar aislamiento por warehouse/deposito.
3. Mantener logica de negocio en services/use cases, no en controllers/components.
4. No romper contratos HTTP ni tests existentes.
5. Hacer cambios chicos, verificables y sin side effects innecesarios.

## 3) Mapa rapido

```text
docs/
flexxus-picking-backend/
  app/ config/ database/ routes/ tests/
flexxus-picking-desktop/
  src/ package.json
flexxus-picking-mobile/
  src/ package.json
```

## 4) Stack real

- Backend: PHP 8.2, Laravel 12, Sanctum, Spatie Permission, PHPUnit.
- Desktop: React 19, TypeScript, Vite, TanStack Query v5, Zustand, Vitest.
- Mobile: Expo 55, React Native 0.83, TypeScript, Zustand, React Query.

## 5) Flujo de pedidos (importante)

### Nuevo modelo (actual)

- Los listados de pedidos usan **snapshot local** y no pegan a Flexxus en cada ingreso.
- Sync automatico cada 2 minutos por job scheduler.
- Refresh manual dispara sync forzado.

### Backend involucrado

- Tablas:
  - `flexxus_order_snapshots`
  - `flexxus_sync_states`
- Servicio:
  - `app/Services/Picking/FlexxusOrderSnapshotService.php`
- Job:
  - `app/Jobs/SyncFlexxusOrderSnapshotsJob.php`
- Scheduler:
  - `routes/console.php` (`everyTwoMinutes()`).

### Endpoints clave

- Admin:
  - `GET /api/admin/pending-orders` -> lee snapshot local + merge con progreso local.
  - `POST /api/admin/pending-orders/refresh` -> fuerza sync.
- Operario:
  - `GET /api/picking/orders` -> lee snapshot local.
  - `POST /api/picking/orders/refresh` -> fuerza sync.

## 6) Arquitectura backend esperada

- Controllers: auth/request/response.
- Form Requests: validacion.
- Services + UseCases: reglas de negocio.
- Models: persistencia y relaciones.
- Resources: contrato JSON.
- Exceptions: dominio e integraciones externas.

Reglas:

- Inyectar interfaces cuando existan.
- Mantener contexto de warehouse en todas las operaciones sensibles.
- Evitar N+1 al tocar queries Eloquent.
- Evitar atrapar excepciones en controller salvo patron existente.

## 7) Areas sensibles backend

- `app/Services/Picking/*`
- `app/Http/Clients/Flexxus/*`
- `app/Http/Middleware/WarehouseOverrideMiddleware.php`
- `app/Exceptions/*`
- `tests/Feature` y `tests/Unit`

## 8) Desktop (reglas practicas)

- Hooks de datos en `src/hooks`, cache y cliente en `src/lib`.
- Mantener query keys consistentes.
- No generar placeholder fake para listas paginadas.
- Refresh manual de pedidos debe usar endpoint de refresh real antes de invalidar cache.

## 9) Mobile (reglas practicas)

- Revisar primero `src/screens` y `src/features`.
- No asumir estructura 1:1 con desktop.
- Pull-to-refresh en pedidos debe forzar sync (endpoint refresh) y luego refetch.

## 10) Comandos utiles

### Backend

```bash
cd flexxus-picking-backend
php artisan test
php artisan test --filter NombreDelTest
php artisan pint
php artisan route:list --path=api
php artisan migrate:status
php artisan pail
```

### Desktop

```bash
cd flexxus-picking-desktop
pnpm test
pnpm build
pnpm lint
pnpm format:check
```

### Mobile

```bash
cd flexxus-picking-mobile
npm test
npm start
npm run android
npm run ios
```

## 11) Testing expectations

- Cambio de dominio backend: agregar/ajustar PHPUnit tests.
- Cambio de contrato HTTP: cubrir con Feature tests.
- Cambio de hooks/UI desktop: correr Vitest.
- Cambio mobile: correr Jest del feature tocado.
- Nunca borrar tests para "hacer pasar".
- Si no pudiste correr algo, reportarlo explicitamente.

## 12) Convenciones de implementacion

- Type hints/return types cuando el archivo ya sigue ese estilo.
- Nombres descriptivos y consistentes con el dominio.
- Comentarios solo para decisiones no obvias.
- Config via `config()` o env vars; no hardcode de secretos.
- Mantener compatibilidad de contrato salvo pedido explicito.

## 13) Manejo de errores

- Dominio picking: `app/Exceptions/Picking`.
- Integracion externa: `app/Exceptions/ExternalApi`.
- Incluir contexto util de debug sin exponer credenciales.

## 14) Que evitar

- Logica de negocio en controllers/components.
- Cambios de schema sin migracion y tests.
- Querys grandes sin paginacion.
- Cambios destructivos de auth/warehouse/credenciales sin validar impacto.
- Rewrites amplios si el pedido es puntual.

## 15) Cierre de tarea

Al finalizar, informar breve:

- que se cambio,
- donde se cambio,
- que pruebas se corrieron,
- que riesgo/pendiente queda.

## 16) Mantenimiento de este archivo

- Mantenerlo operativo y corto.
- Actualizar cuando cambie arquitectura real.
- Si una seccion queda desactualizada, corregir o eliminar.
