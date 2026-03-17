import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { OrdersPage } from '@/pages/OrdersPage'
import { usePendingOrders } from '@/hooks/use-pending-orders'

const invalidateQueries = vi.fn()
const ordersTableSpy = vi.fn()
const { post } = vi.hoisted(() => ({
  post: vi.fn().mockResolvedValue({ data: {} }),
}))

vi.mock('@/hooks/use-pending-orders')
vi.mock('@/contexts/WarehouseFilterContext', () => ({
  useWarehouseFilterStore: (selector: any) => selector({ selectedWarehouseId: null }),
}))
vi.mock('@/lib/api', () => ({
  default: {
    post,
  },
}))
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query')

  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries }),
  }
})
vi.mock('@/components/orders/OrdersTable', () => ({
  OrdersTable: (props: any) => {
    ordersTableSpy(props)
    return (
      <div data-testid="orders-table">
        <div data-testid="orders-count">{props.orders?.length || 0}</div>
        <button onClick={props.onRefresh} data-testid="refresh-btn">
          Refresh
        </button>
      </div>
    )
  },
}))
vi.mock('@/components/orders/OrderFilters', () => ({
  OrderFilters: ({ searchValue, onSearchChange, statusFilter, onStatusChange }: any) => (
    <div data-testid="order-filters">
      <input data-testid="search-input" value={searchValue} onChange={(e) => onSearchChange(e.target.value)} />
      <select data-testid="status-select" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} />
    </div>
  ),
}))
vi.mock('@/components/dashboard/WarehouseSelector', () => ({
  WarehouseSelector: () => <div data-testid="warehouse-selector" />,
}))

describe('OrdersPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    vi.clearAllMocks()
  })

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(
      BrowserRouter,
      {},
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    )

  it('renders safely on initial load without selected warehouse', () => {
    vi.mocked(usePendingOrders).mockReturnValue({
      data: {
        data: [],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
      },
      isLoading: false,
      isPlaceholderData: false,
      isError: false,
      error: null,
    } as any)

    render(<OrdersPage />, { wrapper })

    expect(screen.getByText('Pedidos')).toBeInTheDocument()
    expect(screen.getByTestId('warehouse-selector')).toBeInTheDocument()
    expect(screen.getByTestId('orders-count')).toHaveTextContent('0')
    expect(screen.getByRole('button', { name: /Actualizar/i })).toBeInTheDocument()
  })

  it('passes delivery and explicit date metadata to the table', () => {
    const order = {
      order_number: 'NP 623202',
      customer: 'Cliente ABC',
      status: 'pending',
      delivery_type: 'EXPEDICION',
      flexxus_created_at: '2026-03-09T08:00:00Z',
      started_at: null,
      warehouse: { id: 1, code: '001', name: 'Don Bosco' },
    }

    vi.mocked(usePendingOrders).mockReturnValue({
      data: {
        data: [order],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
      },
      isLoading: false,
      isPlaceholderData: false,
      isError: false,
      error: null,
    } as any)

    render(<OrdersPage />, { wrapper })

    expect(ordersTableSpy).toHaveBeenCalled()
    expect(ordersTableSpy.mock.calls[0][0].orders[0]).toMatchObject({
      delivery_type: 'EXPEDICION',
      flexxus_created_at: '2026-03-09T08:00:00Z',
      started_at: null,
    })
  })

  it('shows backend errors without crashing the page shell', () => {
    vi.mocked(usePendingOrders).mockReturnValue({
      data: undefined,
      isLoading: false,
      isPlaceholderData: false,
      isError: true,
      error: new Error('Internal Server Error'),
    } as any)

    render(<OrdersPage />, { wrapper })

    expect(screen.getByText('Error al cargar pedidos')).toBeInTheDocument()
    expect(screen.getByText('Internal Server Error')).toBeInTheDocument()
  })

  it('invalidates pending orders when refresh is triggered', async () => {
    vi.mocked(usePendingOrders).mockReturnValue({
      data: {
        data: [],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
      },
      isLoading: false,
      isPlaceholderData: false,
      isError: false,
      error: null,
    } as any)

    render(<OrdersPage />, { wrapper })
    fireEvent.click(screen.getByRole('button', { name: /^Actualizar$/i }))

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/admin/pending-orders/refresh', {
        warehouse_id: undefined,
      })
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['pending-orders'] })
    })
  })

  it('disables the header refresh button while the sync is in progress', async () => {
    let resolvePost: (value: unknown) => void = () => {}
    post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve
        })
    )

    vi.mocked(usePendingOrders).mockReturnValue({
      data: {
        data: [],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
      },
      isLoading: false,
      isPlaceholderData: false,
      isError: false,
      error: null,
    } as any)

    render(<OrdersPage />, { wrapper })

    const refreshButton = screen.getByRole('button', { name: /Actualizar/i })
    fireEvent.click(refreshButton)

    expect(refreshButton).toBeDisabled()
    expect(screen.getByRole('button', { name: /Actualizando/i })).toBeInTheDocument()

    resolvePost({})

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['pending-orders'] })
    })
  })
})
