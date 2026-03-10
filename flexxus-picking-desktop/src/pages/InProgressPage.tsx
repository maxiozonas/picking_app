import { OrdersTable } from '@/components/orders/OrdersTable'
import { useOrders } from '@/hooks/use-orders'
import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'

export function InProgressPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useOrders({
    status: 'in_progress',
  })

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] })
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground">
            En Proceso
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seguimiento de pedidos actualmente en preparación
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-5">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div>
            <p className="font-medium text-red-400">Error al cargar pedidos</p>
            <p className="text-sm text-muted-foreground">
              {error?.message || 'Ha ocurrido un error desconocido'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground">
            En Proceso
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seguimiento de pedidos actualmente en preparación
          </p>
        </div>
        {data && (
          <div className="text-right">
            <p className="font-display text-2xl font-bold tabular-nums text-blue-400">
              {data.meta.total}
            </p>
            <p className="text-xs text-muted-foreground">
              pedido{data.meta.total !== 1 ? 's' : ''} activos
            </p>
          </div>
        )}
      </div>

      <OrdersTable orders={data?.data || []} isLoading={isLoading} onRefresh={handleRefresh} />
    </div>
  )
}
