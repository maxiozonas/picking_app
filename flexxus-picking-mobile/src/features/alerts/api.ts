import { apiClient } from '../../lib/api/client'
import type { CreateAlertInput, PickingAlert, PickingAlertTransport } from './types'

export function mapPickingAlert(alert: PickingAlertTransport): PickingAlert {
  return {
    id: alert.id,
    orderNumber: alert.order_number,
    alertType: alert.alert_type,
    message: alert.message,
    severity: alert.severity,
    status: alert.status,
    productCode: alert.product_code,
    createdAt: alert.created_at,
    resolvedAt: alert.resolved_at,
    reporter: alert.reporter ?? null,
    warehouse: alert.warehouse ?? null,
  }
}

export async function createOrderAlert(orderNumber: string, input: CreateAlertInput): Promise<PickingAlert> {
  const response = await apiClient.post<PickingAlertTransport>(`/picking/orders/${orderNumber}/alerts`, {
    alert_type: input.alertType,
    severity: input.severity,
    message: input.message,
    product_code: input.productCode || undefined,
  })

  return mapPickingAlert(response.data)
}
