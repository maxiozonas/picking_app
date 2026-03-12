import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { getPendingOrders } from './api'

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

export function useInfinitePendingOrders(search: string, pageSize = DEFAULT_PAGE_SIZE) {
  return useInfiniteQuery({
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
}
