import React, { useState } from 'react'
import { AlertTriangle, CalendarRange, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { DateRangePicker } from '@/components/dashboard/DateRangePicker'
import { WarehouseSelector } from '@/components/dashboard/WarehouseSelector'
import { useOrders } from '@/hooks/use-orders'
import { getLastDaysRange } from '@/lib/date-range'

export function CompletedOrdersPage() {
  const [defaultRange] = useState(() => getLastDaysRange(30))
  const [searchValue, setSearchValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom)
  const [dateTo, setDateTo] = useState(defaultRange.dateTo)
  const queryClient = useQueryClient()

  const [debouncedSearch, setDebouncedSearch] = useState('')
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue])

  const { data, isLoading, isPlaceholderData, isError, error } = useOrders({
    search: debouncedSearch || undefined,
    status: 'completed',
    page: currentPage,
    dateFrom,
    dateTo,
  })

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['orders'] })
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground">
            Completados
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Historial de pedidos cerrados para seguimiento administrativo
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-5">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div>
            <p className="font-medium text-red-400">Error al cargar pedidos completados</p>
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground">
            Completados
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Historial de pedidos cerrados para seguimiento administrativo
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded border border-border bg-surface px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
          {data && !isPlaceholderData && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-right">
              <p className="font-display text-2xl font-bold tabular-nums text-emerald-400">
                {data.meta.total}
              </p>
              <p className="text-xs text-muted-foreground">
                pedido{data.meta.total !== 1 ? 's' : ''} completado{data.meta.total !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-1 flex-col gap-4">
            <div className="relative max-w-xl">
              <input
                type="text"
                placeholder="Buscar por numero de pedido o cliente..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full rounded border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300">
                <CalendarRange className="h-3.5 w-3.5" />
                Ultimos 30 dias
              </span>
              <span>Estado fijo: completado</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <DateRangePicker
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={(value) => {
                setDateFrom(value)
                setCurrentPage(1)
              }}
              onDateToChange={(value) => {
                setDateTo(value)
                setCurrentPage(1)
              }}
            />
            <div className="min-w-[220px]">
              <WarehouseSelector />
            </div>
          </div>
        </div>
      </div>

      <OrdersTable
        orders={data?.data || []}
        isLoading={isLoading || isPlaceholderData}
        onRefresh={handleRefresh}
      />

      {data && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Pagina {data.meta.current_page} de {data.meta.last_page}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage((page) => Math.min(data.meta.last_page, page + 1))}
              disabled={currentPage === data.meta.last_page}
              className="rounded border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompletedOrdersPage
