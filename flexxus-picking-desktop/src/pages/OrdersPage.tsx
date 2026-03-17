import React, { useState } from 'react'
import { usePendingOrders } from '@/hooks/use-pending-orders'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { OrderFilters } from '@/components/orders/OrderFilters'
import { WarehouseSelector } from '@/components/dashboard/WarehouseSelector'
import { OrderStatus } from '@/types/api'
import { useWarehouseFilterStore } from '@/contexts/WarehouseFilterContext'
import api from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export function OrdersPage() {
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const queryClient = useQueryClient()
  const selectedWarehouseId = useWarehouseFilterStore((state) => state.selectedWarehouseId)

  const [debouncedSearch, setDebouncedSearch] = useState('')
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue])

  const { data, isLoading, isPlaceholderData, isError, error } = usePendingOrders({
    search: debouncedSearch || undefined,
    status: statusFilter,
    page: currentPage,
  })

  const handleRefresh = async () => {
    if (isRefreshing) {
      return
    }

    setIsRefreshing(true)
    try {
      await api.post('/admin/pending-orders/refresh', {
        warehouse_id: selectedWarehouseId ?? undefined,
      })
    } finally {
      await queryClient.invalidateQueries({ queryKey: ['pending-orders'] })
      setIsRefreshing(false)
    }
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground">
            Pedidos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestión de pedidos de picking</p>
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
            Pedidos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestión de pedidos de picking</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 rounded border border-border bg-surface px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
        {data && !isPlaceholderData && (
          <div className="text-right">
            <p className="font-display text-2xl font-bold tabular-nums text-primary">
              {data.meta.total}
            </p>
            <p className="text-xs text-muted-foreground">
              pedido{data.meta.total !== 1 ? 's' : ''} totales
            </p>
          </div>
        )}
      </div>

      <div className="flex items-end gap-4">
        <WarehouseSelector />
        <div className="flex-1">
          <OrderFilters
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </div>
      </div>

      <OrdersTable
        orders={data?.data || []}
        isLoading={isLoading || isPlaceholderData || isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Pagination */}
      {data && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {data.data.length} de {data.meta.total} pedidos
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-sm tabular-nums text-muted-foreground">
              {currentPage} / {data.meta.last_page}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(data.meta.last_page, p + 1))}
              disabled={currentPage === data.meta.last_page}
              className="rounded border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
