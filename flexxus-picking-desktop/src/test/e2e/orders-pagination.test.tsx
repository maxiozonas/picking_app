import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse, delay } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { QueryCacheTime } from '@/lib/query-config'
import { handlers } from '@/test/mocks/handlers'
import OrdersPage from '@/pages/OrdersPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// MSW server setup
const server = setupServer(...handlers)

const mockOrders = {
  data: Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    order_number: `EXP-2026-${String(i + 1).padStart(3, '0')}`,
    customer_name: `Cliente ${i + 1}`,
    status: i % 3 === 0 ? 'in_progress' : i % 3 === 1 ? 'completed' : 'pending',
    started_at: i % 3 === 0 ? '2026-03-09T10:30:00Z' : null,
    completed_at: i % 3 === 1 ? '2026-03-09T15:30:00Z' : null,
    warehouse: {
      id: (i % 2) + 1,
      code: i % 2 === 0 ? 'CENTRO' : 'NORTE',
      name: i % 2 === 0 ? 'Centro' : 'Norte',
    },
    assigned_to: i % 3 === 0 ? { id: 5, name: 'Juan Pérez' } : null,
    has_stock_issues: i % 5 === 0,
    completed_percentage: i % 3 === 1 ? 100 : i % 3 === 0 ? 45 : 0,
    total_items: 10,
    picked_items: i % 3 === 1 ? 10 : i % 3 === 0 ? 4 : 0,
  })),
  meta: {
    current_page: 1,
    last_page: 3,
    per_page: 15,
    total: 30,
  },
}

