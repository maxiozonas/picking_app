import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { http, HttpResponse, delay } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { QueryCacheTime } from '@/lib/query-config'
import { handlers } from '@/test/mocks/handlers'
import DashboardPage from '@/pages/DashboardPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

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

describe('E2E: Dashboard No Polling Behavior', () => {
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
          refetchOnWindowFocus: true,
          refetchOnMount: false,
          refetchOnReconnect: true,
        },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
    // Set authenticated state
    useAuthStore.getState().login({
      user: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
      token: 'mock-token',
    })
  })

  afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
    useAuthStore.getState().logout()
  })

  afterAll(() => {
    server.close()
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(
          BrowserRouter,
          null,
          React.createElement(ProtectedRoute, { children: component })
        )
      )
    )
  }

  describe('no automatic polling behavior', () => {
    it('should load dashboard data on mount', async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', async () => {
          requestCount++
          return HttpResponse.json(mockStats)
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/150/i)).toBeInTheDocument()
      })

      // Should have made exactly 1 request
      expect(requestCount).toBe(1)
    })

    it('should NOT automatically refetch after a delay', { timeout: 10000 }, async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', async () => {
          requestCount++
          return HttpResponse.json(mockStats)
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/150/i)).toBeInTheDocument()
      })

      const initialRequestCount = requestCount

      // Wait 3 seconds with real timers
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Should NOT have made additional requests
      expect(requestCount).toBe(initialRequestCount)
    })
  })

  describe('manual refresh triggers refetch', () => {
    it('should refetch when user manually triggers refresh', async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', async () => {
          requestCount++
          const newStats = { ...mockStats, total_orders: 150 + requestCount * 10 }
          return HttpResponse.json(newStats)
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/150/i)).toBeInTheDocument()
      })

      const initialRequestCount = requestCount

      // Find and click refresh button
      const refreshButton = screen.queryByLabelText(/refresh|reload/i) ||
                          screen.queryByText(/refresh|reload/i)

      if (refreshButton) {
        refreshButton.click()

        // Should trigger new request
        await waitFor(() => {
          expect(requestCount).toBeGreaterThan(initialRequestCount)
        })

        // Should show updated data
        await waitFor(() => {
          expect(screen.getByText(/160/i)).toBeInTheDocument()
        })
      }
    })

    it('should NOT refetch without user interaction', async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', async () => {
          requestCount++
          return HttpResponse.json(mockStats)
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/150/i)).toBeInTheDocument()
      })

      const initialRequestCount = requestCount

      // Simulate events that should NOT trigger refetch
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Trigger mouse move (should not cause refetch)
      const dashboard = screen.getByTestId(/dashboard/i) || document.body
      dashboard.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))

      // Trigger click on non-interactive element
      dashboard.dispatchEvent(new MouseEvent('click', { bubbles: true }))

      // Should NOT have made additional requests
      expect(requestCount).toBe(initialRequestCount)
    })
  })

  describe('window focus behavior (not polling)', () => {
    it('should NOT refetch on window focus if data is fresh', async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', async () => {
          requestCount++
          return HttpResponse.json(mockStats)
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/150/i)).toBeInTheDocument()
      })

      const initialRequestCount = requestCount

      // Trigger window focus (within staleTime)
      window.dispatchEvent(new Event('focus'))

      // Should NOT refetch while data is fresh
      await waitFor(() => {
        expect(requestCount).toBe(initialRequestCount)
      })
    })

    it('should refetch on window focus AFTER staleTime expires', { timeout: 45000 }, async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', async () => {
          requestCount++
          return HttpResponse.json(mockStats)
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/150/i)).toBeInTheDocument()
      })

      const initialRequestCount = requestCount

      // Wait past staleTime (using real timers)
      await new Promise(resolve => setTimeout(resolve, QueryCacheTime.STALE_TIME + 500))

      // Trigger window focus
      window.dispatchEvent(new Event('focus'))

      // Should refetch after focus when data is stale
      await waitFor(() => {
        expect(requestCount).toBeGreaterThan(initialRequestCount)
      })
    })
  })

  describe('data freshness over time', () => {
    it('should keep data fresh immediately after fetch', async () => {
      server.use(
        http.get('*/api/admin/stats', async () => {
          return HttpResponse.json(mockStats)
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/150/i)).toBeInTheDocument()
      })

      // Data should be fresh immediately
      const cache = queryClient.getQueryCache()
      const query = cache.find({ queryKey: ['stats'] })

      expect(query?.state.isStale).toBe(false)
    })

    it('should mark data as stale after staleTime expires', { timeout: 45000 }, async () => {
      server.use(
        http.get('*/api/admin/stats', async () => {
          return HttpResponse.json(mockStats)
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/150/i)).toBeInTheDocument()
      })

      // Wait past staleTime (using real timers)
      await new Promise(resolve => setTimeout(resolve, QueryCacheTime.STALE_TIME + 500))

      // Data should be marked stale but still visible
      const cache = queryClient.getQueryCache()
      const query = cache.find({ queryKey: ['stats'] })

      expect(query?.state.isStale).toBe(true)
      expect(query?.state.data).toBeDefined()

      // Data should still be visible on screen
      expect(screen.getByText(/150/i)).toBeInTheDocument()
    })
  })

  describe('comparison with polling behavior', () => {
    it('should demonstrate NO polling by comparing request counts over time', { timeout: 10000 }, async () => {
      const requestTimestamps: number[] = []

      server.use(
        http.get('*/api/admin/stats', async () => {
          requestTimestamps.push(Date.now())
          return HttpResponse.json(mockStats)
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/150/i)).toBeInTheDocument()
      })

      const initialTimestamp = requestTimestamps[0]

      // Wait 5 seconds with real timers
      await new Promise(resolve => setTimeout(resolve, 5000))

      // Should still only have 1 request (no polling)
      expect(requestTimestamps.length).toBe(1)

      // Verify no additional requests were made after initial
      const timePassed = Date.now() - initialTimestamp
      expect(timePassed).toBeGreaterThanOrEqual(5000)
    })

    it('should only refetch on explicit user action or window focus (after staleTime)', { timeout: 50000 }, async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', async () => {
          requestCount++
          return HttpResponse.json(mockStats)
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/150/i)).toBeInTheDocument()
      })

      const initialCount = requestCount

      // Wait past staleTime
      await new Promise(resolve => setTimeout(resolve, QueryCacheTime.STALE_TIME + 500))

      // Trigger window focus (should cause refetch)
      window.dispatchEvent(new Event('focus'))

      await waitFor(() => {
        expect(requestCount).toBe(initialCount + 1)
      })

      const afterFocusCount = requestCount

      // Wait another 2 seconds WITHOUT any triggers
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Should NOT have made additional requests
      expect(requestCount).toBe(afterFocusCount)
    })
  })
})
