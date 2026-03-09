import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { OrdersPage } from '@/pages/OrdersPage'
import { useOrders } from '@/hooks/use-orders'
import { useWarehouseFilterStore } from '@/contexts/WarehouseFilterContext'

// Mock dependencies
vi.mock('@/hooks/use-orders')
vi.mock('@/contexts/WarehouseFilterContext')
vi.mock('@/components/orders/OrdersTable', () => ({
  OrdersTable: ({ orders, isLoading, onRefresh }: any) => (
    <div data-testid="orders-table">
      <div data-testid="orders-count">{orders?.length || 0}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <button onClick={onRefresh} data-testid="refresh-btn">
        Refresh
      </button>
    </div>
  ),
}))
vi.mock('@/components/orders/OrderFilters', () => ({
  OrderFilters: ({ searchValue, onSearchChange, statusFilter, onStatusChange }: any) => (
    <div data-testid="order-filters">
      <input
        data-testid="search-input"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search..."
      />
      <select
        data-testid="status-select"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
      />
    </div>
  ),
}))

describe('OrdersPage', () => {
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
    React.createElement(
      BrowserRouter,
      {},
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    )

  it('should render page title and filters', () => {
    vi.mocked(useOrders).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any)

    render(<OrdersPage />, { wrapper })

    expect(screen.getByText('Pedidos')).toBeInTheDocument()
    expect(screen.getByText('Gestión de pedidos de picking')).toBeInTheDocument()
    expect(screen.getByTestId('order-filters')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    vi.mocked(useOrders).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any)

    render(<OrdersPage />, { wrapper })

    expect(screen.getByTestId('is-loading')).toHaveTextContent('true')
  })

  it('should display orders when data is loaded', async () => {
    const mockData = {
      data: [
        {
          id: 1,
          order_number: 'EXP-2026-001',
          customer: 'Cliente ABC',
          warehouse_id: 1,
          status: 'pending' as const,
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

    vi.mocked(useOrders).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    render(<OrdersPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByTestId('orders-count')).toHaveTextContent('1')
    })
  })

  it('should show error state on API error', () => {
    const mockError = new Error('Network error')

    vi.mocked(useOrders).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
    } as any)

    render(<OrdersPage />, { wrapper })

    expect(screen.getByText('Error al cargar pedidos')).toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('should show empty state when no orders', () => {
    vi.mocked(useOrders).mockReturnValue({
      data: {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    render(<OrdersPage />, { wrapper })

    expect(screen.getByTestId('orders-count')).toHaveTextContent('0')
  })

  it('should handle search input', async () => {
    vi.mocked(useOrders).mockReturnValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } },
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    render(<OrdersPage />, { wrapper })

    const searchInput = screen.getByTestId('search-input')
    searchInput.click()
    searchInput.focus()

    // Type in search
    await waitFor(() => {
      searchInput.dispatchEvent(new React.FormEvent('input', { bubbles: true }))
    })
  })

  it('should display pagination when multiple pages', () => {
    const mockData = {
      data: [],
      meta: {
        current_page: 1,
        last_page: 5,
        per_page: 15,
        total: 75,
      },
    }

    vi.mocked(useOrders).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    render(<OrdersPage />, { wrapper })

    expect(screen.getByText(/Mostrando 0 de 75 pedidos/)).toBeInTheDocument()
    expect(screen.getByText('Página 1 de 5')).toBeInTheDocument()
  })
})
