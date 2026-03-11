import { OrderStatus } from '@/types/api'
import { cn } from '@/lib/utils'

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pendiente',
    className: 'border-border/60 bg-surface-elevated text-muted-foreground',
  },
  in_progress: {
    label: 'En Proceso',
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  completed: {
    label: 'Completado',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
  has_issues: {
    label: 'Con Alertas',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pending

  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
