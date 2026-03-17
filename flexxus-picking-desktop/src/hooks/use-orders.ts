import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useWarehouseFilterStore } from '@/contexts/WarehouseFilterContext'
import api from '@/lib/api'
import { buildPathWithQuery } from '@/lib/query-params'
import { PaginatedResponse, PickingOrder, OrderStatus, OrderDetail } from '@/types/api'
import { QueryCacheTime } from '@/lib/query-config'

export interface UseOrdersParams {
  search?: string
  status?: OrderStatus
  page?: number
  perPage?: number
  dateFrom?: string
  dateTo?: string
}

/**
 * Fetches paginated list of orders with filters and search capabilities.
 * 
 * @param params - Query parameters for filtering and pagination
 * @param params.search - Search term to filter by order number or customer name
 * @param params.status - Order status filter ('pending' | 'in_progress' | 'completed')
 * @param params.page - Page number for pagination (default: 1)
 * @param params.perPage - Number of items per page (default: 15)
 * @param params.dateFrom - Start date filter (YYYY-MM-DD format)
 * @param params.dateTo - End date filter (YYYY-MM-DD format)
 * 
 * @returns TanStack Query result with PaginatedResponse<PickingOrder>
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useOrders({
 *   status: 'pending',
 *   page: 1,
 *   perPage: 15
 * })
 * ```
 * 
 * @remarks
 * - **Cache Time:** 45 seconds (QueryCacheTime.Orders)
 * - **Placeholder Data:** Retains previous page data during pagination transitions (keepPreviousData)
 * - **Warehouse Filter:** Automatically applies selected warehouse from context
 * - **Query Key:** `['orders', warehouseId, search, status, page, perPage, dateFrom, dateTo]`
 * - **UX Feature:** Prevents layout shift during pagination transitions
 */
export function useOrders(params: UseOrdersParams = {}) {
  const { search, status, page = 1, perPage = 15, dateFrom, dateTo } = params
  const selectedWarehouseId = useWarehouseFilterStore((state) => state.selectedWarehouseId)

  return useQuery<PaginatedResponse<PickingOrder>>({
    queryKey: ['orders', selectedWarehouseId, search, status, page, perPage, dateFrom, dateTo],
    queryFn: async () => {
      const endpoint = buildPathWithQuery('/admin/orders', [
        ['warehouse_id', selectedWarehouseId],
        ['search', search],
        ['status', status],
        ['date_from', dateFrom],
        ['date_to', dateTo],
        ['per_page', perPage],
        ['page', page],
      ])

      const response = await api.get(endpoint)
      return response.data
    },
    placeholderData: keepPreviousData,
    staleTime: QueryCacheTime.Orders,
  })
}

// Re-export for convenience
export type { OrderDetail } from '@/types/api'

/**
 * Fetches detailed information for a single order including items and alerts.
 * 
 * @param orderNumber - The order number to fetch (e.g., "EXP-2026-001")
 * 
 * @returns TanStack Query result with OrderDetail data
 * 
 * @example
 * ```tsx
 * const { data: order, isLoading, error } = useOrderDetail('EXP-2026-001')
 * ```
 * 
 * @remarks
 * - **Cache Time:** 60 seconds (QueryCacheTime.OrderDetail)
 * - **Conditional Fetch:** Only fetches when orderNumber is provided (enabled: !!orderNumber)
 * - **Query Key:** `['order', orderNumber]`
 * - **Includes:** Order items with pick status, alerts with severity, employee assignment info
 */
export function useOrderDetail(orderNumber: string) {
  return useQuery<OrderDetail>({
    queryKey: ['order', orderNumber],
    queryFn: async () => {
      const response = await api.get(`/admin/orders/${orderNumber}`)
      return response.data
    },
    enabled: !!orderNumber,
    staleTime: QueryCacheTime.OrderDetail,
  })
}
