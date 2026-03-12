import { STATUS_CONFIG, type OrderStatus } from '@/types/api'
import { cn } from '@/lib/utils'

interface OrderStatusBadgeProps {
  status: OrderStatus | string
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  // Use STATUS_CONFIG from types/api.ts for centralized config
  const config = STATUS_CONFIG[status as OrderStatus] ?? STATUS_CONFIG.unknown

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium',
        'transition-all duration-[var(--transition-fast)]',
        'hover:scale-105 hover:shadow-sm',
        config.pulseAnimation && 'animate-pulse-subtle',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

