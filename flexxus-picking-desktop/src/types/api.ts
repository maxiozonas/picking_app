export interface User {
  id: number
  name: string
  email: string
  username?: string
  role: string
  warehouse_id?: number
  warehouse?: Warehouse
}

export interface Warehouse {
  id: number
  name: string
  code: string
  is_active?: boolean
  is_override?: boolean
}

// Matches AdminOrderResource / PendingOrderResource: { order_number, customer, status, warehouse, ... }
export interface PickingOrder {
  id?: number
  order_number: string
  customer: string | null
  warehouse_id?: number
  warehouse?: Warehouse
  status: OrderStatus
  // Backend returns assigned_to instead of user
  assigned_to?: { id: number; name: string } | null
  items_count?: number
  items_picked?: number
  started_at?: string
  completed_at?: string
  created_at: string
}

export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'has_issues'

// Matches AdminOrderItemResource: { id, product_code, description, quantity, picked_quantity, lot, location, status }
export interface PickingOrderItem {
  id: number
  product_code: string
  description: string
  quantity: number
  picked_quantity: number
  lot?: string
  location?: string
  status: 'pending' | 'in_progress' | 'completed' | 'issue_reported'
}

// Matches PickingAlertResource: { id, order_number, alert_type, message, severity (high/medium/low), status, ... }
export interface PickingAlert {
  id: number
  order_number?: string
  alert_type: AlertType
  message: string
  severity: 'high' | 'medium' | 'low'
  status: 'pending' | 'resolved'
  product_code?: string
  created_at: string
  resolved_at?: string | null
  resolved_by?: number | null
  resolution_notes?: string | null
  user?: { id: number; name: string } | null
}

export type AlertType = 'stock_issue' | 'product_not_found' | 'quantity_mismatch' | 'over_pick_attempt' | string

// Matches AdminOrderDetailResource: extends PickingOrder + items + alerts + calculated fields
export interface PickingOrderEvent {
  id: number
  event_type: 'order_started' | 'item_picked' | 'item_completed' | 'order_completed'
  product_code?: string | null
  quantity?: number | null
  message: string
  user?: { id: number; name: string } | null
  created_at: string
}

export interface OrderDetail extends PickingOrder {
  total_items: number
  picked_items: number
  completed_percentage: number
  items: PickingOrderItem[]
  alerts: PickingAlert[]
  events: PickingOrderEvent[]
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
  links?: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

export interface LoginRequest {
  username: string
  password: string
}

// Auth API returns: { success: true, data: { token: { token: string, ... }, user: User } }
// After the axios interceptor unwraps { success, data } envelope:
export interface LoginResponseData {
  token: {
    token: string
    name: string
    abilities: string[]
    expires_at: string
  }
  user: User
}

// Kept for backwards compat in use-auth.ts
export interface LoginResponse {
  user: User
  token: string
}

// Inventory stock item
export interface InventoryItem {
  product_code: string
  description: string
  warehouse_code: string
  warehouse_name: string
  stock_total: number
  stock_real: number
  stock_pending: number
  location: string | null
  orders_using: number
}

export interface StockSearchResult {
  product_code: string
  description: string
  stock_total: number
  stock_real: number
  stock_pending: number
  location: string | null
  warehouse_code: string
  warehouse_name: string
}

// Employee (extends User with admin-manageable fields)
export interface Employee {
  id: number
  username: string
  name: string
  email: string
  role: string
  is_active: boolean
  warehouse?: Warehouse
  created_at: string
  updated_at?: string
}

export interface EmployeeFormData {
  username: string
  name: string
  email: string
  password?: string
  role: 'admin' | 'empleado'
  warehouse_id?: number | null
  is_active: boolean
}
