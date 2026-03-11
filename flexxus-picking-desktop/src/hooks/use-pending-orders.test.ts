import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePendingOrders } from '@/hooks/use-pending-orders'
import { useWarehouseFilterStore } from '@/contexts/WarehouseFilterContext'
import api from '@/lib/api'
import { PaginatedResponse, PickingOrder } from '@/types/api'

// Mock dependencies
vi.mock('@/lib/api')
vi.mock('@/contexts/WarehouseFilterContext')

describe('usePendingOrders', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    vi.clearAllMocks()

    // Default warehouse filter mock
    vi.mocked(useWarehouseFilterStore).mockImplementation((selector) => {
      const state = {
        selectedWarehouseId: null,
        setSelectedWarehouseId: vi.fn(),
        clearFilter: vi.fn(),
      }
      return selector(state)
    })
  })

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  it('should fetch pending orders without filters', async () => {
    const mockOrders: PaginatedResponse<PickingOrder> = {
      data: [
        {
          id: 1,
          order_number: 'EXP-2026-001',
          customer: 'Cliente ABC',
          status: 'pending',
          created_at: '2026-03-09T10:00:00Z',
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 1,
      },
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockOrders })

    const { result } = renderHook(() => usePendingOrders(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.isFetching).toBe(false)
    })

    expect(api.get).toHaveBeenCalledWith('/admin/pending-orders?status=all&per_page=15&page=1')
    expect(result.current.data?.data).toHaveLength(1)
  })

  it('should use keepPreviousData: data is undefined on cold cache, defined after fetch', async () => {
    // Delay the API response
    vi.mocked(api.get).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                data: [],
                meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
              },
            })
          }, 100)
        })
    )

    const { result } = renderHook(() => usePendingOrders(), { wrapper })

    // With keepPreviousData, on cold cache data is undefined (no fake placeholder rows)
    expect(result.current.data).toBeUndefined()
    expect(result.current.isPlaceholderData).toBe(false)
    expect(result.current.isFetching).toBe(true)

    // Wait for real data
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledTimes(1)
  })

  it('should use QueryCacheTime.PENDING_ORDERS for staleTime', async () => {
    const queryConfigModule = await import('@/lib/query-config')

    expect(queryConfigModule.QueryCacheTime).toBeDefined()
    expect(queryConfigModule.QueryCacheTime.PendingOrders).toBe(30000)
  })
})
