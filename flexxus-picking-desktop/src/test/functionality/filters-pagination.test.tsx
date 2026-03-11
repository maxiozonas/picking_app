import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { useAuthStore } from '@/stores/auth-store'
import { handlers } from '@/test/mocks/handlers'
import OrdersPage from '@/pages/OrdersPage'
import DashboardPage from '@/pages/DashboardPage'

// MSW server setup
const server = setupServer(...handlers)

describe('Functionality Tests: Pagination, Filtering, Search', () => {
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

    // Login as admin
    useAuthStore
      .getState()
      .login({ id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' }, 'token')
  })

  afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
  })

  afterAll(() => {
    server.close()
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(BrowserRouter, {}, component)
      )
    )
  }

  describe('Pagination Functionality', () => {
    it('should display pagination controls', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      // Check for pagination elements
      expect(screen.getByRole('button', { name: /anterior|prev/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /siguiente|next/i })).toBeInTheDocument()
      expect(screen.getByText(/página/i)).toBeInTheDocument()
    })

    it('should navigate to next page', async () => {
      // Mock response with more data
      server.use(
        http.get('*/api/admin/orders', ({ request }) => {
          const url = new URL(request.url)
          const page = parseInt(url.searchParams.get('page') || '1')

          const mockData = {
            data: Array.from({ length: 15 }, (_, i) => ({
              id: (page - 1) * 15 + i + 1,
              order_number: `EXP-2026-${String((page - 1) * 15 + i + 1).padStart(5, '0')}`,
              customer_name: `Cliente ${i + 1}`,
              status: 'pending',
              warehouse: { id: 1, code: 'CENTRO', name: 'Centro' },
              assigned_to: null,
              started_at: null,
              completed_at: null,
              has_stock_issues: false,
              completed_percentage: 0,
              total_items: 5,
              picked_items: 0,
            })),
            meta: {
              current_page: page,
              last_page: 5,
              per_page: 15,
              total: 75,
            },
          }

          return HttpResponse.json(mockData)
        })
      )

      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      const nextButton = screen.getByRole('button', { name: /siguiente|next/i })
      await userEvent.click(nextButton)

      // Should show loading state
      expect(screen.getByTestId(/loading|spinner/i)).toBeInTheDocument()

      // Should show page 2
      await waitFor(() => {
        expect(screen.getByText(/página 2/i)).toBeInTheDocument()
      })
    })

    it('should navigate to previous page', async () => {
      window.history.pushState({}, 'Orders', '/orders?page=2')

      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      const prevButton = screen.getByRole('button', { name: /anterior|prev/i })
      await userEvent.click(prevButton)

      // Should show page 1
      await waitFor(() => {
        expect(screen.getByText(/página 1/i)).toBeInTheDocument()
      })
    })

    it('should disable previous button on first page', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      const prevButton = screen.getByRole('button', { name: /anterior|prev/i })
      expect(prevButton).toBeDisabled()
    })

    it('should change items per page', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      // Find per page selector
      const perPageSelect = screen.getByRole('combobox', { name: /por página|items per page/i })
      await userEvent.selectOptions(perPageSelect, '50')

      // Should refetch with new page size
      await waitFor(() => {
        expect(screen.getByText(/mostrando 1-50 de/i)).toBeInTheDocument()
      })
    })
  })

  describe('Status Filter Functionality', () => {
    it('should filter by status: pending', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      // Select status filter
      const statusFilter = screen.getByRole('combobox', { name: /estado|status/i })
      await userEvent.selectOptions(statusFilter, 'pending')

      // Should show only pending orders
      await waitFor(() => {
        const orders = screen.getAllByText(/pending/i)
        expect(orders.length).toBeGreaterThan(0)
      })
    })

    it('should filter by status: in_progress', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      const statusFilter = screen.getByRole('combobox', { name: /estado|status/i })
      await userEvent.selectOptions(statusFilter, 'in_progress')

      await waitFor(() => {
        const orders = screen.getAllByText(/en progreso|in_progress/i)
        expect(orders.length).toBeGreaterThan(0)
      })
    })

    it('should filter by status: completed', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      const statusFilter = screen.getByRole('combobox', { name: /estado|status/i })
      await userEvent.selectOptions(statusFilter, 'completed')

      await waitFor(() => {
        const orders = screen.getAllByText(/completado|completed/i)
        expect(orders.length).toBeGreaterThan(0)
      })
    })

    it('should clear status filter', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      // Apply filter
      const statusFilter = screen.getByRole('combobox', { name: /estado|status/i })
      await userEvent.selectOptions(statusFilter, 'pending')

      // Clear filter
      await userEvent.selectOptions(statusFilter, 'all')

      // Should show all orders
      await waitFor(() => {
        expect(screen.getByText(/todas las órdenes|all orders/i)).toBeInTheDocument()
      })
    })
  })

  describe('Warehouse Filter Functionality', () => {
    it('should filter by warehouse', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      // Select warehouse filter
      const warehouseFilter = screen.getByRole('combobox', { name: /warehouse|almacén/i })
      await userEvent.selectOptions(warehouseFilter, 'CENTRO')

      // Should show only CENTRO warehouse orders
      await waitFor(() => {
        const centroOrders = screen.getAllByText(/CENTRO/i)
        expect(centroOrders.length).toBeGreaterThan(0)
      })
    })

    it('should show "All Warehouses" option', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      const warehouseFilter = screen.getByRole('combobox', { name: /warehouse|almacén/i })
      const allOption = screen.getByText(/todos los almacenes|all warehouses/i)

      expect(allOption).toBeInTheDocument()
    })

    it('should combine warehouse and status filters', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      // Apply warehouse filter
      const warehouseFilter = screen.getByRole('combobox', { name: /warehouse|almacén/i })
      await userEvent.selectOptions(warehouseFilter, 'CENTRO')

      // Apply status filter
      const statusFilter = screen.getByRole('combobox', { name: /estado|status/i })
      await userEvent.selectOptions(statusFilter, 'in_progress')

      // Should show only CENTRO + in_progress orders
      await waitFor(() => {
        expect(screen.getByText(/CENTRO/i)).toBeInTheDocument()
        expect(screen.getByText(/en progreso|in_progress/i)).toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    it('should search by order number', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      const searchInput = screen.getByRole('textbox', { name: /buscar|search/i })
      await userEvent.type(searchInput, 'EXP-2026-00123')

      // Should show filtered results
      await waitFor(() => {
        expect(screen.getByText(/EXP-2026-00123/i)).toBeInTheDocument()
      })

      // Should not show other orders
      expect(screen.queryByText(/EXP-2026-00124/i)).not.toBeInTheDocument()
    })

    it('should debounce search input', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      const searchInput = screen.getByRole('textbox', { name: /buscar|search/i })

      // Type quickly
      await userEvent.type(searchInput, 'EXP')
      await userEvent.type(searchInput, '-2026')
      await userEvent.type(searchInput, '-00123')

      // Should wait for debounce before making request
      // This would require checking the number of API calls made
    })

    it('should clear search results', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      const searchInput = screen.getByRole('textbox', { name: /buscar|search/i })
      const clearButton = screen.getByRole('button', { name: /limpiar|clear/i })

      // Search
      await userEvent.type(searchInput, 'EXP-2026-00123')

      await waitFor(() => {
        expect(screen.getByText(/EXP-2026-00123/i)).toBeInTheDocument()
      })

      // Clear search
      await userEvent.click(clearButton)

      // Should show all orders again
      await waitFor(() => {
        expect(searchInput).toHaveValue('')
      })
    })

    it('should handle case-insensitive search', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      const searchInput = screen.getByRole('textbox', { name: /buscar|search/i })

      // Search with lowercase
      await userEvent.type(searchInput, 'exp-2026-00123')

      // Should find the order
      await waitFor(() => {
        expect(screen.getByText(/EXP-2026-00123/i)).toBeInTheDocument()
      })
    })
  })

  describe('Combined Filters and Search', () => {
    it('should combine warehouse filter with search', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      // Apply warehouse filter
      const warehouseFilter = screen.getByRole('combobox', { name: /warehouse|almacén/i })
      await userEvent.selectOptions(warehouseFilter, 'CENTRO')

      // Search
      const searchInput = screen.getByRole('textbox', { name: /buscar|search/i })
      await userEvent.type(searchInput, 'EXP-2026-00123')

      // Should show filtered results
      await waitFor(() => {
        expect(screen.getByText(/CENTRO/i)).toBeInTheDocument()
        expect(screen.getByText(/EXP-2026-00123/i)).toBeInTheDocument()
      })
    })

    it('should combine status filter with search', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      // Apply status filter
      const statusFilter = screen.getByRole('combobox', { name: /estado|status/i })
      await userEvent.selectOptions(statusFilter, 'in_progress')

      // Search
      const searchInput = screen.getByRole('textbox', { name: /buscar|search/i })
      await userEvent.type(searchInput, 'EXP-2026-00123')

      // Should show filtered results
      await waitFor(() => {
        expect(screen.getByText(/en progreso|in_progress/i)).toBeInTheDocument()
        expect(screen.getByText(/EXP-2026-00123/i)).toBeInTheDocument()
      })
    })

    it('should clear all filters at once', async () => {
      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      // Apply filters
      const warehouseFilter = screen.getByRole('combobox', { name: /warehouse|almacén/i })
      await userEvent.selectOptions(warehouseFilter, 'CENTRO')

      const statusFilter = screen.getByRole('combobox', { name: /estado|status/i })
      await userEvent.selectOptions(statusFilter, 'in_progress')

      const searchInput = screen.getByRole('textbox', { name: /buscar|search/i })
      await userEvent.type(searchInput, 'EXP-2026-00123')

      // Click "Clear All" button
      const clearAllButton = screen.getByRole('button', { name: /limpiar todo|clear all/i })
      await userEvent.click(clearAllButton)

      // All filters should be cleared
      await waitFor(() => {
        expect(warehouseFilter).toHaveValue('all')
        expect(statusFilter).toHaveValue('all')
        expect(searchInput).toHaveValue('')
      })
    })
  })

  describe('Dashboard Filters and Stats', () => {
    it('should filter stats by warehouse', async () => {
      renderWithProviders(React.createElement(DashboardPage))

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })

      // Select warehouse
      const warehouseFilter = screen.getByRole('combobox', { name: /warehouse|almacén/i })
      await userEvent.selectOptions(warehouseFilter, 'CENTRO')

      // Stats should update
      await waitFor(() => {
        expect(screen.getByText(/CENTRO/i)).toBeInTheDocument()
      })
    })

    it('should update stats when date range changes', async () => {
      renderWithProviders(React.createElement(DashboardPage))

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })

      // Select date range (if implemented)
      const dateFromInput = screen.getByRole('textbox', { name: /desde|from/i })
      const dateToInput = screen.getByRole('textbox', { name: /hasta|to/i })

      await userEvent.type(dateFromInput, '2026-03-01')
      await userEvent.type(dateToInput, '2026-03-09')

      // Stats should refresh
      await waitFor(() => {
        expect(screen.getByTestId(/loading|spinner/i)).toBeInTheDocument()
      })
    })

    it('should manually refresh stats', async () => {
      renderWithProviders(React.createElement(DashboardPage))

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })

      const refreshButton = screen.getByRole('button', { name: /refresh|actualizar/i })
      await userEvent.click(refreshButton)

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByTestId(/loading|spinner/i)).toBeInTheDocument()
      })

      // Should show updated stats
      await waitFor(() => {
        expect(screen.getByText(/órdenes/i)).toBeInTheDocument()
      })
    })
  })
})
