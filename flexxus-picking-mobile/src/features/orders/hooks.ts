import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { getPendingOrders } from './api'
import { useWarehouseChannel } from '../../hooks/use-websocket'
import { useAuthStore } from '../../stores/auth-store'

const DEFAULT_PAGE_SIZE = 20
const DEFAULT_DEBOUNCE_MS = 350

export const pendingOrdersQueryKeys = {
  all: ['pending-orders'] as const,
  list: (search: string, pageSize = DEFAULT_PAGE_SIZE) =>
    ['pending-orders', { search, pageSize }] as const,
}

export function useDebouncedValue<T>(value: T, delay = DEFAULT_DEBOUNCE_MS) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay)

    return () => clearTimeout(timeoutId)
  }, [delay, value])

  return debouncedValue
}

/**
 * Hook for fetching infinite pending orders with WebSocket subscriptions
 *
 * Automatically subscribes to warehouse channel for real-time updates
 * when user is authenticated and has a warehouse assigned.
 */
export function useInfinitePendingOrders(search: string, pageSize = DEFAULT_PAGE_SIZE) {
  const user = useAuthStore((state) => state.user)
  const warehouseId = user?.warehouseId ?? null

  // Query for pending orders
  const query = useInfiniteQuery({
    queryKey: pendingOrdersQueryKeys.list(search, pageSize),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getPendingOrders({
        page: pageParam,
        perPage: pageSize,
        search,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.lastPage ? lastPage.meta.currentPage + 1 : undefined,
  })

  // Subscribe to warehouse channel for real-time updates
  useWarehouseChannel(warehouseId, {
    enabled: !!warehouseId && query.isSuccess,
  })

  return query
}
