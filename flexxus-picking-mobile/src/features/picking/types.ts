import type { WarehouseSummary } from '../auth/types'
import type { PickingAlert, PickingAlertTransport } from '../alerts/types'
import type { OrderStatus, PendingOrder, PendingOrderTransport } from '../orders/types'

export type ItemStockInfo = {
  availableQuantity: number
  location: string | null
  lastUpdated: string | null
  warehouseName?: string | null
}

export type StockValidation = {
  id: number
  productCode: string
  requestedQty: number
  availableQty: number
  validated: boolean
  validatedAt: string | null
  errorCode: string | null
}

export type PickItem = {
  productCode: string
  description: string | null
  quantityRequired: number
  quantityPicked: number
  lot: string | null
  location: string | null
  status: 'pending' | 'in_progress' | 'completed'
  stockInfo: ItemStockInfo | null
}

export type PickingEvent = {
  id: number
  eventType: string
  productCode: string | null
  quantity: number | null
  message: string | null
  user: { id: number | null; name: string | null } | null
  createdAt: string
}

export type OrderDetail = {
  orderType: string
  orderNumber: string
  customerName: string | null
  warehouse: WarehouseSummary | null
  total: number | null
  status: OrderStatus
  totalItems: number
  pickedItems: number
  completedPercentage: number
  startedAt: string | null
  completedAt: string | null
  assignedTo: { id: number | null; name: string | null }
  items: PickItem[]
  alerts: PickingAlert[]
  events: PickingEvent[]
}

export type PickMutationResult = {
  productCode: string
  quantityRequired: number
  quantityPicked: number
  status: PickItem['status']
  remaining: number
  stockAfterPick?: number | null
  orderReadyToComplete?: boolean
  stockValidation?: {
    validated: boolean
    availableQty: number
    validatedAt: string
    errorCode?: string | null
  } | null
  message?: string
}

export type OrderDetailTransport = {
  order_type: string
  order_number: string
  customer_name: string | null
  warehouse: WarehouseSummary | null
  total: number | null
  status: OrderStatus
  total_items: number
  picked_items: number
  completed_percentage: number
  started_at: string | null
  completed_at: string | null
  assigned_to: { id: number | null; name: string | null } | null
  items: Array<{
    product_code: string
    product_name: string | null
    quantity_required: number
    quantity_picked: number
    lot: string | null
    location: string | null
    status: PickItem['status']
    stock_info: {
      available_quantity: number
      location: string | null
      last_updated: string | null
    } | null
  }>
  alerts: PickingAlertTransport[]
  events: Array<{
    id: number
    event_type: string
    product_code: string | null
    quantity: number | null
    message: string | null
    user: { id: number | null; name: string | null } | null
    created_at: string
  }>
}

export type ItemStockTransport = {
  item_code: string
  available_quantity: number
  location: string | null
  last_updated: string | null
  warehouse?: { id: number; code: string; name: string } | null
}

export type StockValidationTransport = {
  id: number
  item_code: string
  requested_qty: number
  available_qty: number
  validation_result: 'passed' | 'failed'
  validated_at: string | null
  error_code: string | null
}

export type StartOrCompleteOrderResponse = PendingOrderTransport
export type StartOrCompleteOrder = PendingOrder
