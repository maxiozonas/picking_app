import { useQuery } from '@tanstack/react-query'
import { useWarehouseFilterStore } from '@/contexts/WarehouseFilterContext'
import api from '@/lib/api'
import { PaginatedResponse, PickingOrder, OrderStatus } from '@/types/api'

export interface UseOrdersParams {
  search?: string
  status?: OrderStatus
  page?: number
  perPage?: number
  dateFrom?: string
  dateTo?: string
}

/**
 * Hook to fetch orders list with filters and pagination
 * Supports warehouse filter from global context
 */
export function useOrders(params: UseOrdersParams = {}) {
  const { search, status, page = 1, perPage = 15, dateFrom, dateTo } = params
  const selectedWarehouseId = useWarehouseFilterStore((state) => state.selectedWarehouseId)

  return useQuery<PaginatedResponse<PickingOrder>>({
    queryKey: ['orders', selectedWarehouseId, search, status, page, perPage, dateFrom, dateTo],
    queryFn: async () => {
      const queryParams = new URLSearchParams()

      if (selectedWarehouseId) {
        queryParams.append('warehouse_id', selectedWarehouseId.toString())
      }

      if (search) {
        queryParams.append('search', search)
      }

      if (status) {
        queryParams.append('status', status)
      }

      if (dateFrom) {
        queryParams.append('date_from', dateFrom)
      }

      if (dateTo) {
        queryParams.append('date_to', dateTo)
      }

      queryParams.append('per_page', perPage.toString())
      queryParams.append('page', page.toString())

      const response = await api.get(`/admin/orders?${queryParams.toString()}`)
      return response.data
    },
    staleTime: 10000, // Consider data fresh for 10 seconds
  })
}

/**
 * Extended order type with items and alerts for detail view
 */
export interface OrderDetail extends PickingOrder {
  items: PickingOrderItem[]
  alerts: PickingAlert[]
}

export interface PickingOrderItem {
  id: number
  order_id: number
  product_code: string
  product_name: string
  quantity: number
  picked_quantity: number
  location?: string
  status: 'pending' | 'picked' | 'partial'
}

export interface PickingAlert {
  id: number
  order_id: number
  type: string
  message: string
  severity: string
  created_at: string
  resolved_at?: string
}

/**
 * Hook to fetch single order detail with items and alerts
 */
export function useOrderDetail(orderNumber: string) {
  return useQuery<OrderDetail>({
    queryKey: ['order', orderNumber],
    queryFn: async () => {
      const response = await api.get(`/admin/orders/${orderNumber}`)
      return response.data
    },
    enabled: !!orderNumber, // Only fetch if orderNumber is provided
    staleTime: 30000, // Consider data fresh for 30 seconds
  })
}
