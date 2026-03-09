// API Types - will be implemented in Phase 3
export interface User {
  id: number
  name: string
  email: string
  role: string
}

export interface Warehouse {
  id: number
  name: string
  code: string
}

export interface PickingOrder {
  id: number
  order_number: string
  customer: string
  warehouse_id: number
  warehouse?: Warehouse
  status: OrderStatus
  user_id?: number
  user?: User
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface PickingOrderItem {
  id: number
  order_id: number
  product_code: string
  product_name: string
  quantity_required: number
  quantity_picked: number
  quantity_requested?: number
  location?: string
  status: 'pending' | 'in_progress' | 'completed'
}

export interface PickingAlert {
  id: number
  order_id: number
  type: AlertType
  message: string
  severity: AlertSeverity
  created_at: string
  resolved_at?: string
}

export type AlertType = 'stock_issue' | 'product_not_found' | 'quantity_mismatch' | 'over_pick_attempt' | string
export type AlertSeverity = 'warning' | 'error' | 'info'

export interface OrderDetail extends PickingOrder {
  customer_name?: string
  total_items: number
  picked_items: number
  completed_percentage: number
  items: PickingOrderItem[]
  alerts: PickingAlert[]
}

export interface DashboardStats {
  total_orders: number
  in_progress_count: number
  completed_count: number
  by_warehouse: WarehouseStats[]
}

export interface WarehouseStats {
  warehouse_id: number | null
  warehouse_code: string | null
  warehouse_name: string | null
  total_orders: number
  in_progress_count: number
  completed_count: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}
