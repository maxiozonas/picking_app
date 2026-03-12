import { apiClient } from '../../lib/api/client'
import { mapPickingAlert } from '../alerts/api'
import { mapPendingOrder } from '../orders/api'
import type {
  ItemStockInfo,
  ItemStockTransport,
  OrderDetail,
  OrderDetailTransport,
  PickItem,
  PickMutationResult,
  PickingEvent,
  StartOrCompleteOrder,
  StartOrCompleteOrderResponse,
  StockValidation,
  StockValidationTransport,
} from './types'

function mapItemStockInfo(stockInfo: OrderDetailTransport['items'][number]['stock_info']): ItemStockInfo | null {
  if (!stockInfo) {
    return null
  }

  return {
    availableQuantity: stockInfo.available_quantity,
    location: stockInfo.location,
    lastUpdated: stockInfo.last_updated,
  }
}

function mapPickItem(item: OrderDetailTransport['items'][number]): PickItem {
  return {
    productCode: item.product_code,
    description: item.product_name,
    quantityRequired: item.quantity_required,
    quantityPicked: item.quantity_picked,
    lot: item.lot,
    location: item.location,
    status: item.status,
    stockInfo: mapItemStockInfo(item.stock_info),
  }
}

function mapEvent(event: OrderDetailTransport['events'][number]): PickingEvent {
  return {
    id: event.id,
    eventType: event.event_type,
    productCode: event.product_code,
    quantity: event.quantity,
    message: event.message,
    user: event.user,
    createdAt: event.created_at,
  }
}

export function mapOrderDetail(detail: OrderDetailTransport): OrderDetail {
  return {
    orderType: detail.order_type,
    orderNumber: detail.order_number,
    customerName: detail.customer_name,
    warehouse: detail.warehouse,
    total: detail.total,
    status: detail.status,
    totalItems: detail.total_items,
    pickedItems: detail.picked_items,
    completedPercentage: detail.completed_percentage,
    startedAt: detail.started_at,
    completedAt: detail.completed_at,
    assignedTo: {
      id: detail.assigned_to?.id ?? null,
      name: detail.assigned_to?.name ?? null,
    },
    items: detail.items.map(mapPickItem),
    alerts: detail.alerts.map(mapPickingAlert),
    events: detail.events.map(mapEvent),
  }
}

function mapItemStock(stock: ItemStockTransport): ItemStockInfo {
  return {
    availableQuantity: stock.available_quantity,
    location: stock.location,
    lastUpdated: stock.last_updated,
    warehouseName: stock.warehouse?.name ?? null,
  }
}

function mapStockValidation(validation: StockValidationTransport): StockValidation {
  return {
    id: validation.id,
    productCode: validation.item_code,
    requestedQty: validation.requested_qty,
    availableQty: validation.available_qty,
    validated: validation.validation_result === 'passed',
    validatedAt: validation.validated_at,
    errorCode: validation.error_code,
  }
}

export async function getOrderDetail(orderNumber: string): Promise<OrderDetail> {
  const response = await apiClient.get<OrderDetailTransport>(`/picking/orders/${orderNumber}`)

  return mapOrderDetail(response.data)
}

export async function startOrder(orderNumber: string): Promise<StartOrCompleteOrder> {
  const response = await apiClient.post<StartOrCompleteOrderResponse>(`/picking/orders/${orderNumber}/start`)

  return mapPendingOrder(response.data)
}

export async function pickOrderItem(orderNumber: string, productCode: string, quantity: number): Promise<PickMutationResult> {
  const response = await apiClient.post<{
    product_code: string
    quantity_required: number
    quantity_picked: number
    status: PickItem['status']
    remaining: number
    stock_after_pick?: number | null
    order_ready_to_complete?: boolean
    stock_validation?: {
      validated: boolean
      available_qty: number
      validated_at: string
      error_code?: string | null
    } | null
    message?: string
  }>(`/picking/orders/${orderNumber}/items/${productCode}/pick`, {
    quantity,
  })

  return {
    productCode: response.data.product_code,
    quantityRequired: response.data.quantity_required,
    quantityPicked: response.data.quantity_picked,
    status: response.data.status,
    remaining: response.data.remaining,
    stockAfterPick: response.data.stock_after_pick,
    orderReadyToComplete: response.data.order_ready_to_complete,
    stockValidation: response.data.stock_validation
      ? {
          validated: response.data.stock_validation.validated,
          availableQty: response.data.stock_validation.available_qty,
          validatedAt: response.data.stock_validation.validated_at,
          errorCode: response.data.stock_validation.error_code,
        }
      : null,
    message: response.data.message,
  }
}

export async function completeOrder(orderNumber: string): Promise<StartOrCompleteOrder> {
  const response = await apiClient.post<StartOrCompleteOrderResponse>(`/picking/orders/${orderNumber}/complete`)

  return mapPendingOrder(response.data)
}

export async function getItemStock(orderNumber: string, productCode: string): Promise<ItemStockInfo> {
  const response = await apiClient.get<ItemStockTransport>(`/picking/orders/${orderNumber}/stock/${productCode}`)

  return mapItemStock(response.data)
}

export async function getOrderStockValidations(orderNumber: string): Promise<StockValidation[]> {
  const response = await apiClient.get<{ data: StockValidationTransport[] }>(`/picking/orders/${orderNumber}/stock-validations`)

  return response.data.data.map(mapStockValidation)
}
