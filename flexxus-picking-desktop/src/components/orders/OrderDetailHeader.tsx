import { Card, CardContent } from '@/components/ui/card'
import { OrderStatusBadge } from './OrderStatusBadge'
import { OrderStatus } from '@/types/api'

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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{orderNumber}</h2>
              <OrderStatusBadge status={status} />
            </div>
            <p className="text-lg text-muted-foreground">{customer}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Depósito: {warehouseName}</span>
              <span>•</span>
              <span>Creado: {formatDate(createdAt)}</span>
            </div>
          </div>

          <div className="text-right text-sm">
            {startedAt && (
              <div className="mb-1">
                <span className="text-muted-foreground">Inicio: </span>
                <span className="font-medium">{formatDate(startedAt)}</span>
              </div>
            )}
            {completedAt && (
              <div>
                <span className="text-muted-foreground">Finalizado: </span>
                <span className="font-medium">{formatDate(completedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
