import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
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
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-32 animate-pulse rounded bg-muted" />
                <div className="h-12 flex-1 animate-pulse rounded bg-muted" />
                <div className="h-12 w-24 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (orders.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <p className="text-lg font-medium text-muted-foreground">No se encontraron pedidos</p>
          <p className="text-sm text-muted-foreground">
            Intenta ajustar los filtros de búsqueda
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Depósito</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Empleado</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead className="w-24 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {order.order_number}
                  </TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    {order.warehouse?.name || `Depósito ${order.warehouse_id}`}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.user?.name ?? '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.started_at ? formatDateRelative(order.started_at) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <OrderActions orderNumber={order.order_number} onRefresh={onRefresh} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
