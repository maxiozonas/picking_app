import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { OrderDetailPage } from '@/pages/OrderDetailPage'
import { useOrderDetail } from '@/hooks/use-orders'

// Mock dependencies
vi.mock('@/hooks/use-orders')
vi.mock('@/components/orders/OrderDetailHeader', () => ({
  OrderDetailHeader: ({ orderNumber, customer }: any) => (
    <div data-testid="order-header">
      <div data-testid="order-number">{orderNumber}</div>
      <div data-testid="customer">{customer}</div>
    </div>
  ),
}))
vi.mock('@/components/orders/EmployeeAssignment', () => ({
  EmployeeAssignment: ({ employee }: any) => (
    <div data-testid="employee-assignment">
      {employee ? <div data-testid="employee-name">{employee.name}</div> : <div>Unassigned</div>}
    </div>
  ),
}))
vi.mock('@/components/orders/OrderAlerts', () => ({
  OrderAlerts: ({ alerts }: any) => (
    <div data-testid="order-alerts">
      <div data-testid="alerts-count">{alerts.length}</div>
    </div>
  ),
}))
vi.mock('@/components/orders/OrderItemsTable', () => ({
  OrderItemsTable: ({ items }: any) => (
    <div data-testid="order-items">
      <div data-testid="items-count">{items.length}</div>
    </div>
  ),
}))

describe('OrderDetailPage', () => {
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
    React.createElement(
      BrowserRouter,
      {},
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    )

  const renderWithRoute = (orderNumber: string) => {
    return render(
      React.createElement(
        Routes,
        {},
        React.createElement(Route, {
          path: '/orders/:orderNumber',
          element: React.createElement(OrderDetailPage),
        }),
        React.createElement(Route, {
          path: '/',
          element: React.createElement('div', {}, 'Home'),
        })
      ),
      {
        wrapper,
        // @ts-ignore
        location: `/orders/${orderNumber}`,
      }
    )
  }

  it('should render loading state', () => {
    vi.mocked(useOrderDetail).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any)

    renderWithRoute('EXP-2026-001')

    expect(screen.getAllByTestId(/skeleton/i).length).toBeGreaterThan(0)
  })

  it('should render order detail when data is loaded', async () => {
    const mockOrder = {
      id: 1,
      order_number: 'EXP-2026-001',
      customer: 'Cliente ABC',
      warehouse_id: 1,
      warehouse: {
        id: 1,
        code: 'CENTRO',
        name: 'Centro',
      },
      status: 'in_progress' as const,
      user: {
        id: 5,
        name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'employee',
      },
      started_at: '2026-03-09T10:30:00Z',
      created_at: '2026-03-09T08:00:00Z',
      updated_at: '2026-03-09T10:30:00Z',
      items: [
        {
          id: 1,
          order_id: 1,
          product_code: 'PROD-001',
          product_name: 'Product 1',
          quantity: 10,
          picked_quantity: 5,
          location: 'A-01-03',
          status: 'partial' as const,
        },
      ],
      alerts: [],
    }

    vi.mocked(useOrderDetail).mockReturnValue({
      data: mockOrder,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderWithRoute('EXP-2026-001')

    await waitFor(() => {
      expect(screen.getByTestId('order-number')).toHaveTextContent('EXP-2026-001')
      expect(screen.getByTestId('customer')).toHaveTextContent('Cliente ABC')
      expect(screen.getByTestId('employee-name')).toHaveTextContent('Juan Pérez')
      expect(screen.getByTestId('items-count')).toHaveTextContent('1')
    })
  })

  it('should show error state on API error', () => {
    const mockError = new Error('Order not found')

    vi.mocked(useOrderDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
    } as any)

    renderWithRoute('EXP-2026-999')

    expect(screen.getByText('Error al cargar el pedido')).toBeInTheDocument()
    expect(screen.getByText(/No se pudo encontrar el pedido solicitado/)).toBeInTheDocument()
  })

  it('should render empty employee when no user assigned', async () => {
    const mockOrder = {
      id: 1,
      order_number: 'EXP-2026-001',
      customer: 'Cliente ABC',
      warehouse_id: 1,
      warehouse: {
        id: 1,
        code: 'CENTRO',
        name: 'Centro',
      },
      status: 'pending' as const,
      user: null,
      created_at: '2026-03-09T08:00:00Z',
      updated_at: '2026-03-09T08:00:00Z',
      items: [],
      alerts: [],
    }

    vi.mocked(useOrderDetail).mockReturnValue({
      data: mockOrder,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderWithRoute('EXP-2026-001')

    await waitFor(() => {
      expect(screen.getByTestId('employee-assignment')).toBeInTheDocument()
    })
  })

  it('should render alerts when present', async () => {
    const mockOrder = {
      id: 1,
      order_number: 'EXP-2026-001',
      customer: 'Cliente ABC',
      warehouse_id: 1,
      warehouse: {
        id: 1,
        code: 'CENTRO',
        name: 'Centro',
      },
      status: 'in_progress' as const,
      user: null,
      created_at: '2026-03-09T08:00:00Z',
      updated_at: '2026-03-09T10:30:00Z',
      items: [],
      alerts: [
        {
          id: 1,
          order_id: 1,
          type: 'stock_issue',
          message: 'Stock insuficiente',
          severity: 'warning',
          created_at: '2026-03-09T10:00:00Z',
        },
      ],
    }

    vi.mocked(useOrderDetail).mockReturnValue({
      data: mockOrder,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderWithRoute('EXP-2026-001')

    await waitFor(() => {
      expect(screen.getByTestId('alerts-count')).toHaveTextContent('1')
    })
  })
})
