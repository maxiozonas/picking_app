export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'has_issues'

export type OrderWarehouseSummary = {
  id: number | null
  code: string | null
  name: string | null
}

export type PendingOrder = {
  orderType: string
  orderNumber: string
  customer: string | null
  status: OrderStatus
  assignedTo: { id: number | null; name: string | null }
  itemsCount: number
  itemsPicked: number
  createdAt: string | null
  startedAt: string | null
  warehouse: OrderWarehouseSummary | null
  total: number | null
  deliveryType: string | null
}

export type PendingOrderTransport = {
  order_type: string
  order_number: string
  customer: string | null
  status: OrderStatus
  assigned_to: { id: number | null; name: string | null } | null
  items_count: number
  items_picked: number
  created_at: string | null
  started_at: string | null
  warehouse: {
    id: number | null
    code: string | null
    name: string | null
  } | null
  total: number | null
  delivery_type: string | null
}

export type OrdersPagination = {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}

export type PendingOrdersResponse = {
  data: PendingOrder[]
  meta: OrdersPagination
}

export type PendingOrdersTransport = {
  data: PendingOrderTransport[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export type PendingOrdersQueryParams = {
  page: number
  perPage: number
  search?: string
}