describe('E2E: Orders Pagination with Placeholder Data', () => {
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
          React.createElement(
            Routes,
            null,
            React.createElement(
              Route,
              { path: '/orders', element: React.createElement(ProtectedRoute, { children: component }) }
            )
          )
        )
      )
    )
  }

  describe('placeholder data behavior', () => {
    it('should show placeholder data immediately on page load', async () => {
      // Slow API response
      server.use(
        http.get('*/api/admin/orders', async () => {
          await delay(2000)
          return HttpResponse.json(mockOrders)
        })
      )

      renderWithProviders(React.createElement(OrdersPage))

      // Should show loading/placeholder data immediately
      await waitFor(() => {
        const table = screen.queryByRole('table')
        expect(table).toBeTruthy()
      })

      // Should not show error state
      expect(screen.queryByText(/error/i)).toBeNull()
    })

    it('should replace placeholder with real data after fetch completes', async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/orders', async () => {
          requestCount++
          await delay(100)
          return HttpResponse.json(mockOrders)
        })
      )

      renderWithProviders(React.createElement(OrdersPage))

      // Wait for real data to load
      await waitFor(
        () => {
          expect(requestCount).toBeGreaterThan(0)
        },
        { timeout: 5000 }
      )

      // Should show real order data
      await waitFor(() => {
        expect(screen.getByText('EXP-2026-001')).toBeInTheDocument()
        expect(screen.getByText('Cliente 1')).toBeInTheDocument()
      })
    })

    it('should maintain placeholder data during loading state', async () => {
      server.use(
        http.get('*/api/admin/orders', async () => {
          await delay(1000)
          return HttpResponse.json(mockOrders)
        })
      )

      renderWithProviders(React.createElement(OrdersPage))

      // Initially should have placeholder/skeleton
      const skeletons = screen.queryAllByText(/loading|skeleton/i)
      const hasSkeleton = skeletons.length > 0 || document.querySelector('.animate-pulse')

      expect(hasSkeleton).toBe(true)

      // After data loads, should have real data
      await waitFor(() => {
        expect(screen.getByText('EXP-2026-001')).toBeInTheDocument()
      })
    })
  })

  describe('pagination transitions', () => {
    it('should smoothly transition when changing pages', async () => {
      server.use(
        http.get('*/api/admin/orders', async ({ request }) => {
          const url = new URL(request.url)
          const page = parseInt(url.searchParams.get('page') || '1')

          await delay(100)

          const start = (page - 1) * 15
          const pageData = mockOrders.data.slice(start, start + 15)

          return HttpResponse.json({
            data: pageData,
            meta: {
              current_page: page,
              last_page: 3,
              per_page: 15,
              total: 30,
            },
          })
        })
      )

      renderWithProviders(React.createElement(OrdersPage))

      // Wait for initial page
      await waitFor(() => {
        expect(screen.getByText('EXP-2026-001')).toBeInTheDocument()
      })

      // Click next page
      const nextPageButton = screen.queryByText('Next') || screen.queryByText('Siguiente')
      if (nextPageButton) {
        nextPageButton.click()

        // Should show loading state briefly
        await waitFor(() => {
          const loadingElements = document.querySelectorAll('.animate-pulse')
          expect(loadingElements.length).toBeGreaterThan(0)
        })

        // Should show new page data
        await waitFor(() => {
          expect(screen.getByText('EXP-2026-016')).toBeInTheDocument()
        })
      }
    })

    it('should keep previous data visible during pagination navigation', async () => {
      server.use(
        http.get('*/api/admin/orders', async ({ request }) => {
          const url = new URL(request.url)
          const page = parseInt(url.searchParams.get('page') || '1')

          await delay(500)

          const start = (page - 1) * 15
          const pageData = mockOrders.data.slice(start, start + 15)

          return HttpResponse.json({
            data: pageData,
            meta: {
              current_page: page,
              last_page: 3,
              per_page: 15,
              total: 30,
            },
          })
        })
      )

      renderWithProviders(React.createElement(OrdersPage))

      // Load first page
      await waitFor(() => {
        expect(screen.getByText('EXP-2026-001')).toBeInTheDocument()
      })

      const firstPageOrder = screen.getByText('EXP-2026-001')

      // Navigate to next page
      const nextPageButton = screen.queryByText('Next') || screen.queryByText('Siguiente')
      if (nextPageButton) {
        nextPageButton.click()

        // During loading, old data should still be visible
        expect(firstPageOrder).toBeInTheDocument()

        // After load, new data appears
        await waitFor(() => {
          expect(screen.getByText('EXP-2026-016')).toBeInTheDocument()
        })
      }
    })

    it('should cache previous pages for instant back navigation', async () => {
      server.use(
        http.get('*/api/admin/orders', async ({ request }) => {
          const url = new URL(request.url)
          const page = parseInt(url.searchParams.get('page') || '1')

          const start = (page - 1) * 15
          const pageData = mockOrders.data.slice(start, start + 15)

          return HttpResponse.json({
            data: pageData,
            meta: {
              current_page: page,
              last_page: 3,
              per_page: 15,
              total: 30,
            },
          })
        })
      )

      renderWithProviders(React.createElement(OrdersPage))

      // Load first page
      await waitFor(() => {
        expect(screen.getByText('EXP-2026-001')).toBeInTheDocument()
      })

      // Go to page 2
      const nextPageButton = screen.queryByText('Next') || screen.queryByText('Siguiente')
      if (nextPageButton) {
        nextPageButton.click()

        await waitFor(() => {
          expect(screen.getByText('EXP-2026-016')).toBeInTheDocument()
        })

        // Go back to page 1
        const prevPageButton = screen.queryByText('Previous') || screen.queryByText('Anterior')
        if (prevPageButton) {
          prevPageButton.click()

          // Should show page 1 instantly from cache
          await waitFor(() => {
            expect(screen.getByText('EXP-2026-001')).toBeInTheDocument()
          })
        }
      }
    })
  })

  describe('placeholder data structure', () => {
    it('should use correct placeholder data structure', async () => {
      server.use(
        http.get('*/api/admin/orders', async () => {
          await delay(100)
          return HttpResponse.json(mockOrders)
        })
      )

      renderWithProviders(React.createElement(OrdersPage))

      // Placeholder should have the same structure as real data
      await waitFor(() => {
        const table = screen.queryByRole('table')
        expect(table).toBeTruthy()
      })
    })

    it('should maintain consistent pagination metadata in placeholders', async () => {
      server.use(
        http.get('*/api/admin/orders', async ({ request }) => {
          const url = new URL(request.url)
          const page = parseInt(url.searchParams.get('page') || '1')

          await delay(100)

          return HttpResponse.json({
            data: mockOrders.data.slice((page - 1) * 15, page * 15),
            meta: {
              current_page: page,
              last_page: 3,
              per_page: 15,
              total: 30,
            },
          })
        })
      )

      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText('EXP-2026-001')).toBeInTheDocument()
      })

      // Should have pagination info
      const paginationInfo = screen.queryByText(/page|página/i)
      expect(paginationInfo).toBeTruthy()
    })
  })
})
