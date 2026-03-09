import { useQuery } from '@tanstack/react-query'
import { useWarehouseFilterStore } from '@/contexts/WarehouseFilterContext'
import api from '@/lib/api'
import { DashboardStats } from '@/types/api'

/**
 * Hook to fetch dashboard statistics with optional warehouse and date filters
 * Auto-refetches every 30 seconds for real-time updates
 */
export function useStats(dateFrom?: string, dateTo?: string) {
  const selectedWarehouseId = useWarehouseFilterStore((state) => state.selectedWarehouseId)

  return useQuery<DashboardStats>({
    queryKey: ['stats', selectedWarehouseId, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (selectedWarehouseId) {
        params.append('warehouse_id', selectedWarehouseId.toString())
      }

      if (dateFrom) {
        params.append('date_from', dateFrom)
      }

      if (dateTo) {
        params.append('date_to', dateTo)
      }

      const response = await api.get(`/admin/stats?${params.toString()}`)
      return response.data
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
  })
}
