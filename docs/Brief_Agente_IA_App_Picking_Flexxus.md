# Brief para Agente IA - App Mobile de Armado de Pedidos con Flexxus

## 1. Objetivo del proyecto
Construir una aplicacion mobile para operarios de deposito que permita:
1. Ver pedidos a armar por deposito.
2. Tomar un pedido y registrar el armado por linea.
3. Finalizar armado.
4. Informar cierre al ERP Flexxus de forma trazable.

Stack definido:
- Frontend mobile: React Native
- Backend: Laravel

## 2. Flujo de negocio conocido (actual)
Segun negocio:
1. Vendedor crea presupuesto.
2. Luego se generan otros documentos (nota de entrega, nota de pedido NP).
3. Para deposito, lo importante es la NP/pedido a preparar.
4. Operario debe ver cola de pedidos, tomar uno, armarlo y cerrarlo.

## 3. Lo que ya sabemos de la API Flexxus
Fuente usada: spec local exportado de Swagger (flexxus_swagger_spec.js).

### 3.1 Endpoints confirmados y relevantes
Autenticacion:
- POST /auth/login
- POST /auth/refresh_token
- GET /auth/me

Depositos:
- GET /warehouses

Pedidos:
- GET /orders
- GET /orders/{type}/{id}
- GET /orders/{type}/{id}/pdf (opcional)

Datos de entrega:
- GET /deliverydata/{vouchertype}/{vouchernumber} (opcional)

Comprobantes relacionados:
- GET /orderrelated/{type}/{number}

Comprobantes de venta:
- POST /sales

Despacho (util para tablero logistico, no para marcar armado):
- GET /sales/dispatch/summarised
- GET /sales/dispatch/detailed

### 3.2 Restriccion importante detectada
No existe endpoint explicito para:
- marcar pedido como armado
- actualizar cantidades preparadas en vivo

Conclusion actual:
- El seguimiento operativo de armado debe vivir en sistema propio (Laravel + DB propia).
- El cierre en ERP se debe resolver con comprobante vinculado (via POST /sales), sujeto a validacion funcional final interna.

## 4. Decision tecnica actual (con supuestos)
### 4.1 Patron de integracion recomendado
1. App registra armado en backend propio.
2. Backend guarda estado local y auditoria.
3. Al finalizar, backend crea comprobante en Flexxus con POST /sales.
4. Se vinculan lineas al comprobante origen (NP) usando campos linked_voucher_*.
5. Se verifica vinculacion con GET /orderrelated/{type}/{number}.

### 4.2 Supuesto de trabajo actual
- Para MVP se asume armado completo (no parciales).
- Tipo de comprobante de cierre probable: RE (debe confirmarlo el encargado funcional de Flexxus interno).

## 5. Arquitectura objetivo
## 5.1 Componentes
1. Mobile app (React Native)
- Login
- Lista de pedidos
- Detalle de pedido
- Flujo de armado por linea
- Cierre

2. API backend (Laravel)
- Auth interna
- Integracion Flexxus (token, refresh, llamados)
- Motor de estados de picking
- Lock de concurrencia
- Cola de sincronizacion y reintentos
- Auditoria

3. Base de datos propia
- Estado operativo no cubierto por Flexxus API

## 5.2 Motivo de backend intermedio
- Seguridad (no exponer credenciales ERP en celular)
- Control de negocio y concurrencia
- Trazabilidad y observabilidad
- Reintentos e idempotencia

## 6. Modelo de dominio propuesto (sistema propio)
Estados de picking:
- PENDIENTE
- EN_ARMADO
- ARMADO_LOCAL
- SINCRONIZADO_ERP
- ERROR_SYNC

Entidades minimas:
1. pickings
- order_type
- order_number
- warehouse_id
- status
- assigned_user_id
- started_at
- finished_at
- synced_at
- erp_voucher_type
- erp_voucher_number
- error_message

2. picking_items
- picking_id
- line_number
- product_id
- description
- qty_ordered
- qty_pending
- qty_picked
- observations

3. picking_events
- picking_id
- event_type
- payload_json
- created_by
- created_at

## 7. Contrato sugerido entre app y backend propio
- POST /api/mobile/auth/login
- GET /api/mobile/pickings?warehouse_id=...&status=...
- GET /api/mobile/pickings/{id}
- POST /api/mobile/pickings/{id}/start
- PATCH /api/mobile/pickings/{id}/items/{line}
- POST /api/mobile/pickings/{id}/complete
- POST /api/mobile/pickings/{id}/sync
- GET /api/mobile/pickings/{id}/timeline

## 8. Flujo E2E esperado
1. Operario inicia sesion.
2. App pide bandeja de pedidos por deposito.
3. Operario toma pedido (lock EN_ARMADO).
4. App actualiza qty_picked por linea.
5. Operario completa pedido (validacion: todo completo para MVP).
6. Backend marca ARMADO_LOCAL.
7. Backend sincroniza ERP (POST /sales con vinculacion a NP).
8. Backend valida vinculacion (GET /orderrelated).
9. Si OK -> SINCRONIZADO_ERP; si falla -> ERROR_SYNC + retry.

## 9. Datos de Flexxus utiles en detalle de pedido
Desde GET /orders/{type}/{id}, usar:
- Cabecera: FECHACOMPROBANTE, FECHAENTREGA, FECHATERMINADA, RAZONSOCIAL, etc.
- Detalle[]: LINEA, CODIGOPARTICULAR, DESCRIPCION, CANTIDAD, PENDIENTE, CANTIDADREMITIDA, CANTIDADPREPARADA, LOTE, OBSERVACIONES.

## 10. Lo que falta definir (bloqueantes funcionales)
1. Cual documento en Flexxus representa oficialmente "pedido armado" en esta empresa (RE u otro).
2. Payload exacto aceptado por su instalacion para cierre via POST /sales.
3. Regla oficial para parciales/faltantes/reemplazos.
4. Quien puede reabrir o corregir un pedido cerrado.
5. Criterio de exito del piloto.

## 11. Riesgos clave
1. Cierre ERP mal definido (impacto alto).
- Mitigacion: prueba temprana controlada con NP real en entorno de testing.

2. Doble sincronizacion.
- Mitigacion: idempotency key y validacion previa de vinculados.

3. Concurrencia de operarios.
- Mitigacion: lock duro por pedido con timeout y trazabilidad.

## 12. Criterios de aceptacion MVP
1. Operario puede ver solo pedidos del deposito asignado.
2. No hay doble toma del mismo pedido.
3. Se registra avance por linea y auditoria.
4. Se puede cerrar armado completo.
5. Se sincroniza a ERP y queda trazable el vinculo.
6. Los errores de sync quedan en cola de reintento.

## 13. Plan de ejecucion sugerido
Fase 1:
- Backend base + auth + listado/detalle + estados locales.

Fase 2:
- Armado por linea + lock + cierre local.

Fase 3:
- Sync ERP + verificacion + retries + monitoreo.

Fase 4:
- Mejoras operativas (scanner, dashboard despacho, parciales si aplica).

## 14. Instrucciones para el siguiente agente IA
1. Tomar este brief como fuente unica de verdad inicial.
2. No asumir endpoint de "armado" en Flexxus porque no existe en spec actual.
3. Implementar primero flujo local robusto (estado + lock + auditoria).
4. Preparar modulo de sync desacoplado con retries.
5. Dejar configurable el tipo de comprobante de cierre (ej: RE).
6. Marcar como TODO obligatorio la validacion funcional con encargado interno de Flexxus.
