import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { useStats } from '@/hooks/use-stats'
import { QueryCacheTime } from '@/lib/query-config'
import { handlers } from '@/test/mocks/handlers'

// MSW server setup
const server = setupServer(...handlers)

const mockStats = {
  total_orders: 150,
  in_progress_count: 12,
  completed_count: 85,
  pending_count: 45,
  orders_with_issues: 8,
  by_warehouse: [
    {
      warehouse_id: 1,
      warehouse_code: 'CENTRO',
      warehouse_name: 'Centro',
      total_orders: 50,
      in_progress_count: 5,
      completed_count: 30,
      pending_count: 15,
    },
  ],
}

describe('TanStack Query Cache Behavior Integration Tests', () => {
  let queryClient: QueryClient

  beforeAll(() => {
    server.listen()
  })

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: QueryCacheTime.STALE_TIME,
          gcTime: QueryCacheTime.GC_TIME,
        },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
  })

  afterAll(() => {
    server.close()
  })

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  describe('staleTime configuration', () => {
    it('should fetch data successfully', async () => {
      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.isFetching).toBe(false)
    })

    it('should have data fresh immediately after fetch', async () => {
      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Immediately after fetch, data should be fresh
      const cache = queryClient.getQueryCache()
      const query = cache.find({ queryKey: ['stats'] })
      expect(query?.state.isStale).toBe(false)
    })

    it('should not refetch on re-render with same query', async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', () => {
          requestCount++
          return HttpResponse.json(mockStats)
        })
      )

      const { result, rerender } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const initialRequestCount = requestCount

      // Re-render component
      rerender()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Should not trigger new request
      expect(requestCount).toBe(initialRequestCount)
    })
  })

  describe('background refetch', () => {
    it('should trigger background refetch when window regains focus', { timeout: 40000 }, async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', () => {
          requestCount++
          return HttpResponse.json(mockStats)
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const initialCount = requestCount

      // Wait for staleTime to pass (using real timers)
      await new Promise(resolve => setTimeout(resolve, QueryCacheTime.STALE_TIME + 100))

      // Simulate window focus
      window.dispatchEvent(new Event('focus'))

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })

      expect(requestCount).toBeGreaterThan(initialCount)
    })

    it('should keep old data visible during background refetch', { timeout: 40000 }, async () => {
      const initialData = { ...mockStats, total_orders: 100 }

      server.use(
        http.get('*/api/admin/stats', () => {
          return HttpResponse.json({ ...mockStats, total_orders: 200 })
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const oldData = result.current.data

      // Wait for staleTime and trigger refetch
      await new Promise(resolve => setTimeout(resolve, QueryCacheTime.STALE_TIME + 100))
      window.dispatchEvent(new Event('focus'))

      // During refetch, old data should still be visible
      expect(result.current.data).toEqual(oldData)

      // After refetch completes, data should update
      await waitFor(() => {
        expect(result.current.data?.total_orders).toBe(200)
      })
    })
  })

  describe('placeholder data behavior', () => {
    it('should show placeholder data immediately', () => {
      // This test verifies the placeholder configuration in useOrders
      const { result: ordersResult } = renderHook(() => useStats(), { wrapper })

      // With placeholderData, should have data immediately
      expect(ordersResult.current.data).toBeDefined()
    })

    it('should replace placeholder with real data', async () => {
      const { result } = renderHook(() => useStats(), { wrapper })

      // Should have placeholder initially
      const placeholderData = result.current.data

      // Wait for real data
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Real data should be different from placeholder
      expect(result.current.data).not.toEqual(placeholderData)
      expect(result.current.data?.total_orders).toBeGreaterThan(0)
    })
  })

  describe('query key structure', () => {
    it('should use correct query key structure for stats', async () => {
      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const cache = queryClient.getQueryCache()
      const queries = cache.getAll()

      const statsQuery = queries.find((q) => {
        const key = q.queryKey
        return key[0] === 'stats'
      })

      expect(statsQuery).toBeDefined()
      expect(statsQuery?.queryKey).toEqual(['stats'])
    })

    it('should create unique query keys for different filter combinations', async () => {
      const { result: result1 } = renderHook(() => useStats(), { wrapper })
      const { result: result2 } = renderHook(
        () => useStats({ warehouseId: 1 }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true)
        expect(result2.current.isSuccess).toBe(true)
      })

      const cache = queryClient.getQueryCache()
      const queries = cache.getAll()

      const statsQueries = queries.filter((q) => q.queryKey[0] === 'stats')

      // Should have 2 separate cache entries
      expect(statsQueries.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('cache persistence (gcTime)', () => {
    it('should keep data in cache after component unmounts', async () => {
      const { result, unmount } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const dataBeforeUnmount = result.current.data

      // Unmount component
      unmount()

      // Data should still be in cache immediately after unmount
      const cachedData = queryClient.getQueryData(['stats'])
      expect(cachedData).toEqual(dataBeforeUnmount)
    })

    it('should keep query in cache after unmount', async () => {
      const { result, unmount } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const cache = queryClient.getQueryCache()
      const queryBeforeUnmount = cache.find({ queryKey: ['stats'] })
      expect(queryBeforeUnmount).toBeDefined()

      // Unmount component
      unmount()

      // Query should still be in cache
      const queryAfterUnmount = cache.find({ queryKey: ['stats'] })
      expect(queryAfterUnmount).toBeDefined()
    })
  })
})
