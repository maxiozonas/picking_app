import { useQuery, keepPreviousData } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { InventoryItem, PaginatedResponse } from '@/types/api'
import { QueryCacheTime } from '@/lib/query-config'

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

/**
 * Fetches paginated list of inventory items with optional warehouse filtering.
 * 
 * @param params - Query parameters for filtering and pagination
 * @param params.warehouseId - Warehouse ID to filter inventory (optional)
 * @param params.page - Page number for pagination (default: 1)
 * @param params.perPage - Number of items per page (default: 20)
 * 
 * @returns TanStack Query result with PaginatedResponse<InventoryItem>
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useInventory({
 *   warehouseId: 1,
 *   page: 1,
 *   perPage: 20
 * })
 * ```
 * 
 * @remarks
 * - **Cache Time:** 30 seconds (QueryCacheTime.Inventory)
 * - **Placeholder Data:** Retains previous page data during pagination transitions (keepPreviousData)
 * - **Query Key:** `['inventory', { warehouseId, page, perPage }]`
 * - **UX Feature:** Prevents layout shift during pagination transitions
 */
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
    placeholderData: keepPreviousData,
    staleTime: QueryCacheTime.Inventory,
  })
}

/**
 * Searches for inventory items by product code with debouncing.
 * Only executes search when product code has at least 2 characters.
 * 
 * @param params - Search parameters
 * @param params.productCode - Product code to search for (must be >= 2 chars)
 * @param params.warehouseId - Optional warehouse ID to filter results
 * @param params.enabled - Whether the search query should be enabled (default: true)
 * 
 * @returns TanStack Query result with InventoryItem[] array
 * 
 * @example
 * ```tsx
 * const { data: results, isLoading } = useStockSearch({
 *   productCode: 'PROD-001',
 *   warehouseId: 1
 * })
 * ```
 * 
 * @remarks
 * - **Cache Time:** 30 seconds (QueryCacheTime.StockSearch)
 * - **Minimum Length:** Only searches when productCode.trim().length >= 2
 * - **Query Key:** `['inventory', 'search', { productCode, warehouseId }]`
 * - **Debouncing:** Should be debounced at the component level (300ms recommended)
 * - **Conditional:** Query is disabled until product code meets minimum length
 */
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
    staleTime: QueryCacheTime.StockSearch,
  })
}
