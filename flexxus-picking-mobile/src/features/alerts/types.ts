import type { WarehouseSummary } from '../auth/types'

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertType = 'insufficient_stock' | 'product_missing' | 'order_issue'
export type AlertStatus = 'pending' | 'resolved'

export type PickingAlertTransport = {
  id: number
  order_number: string
  alert_type: AlertType
  message: string
  severity: AlertSeverity
  status: AlertStatus
  product_code: string | null
  created_at: string
  resolved_at: string | null
  reporter?: { id: number | null; name: string | null } | null
  warehouse?: WarehouseSummary | null
}

export type PickingAlert = {
  id: number
  orderNumber: string
  alertType: AlertType
  message: string
  severity: AlertSeverity
  status: AlertStatus
  productCode: string | null
  createdAt: string
  resolvedAt: string | null
  reporter: { id: number | null; name: string | null } | null
  warehouse: WarehouseSummary | null
}

export type CreateAlertInput = {
  alertType: AlertType
  severity: AlertSeverity
  message: string
  productCode?: string | null
}

export const alertTypeOptions: Array<{ value: AlertType; label: string; description: string }> = [
  {
    value: 'insufficient_stock',
    label: 'Stock insuficiente',
    description: 'Falta cantidad para completar el pick.',
  },
  {
    value: 'product_missing',
    label: 'Producto faltante',
    description: 'La posicion no tiene la pieza esperada.',
  },
  {
    value: 'order_issue',
    label: 'Problema general',
    description: 'La incidencia afecta al pedido completo.',
  },
]

export const alertSeverityOptions: Array<{ value: AlertSeverity; label: string; description: string }> = [
  {
    value: 'low',
    label: 'Baja',
    description: 'Se puede seguir operando mientras se revisa.',
  },
  {
    value: 'medium',
    label: 'Media',
    description: 'Necesita seguimiento pronto para evitar demoras.',
  },
  {
    value: 'high',
    label: 'Alta',
    description: 'Bloquea o complica el trabajo actual.',
  },
  {
    value: 'critical',
    label: 'Critica',
    description: 'Requiere intervencion inmediata del equipo admin.',
  },
]
