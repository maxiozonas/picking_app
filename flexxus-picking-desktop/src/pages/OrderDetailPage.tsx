import { useParams } from 'react-router-dom'
import { useOrderDetail } from '@/hooks/use-orders'
import { OrderDetailHeader } from '@/components/orders/OrderDetailHeader'
import { EmployeeAssignment } from '@/components/orders/EmployeeAssignment'
import { OrderItemsTable } from '@/components/orders/OrderItemsTable'
import { OrderAlerts } from '@/components/orders/OrderAlerts'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

export function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const { data: order, isLoading, isError, error } = useOrderDetail(orderNumber || '')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pedido {orderNumber}</h1>
          <p className="text-muted-foreground">Detalles del pedido de picking</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pedido {orderNumber}</h1>
          <p className="text-muted-foreground">Detalles del pedido de picking</p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h2 className="text-lg font-semibold">Error al cargar el pedido</h2>
              <p className="text-sm">
                {error?.message || 'No se pudo encontrar el pedido solicitado'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <OrderDetailHeader
        orderNumber={order.order_number}
        customer={order.customer}
        warehouseName={order.warehouse?.name || `Depósito ${order.warehouse_id}`}
        status={order.status}
        createdAt={order.created_at}
        startedAt={order.started_at}
        completedAt={order.completed_at}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <EmployeeAssignment employee={order.user} />

        <OrderAlerts alerts={order.alerts || []} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Items del Pedido</h2>
        <OrderItemsTable items={order.items || []} />
      </div>
    </div>
  )
}
