import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useInventory, useStockSearch } from '@/hooks/use-inventory'
import apiClient from '@/lib/api'
import { InventoryItem, PaginatedResponse } from '@/types/api'
import { QueryCacheTime } from '@/lib/query-config'

vi.mock('@/lib/api')

describe('useInventory', () => {
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

  it('should fetch inventory', async () => {
    const mockInventory: PaginatedResponse<InventoryItem> = {
      data: [
        {
          product_code: 'PROD-001',
          description: 'Product 1',
          warehouse_code: 'CENTRO',
          warehouse_name: 'Centro',
          stock_total: 100,
          stock_real: 80,
          stock_pending: 20,
          location: 'A1',
          orders_using: 5,
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 1,
      },
    }

    vi.mocked(apiClient.get).mockResolvedValue({ data: mockInventory })

    const { result } = renderHook(() => useInventory(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.isFetching).toBe(false)
    })

    expect(apiClient.get).toHaveBeenCalledWith('/admin/inventory?page=1&per_page=20')
    expect(result.current.data?.data).toHaveLength(1)
    expect(result.current.data?.data[0].product_code).toBe('PROD-001')
  })

  it('should use QueryCacheTime.Inventory for staleTime', async () => {
    const mockInventory: PaginatedResponse<InventoryItem> = {
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
    }

    vi.mocked(apiClient.get).mockResolvedValue({ data: mockInventory })

    const { result } = renderHook(() => useInventory(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(QueryCacheTime.Inventory).toBe(30000)
  })

  it('should use keepPreviousData: data is undefined on cold cache, defined after fetch', async () => {
    vi.mocked(apiClient.get).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                data: [],
                meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
              },
            })
          }, 100)
        })
    )

    const { result } = renderHook(() => useInventory(), { wrapper })

    // With keepPreviousData, on cold cache data is undefined (no fake placeholder rows)
    expect(result.current.data).toBeUndefined()
    expect(result.current.isPlaceholderData).toBe(false)
    expect(result.current.isFetching).toBe(true)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should handle warehouse_id parameter', async () => {
    const mockInventory: PaginatedResponse<InventoryItem> = {
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
    }

    vi.mocked(apiClient.get).mockResolvedValue({ data: mockInventory })

    const { result } = renderHook(() => useInventory({ warehouseId: 1 }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('warehouse_id=1'))
  })

  it('should handle pagination', async () => {
    const mockInventory: PaginatedResponse<InventoryItem> = {
      data: [],
      meta: { current_page: 2, last_page: 5, per_page: 20, total: 100 },
    }

    vi.mocked(apiClient.get).mockResolvedValue({ data: mockInventory })

    const { result } = renderHook(() => useInventory({ page: 2 }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('page=2'))
  })

  it('should handle custom perPage', async () => {
    const mockInventory: PaginatedResponse<InventoryItem> = {
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 50, total: 0 },
    }

    vi.mocked(apiClient.get).mockResolvedValue({ data: mockInventory })

    const { result } = renderHook(() => useInventory({ perPage: 50 }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('per_page=50'))
  })
})

describe('useStockSearch', () => {
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

  it('should fetch stock search results', async () => {
    const mockResults: InventoryItem[] = [
      {
        product_code: 'PROD-001',
        description: 'Product 1',
        warehouse_code: 'CENTRO',
        warehouse_name: 'Centro',
        stock_total: 100,
        stock_real: 80,
        stock_pending: 20,
        location: 'A1',
        orders_using: 5,
      },
    ]

    vi.mocked(apiClient.get).mockResolvedValue({ data: mockResults })

    const { result } = renderHook(() => useStockSearch({ productCode: 'PROD' }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(apiClient.get).toHaveBeenCalledWith('/admin/inventory/search?product_code=PROD')
    expect(result.current.data).toHaveLength(1)
  })

  it('should use QueryCacheTime.StockSearch for staleTime', async () => {
    const mockResults: InventoryItem[] = []

    vi.mocked(apiClient.get).mockResolvedValue({ data: mockResults })

    const { result } = renderHook(() => useStockSearch({ productCode: 'TEST' }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(QueryCacheTime.StockSearch).toBe(30000)
  })

  it('should be disabled when productCode is less than 2 characters', async () => {
    const { result } = renderHook(() => useStockSearch({ productCode: 'P' }), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiClient.get).not.toHaveBeenCalled()
  })

  it('should be disabled when productCode is empty', async () => {
    const { result } = renderHook(() => useStockSearch({ productCode: '' }), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiClient.get).not.toHaveBeenCalled()
  })

  it('should be enabled when productCode has 2 or more characters', async () => {
    const mockResults: InventoryItem[] = []

    vi.mocked(apiClient.get).mockResolvedValue({ data: mockResults })

    const { result } = renderHook(() => useStockSearch({ productCode: 'PR' }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(apiClient.get).toHaveBeenCalledTimes(1)
  })

  it('should handle warehouse_id parameter', async () => {
    const mockResults: InventoryItem[] = []

    vi.mocked(apiClient.get).mockResolvedValue({ data: mockResults })

    const { result } = renderHook(() => useStockSearch({ productCode: 'PROD', warehouseId: 1 }), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('warehouse_id=1'))
  })

  it('should not provide placeholder data for search', async () => {
    vi.mocked(apiClient.get).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: [] })
          }, 100)
        })
    )

    const { result } = renderHook(() => useStockSearch({ productCode: 'PROD' }), { wrapper })

    expect(result.current.data).toBeUndefined()
    expect(result.current.isPending).toBe(true)
  })
})
