import { useQuery } from '@tanstack/react-query'
import { useWarehouseFilterStore } from '@/contexts/WarehouseFilterContext'
import api from '@/lib/api'
import { buildPathWithQuery } from '@/lib/query-params'
import { DashboardStats } from '@/types/api'
import { QueryCacheTime } from '@/lib/query-config'

/**
 * Fetches dashboard statistics with optional warehouse and date filters.
 * 
 * @param dateFrom - Optional start date for filtering stats (YYYY-MM-DD format)
 * @param dateTo - Optional end date for filtering stats (YYYY-MM-DD format)
 * 
 * @returns TanStack Query result with DashboardStats data
 * 
 * @example
 * ```tsx
 * const { data: stats, isLoading, error } = useStats('2026-01-01', '2026-01-31')
 * ```
 * 
 * @remarks
 * - **Cache Time:** 30 seconds (QueryCacheTime.Stats)
 * - **No Polling:** Does not auto-refetch - user must trigger refresh manually
 * - **Warehouse Filter:** Automatically applies selected warehouse from context
 * - **Query Key:** `['stats', warehouseId, dateFrom, dateTo]`
 */
export function useStats(dateFrom?: string, dateTo?: string) {
  const selectedWarehouseId = useWarehouseFilterStore((state) => state.selectedWarehouseId)

  return useQuery<DashboardStats>({
    queryKey: ['stats', selectedWarehouseId, dateFrom, dateTo],
    queryFn: async () => {
      const endpoint = buildPathWithQuery('/admin/stats', [
        ['warehouse_id', selectedWarehouseId],
        ['date_from', dateFrom],
        ['date_to', dateTo],
      ])

      const response = await api.get(endpoint)
      return response.data
    },
    staleTime: QueryCacheTime.Stats,
  })
}
