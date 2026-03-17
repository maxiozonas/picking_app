import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useWarehouseFilterStore } from '@/contexts/WarehouseFilterContext'
import api from '@/lib/api'
import { buildPathWithQuery } from '@/lib/query-params'
import { PaginatedResponse, PickingOrder, OrderStatus } from '@/types/api'
import { QueryCacheTime } from '@/lib/query-config'

export interface UsePendingOrdersParams {
  search?: string
  status?: OrderStatus | 'all'
  page?: number
  perPage?: number
  dateFrom?: string
  dateTo?: string
}

/**
 * Fetches pending orders from Flexxus ERP merged with local picking progress.
 * This endpoint combines the source-of-truth (Flexxus) with local tracking,
 * ensuring both unstarted and in-progress orders are visible.
 *
 * @param params - Query parameters for filtering and pagination
 * @param params.search - Search term to filter by order number or customer name
 * @param params.status - Order status filter ('pending' | 'in_progress' | 'all')
 * @param params.page - Page number for pagination (default: 1)
 * @param params.perPage - Number of items per page (default: 15)
 * @param params.dateFrom - Start date filter (YYYY-MM-DD format)
 * @param params.dateTo - End date filter (YYYY-MM-DD format)
 *
 * @returns TanStack Query result with PaginatedResponse<PickingOrder>
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = usePendingOrders({
 *   status: 'pending',
 *   page: 1,
 *   perPage: 15
 * })
 * ```
 *
 * @remarks
 * - **Cache Time:** 30 seconds (QueryCacheTime.PendingOrders)
 * - **Placeholder Data:** Retains previous page data during pagination transitions (keepPreviousData)
 * - **Warehouse Filter:** Automatically applies selected warehouse from context
 * - **Query Key:** `['pending-orders', warehouseId, search, status, page, perPage, dateFrom, dateTo]`
 * - **Data Source:** Merges Flexxus ERP data with local picking_order_progress records
 * - **Contract:** `flexxus_created_at` stays external while `started_at`/`completed_at` remain local lifecycle timestamps
 * - **UX Feature:** Prevents layout shift during pagination transitions
 */
export function usePendingOrders(params: UsePendingOrdersParams = {}) {
  const { search, status = 'all', page = 1, perPage = 15, dateFrom, dateTo } = params
  const selectedWarehouseId = useWarehouseFilterStore((state) => state.selectedWarehouseId)

  return useQuery<PaginatedResponse<PickingOrder>>({
    queryKey: [
      'pending-orders',
      selectedWarehouseId,
      search,
      status,
      page,
      perPage,
      dateFrom,
      dateTo,
    ],
    queryFn: async () => {
      const endpoint = buildPathWithQuery('/admin/pending-orders', [
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
    staleTime: QueryCacheTime.PendingOrders,
  })
}
