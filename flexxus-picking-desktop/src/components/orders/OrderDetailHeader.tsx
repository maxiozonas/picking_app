import { OrderStatusBadge } from './OrderStatusBadge'
import { OrderStatus } from '@/types/api'
import { Building2, Calendar, Clock, Package } from 'lucide-react'

interface OrderDetailHeaderProps {
  orderNumber: string
  customer: string
  warehouseName: string
  status: OrderStatus
  createdAt: string
  startedAt?: string
  completedAt?: string
  totalItems?: number
  pickedItems?: number
  completedPercentage?: number
}

export function OrderDetailHeader({
  orderNumber,
  customer,
  warehouseName,
  status,
  createdAt,
  startedAt,
  completedAt,
  totalItems = 0,
  pickedItems = 0,
  completedPercentage = 0,
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

          {customer && <p className="text-base font-medium text-foreground/80">{customer}</p>}

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

        <div className="flex-shrink-0 space-y-1.5 text-right">
          {/* Items progress */}
          <div className="mb-2 flex items-center justify-end gap-2">
            <Package className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-sm font-bold tabular-nums text-foreground">
              {pickedItems}/{totalItems}
            </span>
            <span className="text-xs text-muted-foreground">items</span>
          </div>
          {totalItems > 0 && (
            <div className="flex items-center justify-end gap-2">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className={`h-full rounded-full transition-all ${
                    completedPercentage >= 100
                      ? 'bg-emerald-500'
                      : completedPercentage > 0
                        ? 'bg-red-400'
                        : 'bg-border'
                  }`}
                  style={{ width: `${Math.min(100, completedPercentage)}%` }}
                />
              </div>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {completedPercentage.toFixed(0)}%
              </span>
            </div>
          )}
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
              <span className="font-medium tabular-nums text-emerald-400">
                {formatDate(completedAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
