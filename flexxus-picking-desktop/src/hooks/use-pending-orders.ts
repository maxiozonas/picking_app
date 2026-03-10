import { useQuery } from '@tanstack/react-query'
import { useWarehouseFilterStore } from '@/contexts/WarehouseFilterContext'
import api from '@/lib/api'
import { PaginatedResponse, PickingOrder, OrderStatus } from '@/types/api'

export interface UsePendingOrdersParams {
  search?: string
  status?: OrderStatus | 'all'
  page?: number
  perPage?: number
  dateFrom?: string
  dateTo?: string
}

/**
 * Fetches orders from /admin/pending-orders — merges Flexxus source-of-truth
 * with local picking progress, so unstarted orders are visible too.
 */
export function usePendingOrders(params: UsePendingOrdersParams = {}) {
  const { search, status = 'all', page = 1, perPage = 15, dateFrom, dateTo } = params
  const selectedWarehouseId = useWarehouseFilterStore((state) => state.selectedWarehouseId)

  return useQuery<PaginatedResponse<PickingOrder>>({
    queryKey: ['pending-orders', selectedWarehouseId, search, status, page, perPage, dateFrom, dateTo],
    queryFn: async () => {
      const queryParams = new URLSearchParams()

      if (selectedWarehouseId) {
        queryParams.append('warehouse_id', selectedWarehouseId.toString())
      }

      if (search) {
        queryParams.append('search', search)
      }

      // Always send status — default is 'all' so every order is visible
      queryParams.append('status', status)

      if (dateFrom) {
        queryParams.append('date_from', dateFrom)
      }

      if (dateTo) {
        queryParams.append('date_to', dateTo)
      }

      queryParams.append('per_page', perPage.toString())
      queryParams.append('page', page.toString())

      const response = await api.get(`/admin/pending-orders?${queryParams.toString()}`)
      return response.data
    },
    staleTime: 15000, // 15 s — pending orders change more frequently
  })
}
