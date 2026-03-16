import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { OrderDetailPage } from '@/pages/OrderDetailPage'
import { useOrderDetail } from '@/hooks/use-orders'

const headerSpy = vi.fn()

vi.mock('@/hooks/use-orders')
vi.mock('@/components/orders/OrderDetailHeader', () => ({
  OrderDetailHeader: (props: any) => {
    headerSpy(props)
    return <div data-testid="order-header">{props.orderNumber}</div>
  },
}))
vi.mock('@/components/orders/EmployeeAssignment', () => ({
  EmployeeAssignment: ({ employee }: any) => <div data-testid="employee-assignment">{employee?.name ?? 'Unassigned'}</div>,
}))
vi.mock('@/components/orders/OrderAlerts', () => ({
  OrderAlerts: ({ alerts }: any) => <div data-testid="order-alerts">{alerts.length}</div>,
}))
vi.mock('@/components/orders/OrderItemsTable', () => ({
  OrderItemsTable: ({ items }: any) => <div data-testid="order-items">{items.length}</div>,
}))
vi.mock('@/components/orders/OrderActivityLog', () => ({
  OrderActivityLog: ({ events }: any) => <div data-testid="order-events">{events.length}</div>,
}))

describe('OrderDetailPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    vi.clearAllMocks()
})

  function renderWithRoute(orderNumber: string) {
    return render(
      <MemoryRouter initialEntries={[`/orders/${orderNumber}`]}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/orders/:orderNumber" element={<OrderDetailPage />} />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  it('passes explicit flexxus creation and delivery metadata to the header', () => {
    vi.mocked(useOrderDetail).mockReturnValue({
      data: {
        order_number: 'NP 623202',
        customer: 'Cliente ABC',
        status: 'in_progress',
        warehouse: { id: 1, code: '001', name: 'Don Bosco' },
        delivery_type: 'EXPEDICION',
        flexxus_created_at: '2026-03-09T08:00:00Z',
        started_at: '2026-03-09T09:00:00Z',
        completed_at: null,
        total_items: 3,
        picked_items: 1,
        completed_percentage: 33,
        assigned_to: { id: 5, name: 'Juan Perez' },
        items: [{ id: 1 }],
        alerts: [],
        events: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderWithRoute('NP 623202')

    expect(screen.getByTestId('order-header')).toHaveTextContent('NP 623202')
    expect(headerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        deliveryType: 'EXPEDICION',
        flexxusCreatedAt: '2026-03-09T08:00:00Z',
        startedAt: '2026-03-09T09:00:00Z',
      })
    )
  })

  it('renders error state when detail lookup fails', () => {
    vi.mocked(useOrderDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Order not found'),
    } as any)

    renderWithRoute('NP 999999')

    expect(screen.getByText('Error al cargar el pedido')).toBeInTheDocument()
  })
})
