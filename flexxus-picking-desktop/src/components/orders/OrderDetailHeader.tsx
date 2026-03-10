import { OrderStatusBadge } from './OrderStatusBadge'
import { OrderStatus } from '@/types/api'
import { Building2, Calendar, Clock } from 'lucide-react'

interface OrderDetailHeaderProps {
  orderNumber: string
  customer: string
  warehouseName: string
  status: OrderStatus
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export function OrderDetailHeader({
  orderNumber,
  customer,
  warehouseName,
  status,
  createdAt,
  startedAt,
  completedAt,
}: OrderDetailHeaderProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
              {orderNumber}
            </h2>
            <OrderStatusBadge status={status} />
          </div>

          {customer && (
            <p className="text-base text-foreground/80 font-medium">{customer}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {warehouseName}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Creado: {formatDate(createdAt)}
            </span>
          </div>
        </div>

        <div className="text-right space-y-1.5 flex-shrink-0">
          {startedAt && (
            <div className="flex items-center justify-end gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Inicio:</span>
              <span className="font-medium tabular-nums">{formatDate(startedAt)}</span>
            </div>
          )}
          {completedAt && (
            <div className="flex items-center justify-end gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-muted-foreground">Finalizado:</span>
              <span className="font-medium text-emerald-400 tabular-nums">{formatDate(completedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
