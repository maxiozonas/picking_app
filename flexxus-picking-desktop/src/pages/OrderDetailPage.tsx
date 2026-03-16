import { useParams } from 'react-router-dom'
import { useOrderDetail } from '@/hooks/use-orders'
import { OrderDetailHeader } from '@/components/orders/OrderDetailHeader'
import { EmployeeAssignment } from '@/components/orders/EmployeeAssignment'
import { OrderItemsTable } from '@/components/orders/OrderItemsTable'
import { OrderAlerts } from '@/components/orders/OrderAlerts'
import { OrderActivityLog } from '@/components/orders/OrderActivityLog'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-24 w-full rounded-lg bg-surface" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-28 rounded-lg bg-surface" />
        <div className="h-28 rounded-lg bg-surface" />
      </div>
      <div className="h-64 rounded-lg bg-surface" />
    </div>
  )
}

export function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const { data: order, isLoading, isError, error } = useOrderDetail(orderNumber || '')

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded bg-surface" />
        <DetailSkeleton />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-5">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div>
            <p className="font-medium text-red-400">Error al cargar el pedido</p>
            <p className="text-sm text-muted-foreground">
              {error?.message || 'No se pudo encontrar el pedido solicitado'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          to="/orders"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Pedidos
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-mono text-sm font-medium text-foreground">{orderNumber}</span>
      </div>

      <OrderDetailHeader
        orderNumber={order.order_number}
        customer={order.customer ?? ''}
        warehouseName={order.warehouse?.name || `Depósito ${order.warehouse_id}`}
        status={order.status}
        deliveryType={order.delivery_type}
        flexxusCreatedAt={order.flexxus_created_at}
        startedAt={order.started_at}
        completedAt={order.completed_at}
        totalItems={order.total_items ?? order.items?.length ?? 0}
        pickedItems={order.picked_items ?? 0}
        completedPercentage={order.completed_percentage ?? 0}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <EmployeeAssignment employee={order.assigned_to} />
        <OrderAlerts alerts={order.alerts || []} />
      </div>

      <OrderActivityLog events={order.events || []} />

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Items del Pedido
          <span className="ml-2 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-xs">
            {order.items?.length ?? 0}
          </span>
        </p>
        <OrderItemsTable items={order.items || []} />
      </div>
    </div>
  )
}
