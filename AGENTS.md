# AGENTS.md

Guia operativa para agentes que trabajen en `picking.app`.

## 1. Objetivo del repositorio

Este repo es un monorepo con tres aplicaciones:

- `flexxus-picking-backend`: API Laravel 12 para autenticacion, picking, stock, alertas y administracion.
- `flexxus-picking-desktop`: app React + Vite para administracion.
- `flexxus-picking-mobile`: app Expo/React Native para operarios.

El backend es la fuente principal de reglas de negocio. Flexxus ERP es la fuente externa de verdad para pedidos y stock remoto; la base local persiste progreso, alertas, credenciales por deposito y contexto operativo.

## 2. Prioridades del agente

1. Entender primero que aplicacion toca el cambio.
2. Preservar aislamiento por warehouse/deposito.
3. Mantener la logica de negocio en services, no en controllers.
4. No degradar tests ni contratos de API.
5. Hacer cambios pequenos, coherentes y verificables.

## 3. Mapa rapido del repo

```text
docs/
flexxus-picking-backend/
  app/
  config/
  database/
  routes/
  tests/
flexxus-picking-desktop/
  src/
  package.json
flexxus-picking-mobile/
  App.tsx
  package.json
```

## 4. Stack real

- Backend: PHP 8.2, Laravel 12, Sanctum, Spatie Permission, PHPUnit.
- Desktop: React 19, TypeScript, Vite, TanStack Query v5, Zustand, Vitest.
- Mobile: Expo 55, React Native 0.83, TypeScript, Zustand.

## 5. Principios de trabajo

- Leer primero el codigo relevante antes de proponer cambios.
- Usar la implementacion existente como referencia de estilo.
- Favorecer interfaces e inyeccion de dependencias en Laravel.
- Mantener respuestas HTTP via Resources y Requests cuando el flujo ya usa ese patron.
- Evitar cambios transversales sin pruebas que los respalden.
- No meter ejemplos extensos ni tutoriales dentro de este archivo.

## 6. Backend: arquitectura esperada

- Controllers: coordinan request, auth y response.
- Form Requests: validan entrada.
- Services: concentran reglas de negocio.
- Models: relaciones, casts, scopes y persistencia.
- Resources: definen el contrato JSON.
- Exceptions: expresar errores de dominio y de integracion externa.

### Reglas importantes

- Inyectar interfaces cuando ya existan en `App\Services\...\Interfaces`.
- No lanzar `\Exception` para errores de dominio si ya existe una excepcion especifica.
- Mantener contexto de warehouse en operaciones de picking y admin.
- Respetar fallback de credenciales Flexxus solo cuando el codigo actual lo contemple.
- Si tocas queries Eloquent, revisar eager loading y N+1.

## 7. Backend: areas sensibles

- `app/Services/Picking/*`: flujo principal de picking, stock y alertas.
- `app/Services/Admin/*`: operaciones administrativas.
- `app/Http/Clients/Flexxus/*`: integracion externa.
- `app/Http/Middleware/WarehouseOverrideMiddleware.php`: contexto de warehouse.
- `app/Exceptions/*`: contrato de errores.
- `tests/Feature` y `tests/Unit`: la cobertura existente documenta comportamiento esperado.

## 8. Frontend desktop: arquitectura esperada

- Paginas en `src/pages`.
- UI reusable en `src/components`.
- Hooks de datos en `src/hooks`.
- Cliente API y config de cache en `src/lib`.
- Estado cliente acotado en `src/stores`.

### Reglas importantes

- Mantener query keys consistentes con los hooks existentes.
- No fabricar placeholder data falsa para listas paginadas.
- Invalidar cache despues de mutaciones relevantes.
- Preservar tests de componentes, hooks y flujos con MSW/Vitest.
- Seguir patrones ya presentes antes de introducir otra libreria o abstraccion.

## 9. Mobile

La app mobile hoy es mas pequena que desktop/backend. Antes de introducir estructura nueva, revisar primero `App.tsx`, dependencias instaladas y el flujo actual. No asumir que comparte arquitectura 1:1 con desktop.

## 10. Comandos utiles

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
npm start
npm run android
npm run ios
```

## 11. Flujo recomendado para cambios

1. Identificar modulo y archivos afectados.
2. Leer tests y codigo relacionado.
3. Cambiar lo minimo necesario.
4. Ejecutar pruebas focalizadas.
5. Ejecutar formateo/lint del modulo tocado.
6. Resumir impacto, riesgos y validacion ejecutada.

## 12. Testing expectations

- Si cambias dominio backend, agregar o ajustar tests en PHPUnit.
- Si cambias contrato HTTP, cubrir con Feature tests o Resources tests indirectos.
- Si cambias hooks o UI desktop, correr Vitest y actualizar mocks si hace falta.
- No eliminar tests para "hacer pasar" el cambio.
- Si no pudiste correr pruebas, explicitarlo al final.

## 13. Convenciones de implementacion

- Type hints y return types siempre que el archivo siga ese estilo.
- Nombres descriptivos y consistentes con el dominio.
- Comentarios solo si aclaran una decision no obvia.
- Configuracion en `config()` o variables de entorno; no hardcodear secretos.
- Mantener compatibilidad con el contrato actual salvo pedido explicito.

## 14. Manejo de errores

- Preferir excepciones de dominio en `app/Exceptions/Picking`.
- Para Flexxus, usar excepciones de `app/Exceptions/ExternalApi`.
- No capturar excepciones en controllers salvo que el flujo existente lo requiera.
- Incluir contexto util para depuracion sin exponer secretos.

## 15. Que evitar

- Logica de negocio en controllers o components pesados.
- Responder modelos Eloquent crudos si ya hay Resource.
- Cambios de schema sin migracion y test asociados.
- Querys sin paginacion en listados grandes.
- Cambios destructivos sobre credenciales, warehouse context o auth sin validar impacto.
- Reescrituras amplias si el pedido es puntual.

## 16. Fuentes de verdad dentro del repo

- `flexxus-picking-backend/tests`: comportamiento esperado.
- `flexxus-picking-backend/routes/api.php`: superficie API.
- `flexxus-picking-backend/app/Services`: reglas de negocio.
- `flexxus-picking-desktop/src/hooks` y `src/lib/query-config.ts`: contratos de datos en frontend.
- `docs/`: decisiones y flujos operativos relevantes.

## 17. Criterio para respuestas del agente

Al cerrar una tarea, informar de forma breve:

- que se cambio,
- donde se cambio,
- que pruebas se corrieron,
- que riesgo o pendiente queda, si existe.

## 18. Mantenimiento de este archivo

Este archivo debe mantenerse corto, operativo y especifico del repo.

- Preferir reglas y decisiones, no ejemplos largos.
- Actualizarlo cuando cambie la arquitectura real.
- Si una seccion deja de reflejar el codigo actual, corregirla o eliminarla.
