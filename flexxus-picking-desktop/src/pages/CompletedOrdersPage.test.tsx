import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { CompletedOrdersPage } from '@/pages/CompletedOrdersPage'
import { useOrders } from '@/hooks/use-orders'

vi.mock('@/hooks/use-orders')
vi.mock('@/components/dashboard/WarehouseSelector', () => ({
  WarehouseSelector: () => <div data-testid="warehouse-selector">WarehouseSelector</div>,
}))
vi.mock('@/components/dashboard/DateRangePicker', () => ({
  DateRangePicker: ({
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
  }: {
    dateFrom?: string
    dateTo?: string
    onDateFromChange: (value: string) => void
    onDateToChange: (value: string) => void
  }) => (
    <div>
      <input
        aria-label="Desde"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
      />
      <input
        aria-label="Hasta"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
      />
    </div>
  ),
}))
vi.mock('@/components/orders/OrdersTable', () => ({
  OrdersTable: ({
    orders,
    isLoading,
  }: {
    orders: Array<{ order_number: string }>
    isLoading: boolean
  }) => (
    <div>
      <div data-testid="orders-table-loading">{String(isLoading)}</div>
      <div data-testid="orders-table-count">{orders.length}</div>
      {orders.map((order) => (
        <div key={order.order_number}>{order.order_number}</div>
      ))}
    </div>
  ),
}))

describe('CompletedOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-17T12:00:00Z'))

    vi.mocked(useOrders).mockReturnValue({
      data: {
        data: [
          {
            order_number: 'EXP-2026-100',
            customer: 'Cliente Seguimiento',
            status: 'completed',
          },
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 1,
        },
      },
      isLoading: false,
      isPlaceholderData: false,
      isError: false,
      error: null,
    } as never)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
    </BrowserRouter>
  )

  it('loads completed orders with a 30-day default range', () => {
    render(<CompletedOrdersPage />, { wrapper })

    expect(useOrders).toHaveBeenCalledWith({
      search: undefined,
      status: 'completed',
      page: 1,
      dateFrom: '2026-02-15',
      dateTo: '2026-03-17',
    })
    expect(screen.getByText('Completados')).toBeInTheDocument()
    expect(screen.getByTestId('warehouse-selector')).toBeInTheDocument()
  })

  it('updates filters when the search or date range changes', () => {
    render(<CompletedOrdersPage />, { wrapper })

    fireEvent.change(screen.getByPlaceholderText(/Buscar por numero/i), {
      target: { value: 'EXP-2026-777' },
    })
    vi.advanceTimersByTime(300)

    expect(useOrders).toHaveBeenLastCalledWith({
      search: 'EXP-2026-777',
      status: 'completed',
      page: 1,
      dateFrom: '2026-02-15',
      dateTo: '2026-03-17',
    })

    fireEvent.change(screen.getByLabelText('Desde'), {
      target: { value: '2026-03-01' },
    })

    expect(useOrders).toHaveBeenLastCalledWith({
      search: 'EXP-2026-777',
      status: 'completed',
      page: 1,
      dateFrom: '2026-03-01',
      dateTo: '2026-03-17',
    })
  })
})
