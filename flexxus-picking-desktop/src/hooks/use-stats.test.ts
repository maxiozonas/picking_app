import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useStats } from '@/hooks/use-stats'
import { useWarehouseFilterStore } from '@/contexts/WarehouseFilterContext'
import api from '@/lib/api'

// Mock dependencies
vi.mock('@/lib/api')
vi.mock('@/contexts/WarehouseFilterContext')

describe('useStats', () => {
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

  it('should fetch stats without filters', async () => {
    const mockStats = {
      total_orders: 100,
      in_progress_count: 20,
      completed_count: 60,
      by_warehouse: [
        {
          warehouse_id: 1,
          warehouse_code: 'CENTRO',
          warehouse_name: 'Centro',
          total_orders: 50,
          in_progress_count: 10,
          completed_count: 30,
        },
      ],
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockStats })

    const { result } = renderHook(() => useStats(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith('/admin/stats?')
    expect(result.current.data).toEqual(mockStats)
  })

  it('should fetch stats with warehouse filter', async () => {
    const mockStats = {
      total_orders: 50,
      in_progress_count: 10,
      completed_count: 30,
      by_warehouse: [],
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockStats })

    vi.mocked(useWarehouseFilterStore).mockImplementation((selector) => {
      const state = {
        selectedWarehouseId: 1,
        setSelectedWarehouseId: vi.fn(),
        clearFilter: vi.fn(),
      }
      return selector(state)
    })

    const { result } = renderHook(() => useStats(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith('/admin/stats?warehouse_id=1')
  })

  it('should fetch stats with date range filters', async () => {
    const mockStats = {
      total_orders: 100,
      in_progress_count: 20,
      completed_count: 60,
      by_warehouse: [],
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockStats })

    const { result } = renderHook(() => useStats('2026-03-01', '2026-03-09'), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith(
      '/admin/stats?date_from=2026-03-01&date_to=2026-03-09'
    )
  })

  it('should fetch stats with all filters combined', async () => {
    const mockStats = {
      total_orders: 25,
      in_progress_count: 5,
      completed_count: 15,
      by_warehouse: [],
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockStats })

    vi.mocked(useWarehouseFilterStore).mockImplementation((selector) => {
      const state = {
        selectedWarehouseId: 2,
        setSelectedWarehouseId: vi.fn(),
        clearFilter: vi.fn(),
      }
      return selector(state)
    })

    const { result } = renderHook(() => useStats('2026-03-01', '2026-03-09'), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith(
      '/admin/stats?warehouse_id=2&date_from=2026-03-01&date_to=2026-03-09'
    )
  })

  it('should handle API errors', async () => {
    const mockError = new Error('Network error')

    vi.mocked(api.get).mockRejectedValue(mockError)

    const { result } = renderHook(() => useStats(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
  })
})
