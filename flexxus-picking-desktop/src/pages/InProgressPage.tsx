import { OrdersTable } from '@/components/orders/OrdersTable'
import { useOrders } from '@/hooks/use-orders'
import { useQueryClient } from '@tanstack/react-query'

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
          <h1 className="text-3xl font-bold">Pedidos en Proceso</h1>
          <p className="text-muted-foreground">Seguimiento de pedidos actualmente en preparación</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <h2 className="text-lg font-semibold">Error al cargar pedidos</h2>
          <p className="text-sm">{error?.message || 'Ha ocurrido un error desconocido'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pedidos en Proceso</h1>
          <p className="text-muted-foreground">Seguimiento de pedidos actualmente en preparación</p>
        </div>
        {data && (
          <div className="text-lg">
            <span className="font-semibold text-blue-600">{data.meta.total}</span>{' '}
            <span className="text-muted-foreground">
              pedido{data.meta.total !== 1 ? 's' : ''} en proceso
            </span>
          </div>
        )}
      </div>

      <OrdersTable orders={data?.data || []} isLoading={isLoading} onRefresh={handleRefresh} />
    </div>
  )
}
