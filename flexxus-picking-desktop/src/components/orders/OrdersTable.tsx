import { Fragment, useState } from 'react'
import { PickingOrder } from '@/types/api'
import { OrderStatusBadge } from './OrderStatusBadge'
import { OrderActions } from './OrderActions'
import { Button } from '@/components/ui/button'
import { CalendarDays, ChevronDown, ChevronUp, Clock3, Truck, User } from 'lucide-react'

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

function formatDateFull(dateString?: string | null): string {
  if (!dateString) {
    return 'Sin dato'
  }

  return new Date(dateString).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DateSummary({
  label,
  value,
  emptyLabel,
}: {
  label: string
  value?: string | null
  emptyLabel: string
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface-elevated/60 px-2 py-1 text-[11px] text-muted-foreground">
      <Clock3 className="h-3 w-3" />
      <span className="font-medium text-foreground/80">{label}</span>
      <span>{value ? formatDateRelative(value) : emptyLabel}</span>
    </span>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-md border border-border/70 bg-surface-elevated/50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  )
}

export function OrdersTable({ orders, onRefresh, isLoading = false, className }: OrdersTableProps) {
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})

  const toggleExpanded = (orderNumber: string) => {
    setExpandedOrders((current) => ({
      ...current,
      [orderNumber]: !current[orderNumber],
    }))
  }

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="space-y-px">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0"
            >
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
        <p className="mt-1 text-sm">Intenta ajustar los filtros de busqueda</p>
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border border-border bg-surface ${className ?? ''}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              {['Numero', 'Cliente', 'Deposito', 'Estado', 'Resumen operativo', ''].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => {
              const isExpanded = expandedOrders[order.order_number] ?? false

              return (
                <Fragment key={order.order_number}>
                  <tr className="align-top transition-colors hover:bg-surface-elevated/40">
                    <td className="px-4 py-2.5">
                      <div className="space-y-1">
                        <span className="font-mono text-sm font-semibold text-foreground">
                          {order.order_number}
                        </span>
                        {typeof order.items_count === 'number' && (
                          <p className="text-xs text-muted-foreground">
                            {order.items_count} item{order.items_count === 1 ? '' : 's'}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">
                      <div className="space-y-1">
                        <p className="font-medium leading-5 text-foreground">
                          {order.customer ?? <span className="italic text-muted-foreground/60">Sin cliente</span>}
                        </p>
                        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Truck className="h-3 w-3" />
                          {order.delivery_type ?? 'Tipo sin resolver'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">
                      {order.warehouse?.name || `Deposito ${order.warehouse_id}`}
                    </td>
                    <td className="px-4 py-2.5">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {order.assigned_to?.name ?? 'Sin asignar'}
                          </span>
                          <DateSummary
                            label="ERP"
                            value={order.flexxus_created_at}
                            emptyLabel="Sin fecha"
                          />
                          <DateSummary
                            label="Picking"
                            value={order.started_at}
                            emptyLabel="Sin iniciar"
                          />
                          {order.completed_at && (
                            <DateSummary
                              label="Cierre"
                              value={order.completed_at}
                              emptyLabel="Sin cierre"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(order.order_number)}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="mr-1 h-3.5 w-3.5" />
                                Ver menos
                              </>
                            ) : (
                              <>
                                <ChevronDown className="mr-1 h-3.5 w-3.5" />
                                Ver mas
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <OrderActions orderNumber={order.order_number} onRefresh={onRefresh} />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr data-testid={`order-expanded-${order.order_number}`} className="bg-surface-elevated/20">
                      <td colSpan={6} className="px-4 pb-3 pt-0">
                        <div className="grid gap-2 border-t border-border/60 pt-3 md:grid-cols-3">
                          <DetailItem
                            label="Pedido Flexxus"
                            value={formatDateFull(order.flexxus_created_at)}
                          />
                          <DetailItem
                            label="Inicio picking"
                            value={formatDateFull(order.started_at)}
                          />
                          <DetailItem
                            label="Completado"
                            value={formatDateFull(order.completed_at)}
                          />
                          <DetailItem
                            label="Asignado a"
                            value={order.assigned_to?.name ?? 'Sin asignar'}
                          />
                          <DetailItem
                            label="Deposito"
                            value={order.warehouse?.name || `Deposito ${order.warehouse_id ?? 'sin definir'}`}
                          />
                          <DetailItem
                            label="Entrega"
                            value={order.delivery_type ?? 'Tipo sin resolver'}
                          />
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Vista detallada para seguimiento sin inflar la tabla principal.
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
