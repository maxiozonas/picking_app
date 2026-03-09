import { Badge } from '@/components/ui/badge'
import { OrderStatus } from '@/types/api'
import { cn } from '@/lib/utils'

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }
> = {
  pending: {
    label: 'Pendiente',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  },
  in_progress: {
    label: 'En Proceso',
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  completed: {
    label: 'Completado',
    variant: 'outline',
    className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300',
  },
  cancelled: {
    label: 'Cancelado',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
