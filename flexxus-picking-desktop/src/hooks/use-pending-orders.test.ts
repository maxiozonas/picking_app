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
  let selectedWarehouseId: number | null

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    vi.clearAllMocks()
    selectedWarehouseId = null

    // Default warehouse filter mock
    vi.mocked(useWarehouseFilterStore).mockImplementation((selector) => {
      const state = {
        selectedWarehouseId,
        setSelectedWarehouseId: (id: number | null) => {
          selectedWarehouseId = id
        },
        clearFilter: () => {
          selectedWarehouseId = null
        },
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
          delivery_type: 'EXPEDICION',
          flexxus_created_at: '2026-03-09T10:00:00Z',
          started_at: null,
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
    expect(result.current.data?.data[0]).toMatchObject({
      delivery_type: 'EXPEDICION',
      flexxus_created_at: '2026-03-09T10:00:00Z',
      started_at: null,
    })
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

  it('refreshes pending order scope when warehouse changes after the initial all-warehouse load', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('warehouse_id=2')) {
        return {
          data: {
            data: [
              {
                id: 2,
                order_number: 'NP 623202',
                customer: 'Cliente Filtrado',
                status: 'pending',
                warehouse: { id: 2, code: '002', name: 'Rondeau' },
              },
            ],
            meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
          },
        }
      }

      return {
        data: {
          data: [
            {
              id: 1,
              order_number: 'NP 623201',
              customer: 'Cliente General',
              status: 'pending',
              warehouse: { id: 1, code: '001', name: 'Don Bosco' },
            },
          ],
          meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
        },
      }
    })

    const { result, rerender } = renderHook(() => usePendingOrders(), { wrapper })

    await waitFor(() => {
      expect(result.current.data?.data[0]?.warehouse?.id).toBe(1)
    })

    expect(api.get).toHaveBeenNthCalledWith(1, '/admin/pending-orders?status=all&per_page=15&page=1')

    selectedWarehouseId = 2
    rerender()

    await waitFor(() => {
      expect(result.current.data?.data[0]?.warehouse?.id).toBe(2)
    })

    expect(api.get).toHaveBeenNthCalledWith(2, '/admin/pending-orders?warehouse_id=2&status=all&per_page=15&page=1')
  })

  it('should use QueryCacheTime.PENDING_ORDERS for staleTime', async () => {
    const queryConfigModule = await import('@/lib/query-config')

    expect(queryConfigModule.QueryCacheTime).toBeDefined()
    expect(queryConfigModule.QueryCacheTime.PendingOrders).toBe(30000)
  })
})
