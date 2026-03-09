import React, { useState } from 'react'
import { useOrders } from '@/hooks/use-orders'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { OrderFilters } from '@/components/orders/OrderFilters'
import { OrderStatus } from '@/types/api'
import { useQueryClient } from '@tanstack/react-query'

export function OrdersPage() {
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  // Debounce search to avoid excessive API calls
  const [debouncedSearch, setDebouncedSearch] = useState('')
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
      setCurrentPage(1) // Reset to first page on search
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue])

  const { data, isLoading, isError, error } = useOrders({
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page: currentPage,
  })

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] })
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">Gestión de pedidos de picking</p>
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
      <div>
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">Gestión de pedidos de picking</p>
      </div>

      <OrderFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <OrdersTable
        orders={data?.data || []}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      {/* Pagination */}
      {data && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {data.data.length} de {data.meta.total} pedidos
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded border px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="flex items-center px-3 text-sm">
              Página {currentPage} de {data.meta.last_page}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(data.meta.last_page, p + 1))}
              disabled={currentPage === data.meta.last_page}
              className="rounded border px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
