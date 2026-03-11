import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOrders, useOrderDetail } from '@/hooks/use-orders'
import { useWarehouseFilterStore } from '@/contexts/WarehouseFilterContext'
import api from '@/lib/api'
import { PaginatedResponse, PickingOrder } from '@/types/api'

// Mock dependencies
vi.mock('@/lib/api')
vi.mock('@/contexts/WarehouseFilterContext')

describe('useOrders', () => {
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

  it('should fetch orders without filters', async () => {
    const mockOrders: PaginatedResponse<PickingOrder> = {
      data: [
        {
          id: 1,
          order_number: 'EXP-2026-001',
          customer: 'Cliente ABC',
          warehouse_id: 1,
          status: 'pending',
          created_at: '2026-03-09T10:00:00Z',
          updated_at: '2026-03-09T10:00:00Z',
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

    const { result } = renderHook(() => useOrders(), { wrapper })

    // Wait for success and isFetching to be false (data fully loaded)
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.isFetching).toBe(false)
    })

    expect(api.get).toHaveBeenCalledWith('/admin/orders?per_page=15&page=1')

    // Verify the real data arrived, not placeholder data
    expect(result.current.data?.data).toHaveLength(1)
    expect(result.current.data?.data[0].order_number).toBe('EXP-2026-001')
  })

  it('should fetch orders with warehouse filter', async () => {
    const mockOrders: PaginatedResponse<PickingOrder> = {
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
      },
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockOrders })

    vi.mocked(useWarehouseFilterStore).mockImplementation((selector) => {
      const state = {
        selectedWarehouseId: 1,
        setSelectedWarehouseId: vi.fn(),
        clearFilter: vi.fn(),
      }
      return selector(state)
    })

    const { result } = renderHook(() => useOrders(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith('/admin/orders?warehouse_id=1&per_page=15&page=1')
  })

  it('should fetch orders with search filter', async () => {
    const mockOrders: PaginatedResponse<PickingOrder> = {
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
      },
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockOrders })

    const { result } = renderHook(() => useOrders({ search: 'EXP-2026' }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith('/admin/orders?search=EXP-2026&per_page=15&page=1')
  })

  it('should fetch orders with status filter', async () => {
    const mockOrders: PaginatedResponse<PickingOrder> = {
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
      },
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockOrders })

    const { result } = renderHook(() => useOrders({ status: 'in_progress' }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith('/admin/orders?status=in_progress&per_page=15&page=1')
  })

  it('should fetch orders with pagination', async () => {
    const mockOrders: PaginatedResponse<PickingOrder> = {
      data: [],
      meta: {
        current_page: 2,
        last_page: 5,
        per_page: 15,
        total: 75,
      },
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockOrders })

    const { result } = renderHook(() => useOrders({ page: 2 }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith('/admin/orders?per_page=15&page=2')
  })

  it('should fetch orders with all filters combined', async () => {
    const mockOrders: PaginatedResponse<PickingOrder> = {
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
      },
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockOrders })

    vi.mocked(useWarehouseFilterStore).mockImplementation((selector) => {
      const state = {
        selectedWarehouseId: 2,
        setSelectedWarehouseId: vi.fn(),
        clearFilter: vi.fn(),
      }
      return selector(state)
    })

    const { result } = renderHook(
      () =>
        useOrders({
          search: 'EXP-2026',
          status: 'pending',
          page: 1,
          perPage: 20,
        }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith(
      '/admin/orders?warehouse_id=2&search=EXP-2026&status=pending&per_page=20&page=1'
    )
  })

  it('should handle API errors', async () => {
    const mockError = new Error('Network error')

    vi.mocked(api.get).mockRejectedValue(mockError)

    const { result } = renderHook(() => useOrders(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
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

    const { result } = renderHook(() => useOrders(), { wrapper })

    // With keepPreviousData, on cold cache data is undefined (no fake placeholder rows)
    expect(result.current.data).toBeUndefined()
    expect(result.current.isPlaceholderData).toBe(false)

    // isFetching is true — request is in flight
    expect(result.current.isFetching).toBe(true)

    // Wait for real data
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledTimes(1)
  })

  it('should use QueryCacheTime constants from query-config', async () => {
    const queryConfigModule = await import('@/lib/query-config')

    expect(queryConfigModule.QueryCacheTime).toBeDefined()
    expect(queryConfigModule.QueryCacheTime.Orders).toBe(45000)
    expect(queryConfigModule.QueryCacheTime.OrderDetail).toBe(60000)
  })
})

describe('useOrderDetail', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    vi.clearAllMocks()
  })

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  it('should fetch order detail', async () => {
    const mockOrder = {
      id: 1,
      order_number: 'EXP-2026-001',
      customer: 'Cliente ABC',
      warehouse_id: 1,
      warehouse: {
        id: 1,
        code: 'CENTRO',
        name: 'Centro',
      },
      status: 'in_progress' as const,
      user: {
        id: 5,
        name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'employee',
      },
      started_at: '2026-03-09T10:30:00Z',
      created_at: '2026-03-09T08:00:00Z',
      updated_at: '2026-03-09T10:30:00Z',
      items: [],
      alerts: [],
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockOrder })

    const { result } = renderHook(() => useOrderDetail('EXP-2026-001'), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith('/admin/orders/EXP-2026-001')
    expect(result.current.data).toEqual(mockOrder)
  })

  it('should handle API errors', async () => {
    const mockError = new Error('Order not found')

    vi.mocked(api.get).mockRejectedValue(mockError)

    const { result } = renderHook(() => useOrderDetail('EXP-2026-999'), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
  })

  it('should be disabled when orderNumber is empty', async () => {
    const { result } = renderHook(() => useOrderDetail(''), { wrapper })

    // Query should be disabled
    expect(result.current.fetchStatus).toBe('idle')
    expect(api.get).not.toHaveBeenCalled()
  })
})
