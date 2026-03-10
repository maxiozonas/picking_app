import { OrderStatusBadge } from './OrderStatusBadge'
import { OrderActions } from './OrderActions'
import { PickingOrder } from '@/types/api'

interface OrdersTableProps {
  orders: PickingOrder[]
  onRefresh?: () => void
  isLoading?: boolean
  className?: string
}

function formatDateRelative(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora mismo'
  if (diffMins < 60) return `Hace ${diffMins}m`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`

  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function OrdersTable({ orders, onRefresh, isLoading = false, className }: OrdersTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <div className="space-y-px">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-border last:border-0">
              <div className="h-4 w-28 animate-pulse rounded bg-surface-elevated" />
              <div className="h-4 flex-1 animate-pulse rounded bg-surface-elevated" />
              <div className="h-5 w-20 animate-pulse rounded bg-surface-elevated" />
              <div className="h-4 w-20 animate-pulse rounded bg-surface-elevated" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface py-16 text-muted-foreground">
        <p className="font-medium">No se encontraron pedidos</p>
        <p className="mt-1 text-sm">Intenta ajustar los filtros de búsqueda</p>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border border-border bg-surface overflow-hidden ${className ?? ''}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              {['Número', 'Cliente', 'Depósito', 'Estado', 'Empleado', 'Inicio', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-surface-elevated/60 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {order.order_number}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {order.customer ?? <span className="italic opacity-50">—</span>}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {order.warehouse?.name || `Depósito ${order.warehouse_id}`}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {order.assigned_to?.name ?? <span className="italic opacity-50">—</span>}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">
                  {order.started_at ? formatDateRelative(order.started_at) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <OrderActions orderNumber={order.order_number} onRefresh={onRefresh} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
