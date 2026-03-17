import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OrdersTable } from './OrdersTable'
import type { PickingOrder } from '@/types/api'

vi.mock('./OrderStatusBadge', () => ({
  OrderStatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}))

vi.mock('./OrderActions', () => ({
  OrderActions: ({ orderNumber }: { orderNumber: string }) => (
    <div data-testid={`order-actions-${orderNumber}`}>actions</div>
  ),
}))

const baseOrder: PickingOrder = {
  order_number: 'NP 623202',
  customer: 'Cliente ABC',
  status: 'pending',
  warehouse_id: 1,
  warehouse: { id: 1, code: '001', name: 'Don Bosco' },
  assigned_to: { id: 10, name: 'Juan Perez' },
  delivery_type: 'EXPEDICION',
  items_count: 4,
  flexxus_created_at: '2026-03-09T08:00:00Z',
  started_at: '2026-03-09T09:10:00Z',
  completed_at: null,
}

describe('OrdersTable', () => {
  it('renders the compact summary by default', () => {
    render(<OrdersTable orders={[baseOrder]} />)

    expect(screen.getByText('NP 623202')).toBeInTheDocument()
    expect(screen.getByText('Cliente ABC')).toBeInTheDocument()
    expect(screen.getByText('Juan Perez')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ver mas/i })).toBeInTheDocument()
    expect(screen.queryByTestId('order-expanded-NP 623202')).not.toBeInTheDocument()
  })

  it('expands and collapses row details on demand', () => {
    render(<OrdersTable orders={[baseOrder]} />)

    fireEvent.click(screen.getByRole('button', { name: /Ver mas/i }))

    expect(screen.getByTestId('order-expanded-NP 623202')).toBeInTheDocument()
    expect(screen.getByText('Vista detallada para seguimiento sin inflar la tabla principal.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ver menos/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Ver menos/i }))

    expect(screen.queryByTestId('order-expanded-NP 623202')).not.toBeInTheDocument()
  })
})
