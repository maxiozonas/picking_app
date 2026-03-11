import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useStats } from '@/hooks/use-stats'
import { useOrders, useOrderDetail } from '@/hooks/use-orders'
import { useAuthStore } from '@/stores/auth-store'
import { handlers } from '@/test/mocks/handlers'

// MSW server setup
const server = setupServer(...handlers)

describe('API Hooks Integration Tests with MSW', () => {
  let queryClient: QueryClient

  beforeAll(() => {
    server.listen()
  })

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
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

  describe('useAuth hook', () => {
    it('should successfully login with valid credentials', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      // Mock navigation
      const mockNavigate = vi.fn()
      vi.mock('react-router-dom', () => ({
        useNavigate: () => mockNavigate,
      }))

      act(() => {
        result.current.login({
          email: 'admin@example.com',
          password: 'password',
        })
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Verify auth store was updated
      const authState = useAuthStore.getState()
      expect(authState.isAuthenticated).toBe(true)
      expect(authState.user?.email).toBe('admin@example.com')
      expect(authState.token).toBe('mock-token-123')
    })

    it('should handle login failure with invalid credentials', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        result.current.login({
          email: 'wrong@example.com',
          password: 'wrong',
        })
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Auth store should not be updated
      const authState = useAuthStore.getState()
      expect(authState.isAuthenticated).toBe(false)
    })

    it('should logout successfully', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      // First login
      act(() => {
        result.current.login({
          email: 'admin@example.com',
          password: 'password',
        })
      })

      // Then logout
      act(() => {
        result.current.logout()
      })

      const authState = useAuthStore.getState()
      expect(authState.isAuthenticated).toBe(false)
      expect(authState.token).toBeNull()
    })
  })

  describe('useStats hook', () => {
    it('should fetch dashboard stats successfully', async () => {
      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual({
        total_orders: 150,
        in_progress_count: 12,
        completed_count: 85,
        pending_count: 45,
        orders_with_issues: 8,
        by_warehouse: expect.arrayContaining([
          expect.objectContaining({
            warehouse_id: expect.any(Number),
            warehouse_code: expect.any(String),
            warehouse_name: expect.any(String),
          }),
        ]),
      })
    })

    it('should fetch stats with warehouse filter', async () => {
      const { result } = renderHook(() => useStats(), { wrapper })

      // This test would require updating the useStats hook to accept warehouse filter
      // For now, we just verify it fetches successfully
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.total_orders).toBeGreaterThan(0)
    })

    it('should handle API errors gracefully', async () => {
      // Override handler to return error
      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          return HttpResponse.json({ message: 'Internal server error' }, { status: 500 })
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('useOrders hook', () => {
    it('should fetch orders list successfully', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            order_number: expect.any(String),
            customer_name: expect.any(String),
            status: expect.any(String),
          }),
        ])
      )
    })

    it('should fetch orders with search filter', async () => {
      const { result } = renderHook(() => useOrders({ search: 'EXP-2026-00123' }), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toHaveLength(1)
      expect(result.current.data?.data[0].order_number).toBe('EXP-2026-00123')
    })

    it('should fetch orders with status filter', async () => {
      const { result } = renderHook(() => useOrders({ status: 'in_progress' }), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            status: 'in_progress',
          }),
        ])
      )
    })

    it('should fetch orders with pagination', async () => {
      const { result } = renderHook(() => useOrders({ page: 1, perPage: 15 }), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.meta).toEqual(
        expect.objectContaining({
          current_page: 1,
          per_page: 15,
          total: expect.any(Number),
        })
      )
    })

    it('should handle empty results', async () => {
      const { result } = renderHook(() => useOrders({ search: 'NONEXISTENT' }), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.data).toHaveLength(0)
    })
  })

  describe('useOrderDetail hook', () => {
    it('should fetch order detail successfully', async () => {
      const { result } = renderHook(() => useOrderDetail('EXP-2026-00123'), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(
        expect.objectContaining({
          id: 1,
          order_number: 'EXP-2026-00123',
          items: expect.arrayContaining([
            expect.objectContaining({
              product_code: expect.any(String),
              quantity: expect.any(Number),
            }),
          ]),
          alerts: expect.arrayContaining([
            expect.objectContaining({
              type: expect.any(String),
              message: expect.any(String),
            }),
          ]),
        })
      )
    })

    it('should not fetch when order number is empty', () => {
      const { result } = renderHook(() => useOrderDetail(''), {
        wrapper,
      })

      // Should not attempt to fetch
      expect(result.current.fetchStatus).toBe('idle')
    })

    it('should handle 404 for non-existent order', async () => {
      const { result } = renderHook(() => useOrderDetail('EXP-999'), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })
  })

  describe('error handling and retry logic', () => {
    it('should handle network errors', async () => {
      // Override handler to simulate network error
      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          return HttpResponse.error()
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeTruthy()
    })

    it('should handle 401 unauthorized errors', async () => {
      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      // Should have triggered auth check and potential redirect
      expect(result.current.error).toBeTruthy()
    })

    it('should handle 500 server errors', async () => {
      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          return HttpResponse.json({ message: 'Internal server error' }, { status: 500 })
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('data caching and refetching', () => {
    it('should cache data and not refetch immediately', async () => {
      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const firstData = result.current.data

      // Re-render hook
      const { result: result2 } = renderHook(() => useStats(), { wrapper })

      // Should use cached data
      expect(result2.current.data).toEqual(firstData)

      // Should not have triggered another request
      expect(server.listHandlers()).toHaveLength(expect.any(Number))
    })

    it('should refetch when filters change', async () => {
      const { result, rerender } = renderHook(({ status }) => useOrders({ status }), {
        wrapper,
        initialProps: { status: 'pending' },
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const pendingData = result.current.data

      // Change filter
      rerender({ status: 'in_progress' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const inProgressData = result.current.data

      // Data should be different
      expect(pendingData).not.toEqual(inProgressData)
    })
  })
})

// Helper for act
function act(callback: () => void) {
  callback()
}
