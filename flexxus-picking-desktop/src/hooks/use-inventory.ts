import { useQuery } from '@tanstack/react-query'
import  apiClient  from '@/lib/api'
import type { InventoryItem, PaginatedResponse } from '@/types/api'

interface UseInventoryParams {
  warehouseId?: number
  page?: number
  perPage?: number
}

interface UseStockSearchParams {
  productCode: string
  warehouseId?: number
  enabled?: boolean
}

export function useInventory({ warehouseId, page = 1, perPage = 20 }: UseInventoryParams = {}) {
  return useQuery({
    queryKey: ['inventory', { warehouseId, page, perPage }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (warehouseId) params.set('warehouse_id', String(warehouseId))
      params.set('page', String(page))
      params.set('per_page', String(perPage))

      const response = await apiClient.get<PaginatedResponse<InventoryItem>>(
        `/admin/inventory?${params.toString()}`
      )
      return response.data
    },
    staleTime: 1000 * 30, // 30 seconds - stock changes frequently
  })
}

export function useStockSearch({ productCode, warehouseId, enabled = true }: UseStockSearchParams) {
  return useQuery({
    queryKey: ['inventory', 'search', { productCode, warehouseId }],
    queryFn: async () => {
      const params = new URLSearchParams({ product_code: productCode })
      if (warehouseId) params.set('warehouse_id', String(warehouseId))

      const response = await apiClient.get<InventoryItem[]>(
        `/admin/inventory/search?${params.toString()}`
      )
      return response.data
    },
    enabled: enabled && productCode.trim().length >= 2,
    staleTime: 1000 * 30,
  })
}
