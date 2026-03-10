import React, { useState } from 'react'
import { useInventory, useStockSearch } from '@/hooks/use-inventory'
import { useQueryClient } from '@tanstack/react-query'
import { Search, RefreshCw, Package, Warehouse, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react'
import type { InventoryItem } from '@/types/api'

function stockLevelClass(total: number, ordersUsing: number): string {
  if (total === 0) return 'text-red-400'
  if (ordersUsing > 0 && total < ordersUsing * 2) return 'text-amber-400'
  return 'text-emerald-400'
}

function StockBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const color = pct === 0 ? 'bg-red-500' : pct < 50 ? 'bg-amber-400' : 'bg-emerald-500'
  return (
    <div className="h-1.5 w-20 rounded-full bg-surface-elevated overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

interface InventoryRowProps {
  item: InventoryItem
}

function InventoryRow({ item }: InventoryRowProps) {
  const levelClass = stockLevelClass(item.stock_total, item.orders_using)
  const isLow = item.stock_total === 0 || (item.orders_using > 0 && item.stock_total < item.orders_using * 2)

  return (
    <tr className="border-b border-border hover:bg-surface-elevated/50 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {isLow ? (
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          ) : (
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          )}
          <span className="font-mono text-sm font-medium text-foreground">{item.product_code}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs">
        <span className="line-clamp-2">{item.description || '—'}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Warehouse className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{item.warehouse_name}</p>
            <p className="text-xs text-muted-foreground font-mono">{item.warehouse_code}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex flex-col items-end gap-1">
          <span className={`font-display text-lg font-bold tabular-nums ${levelClass}`}>
            {item.stock_total}
          </span>
          <StockBar value={item.stock_total} max={Math.max(item.stock_total, item.orders_using * 3, 10)} />
        </div>
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-sm text-muted-foreground">
        {item.stock_real}
      </td>
      <td className="px-4 py-3 text-center">
        {item.location ? (
          <span className="inline-flex items-center rounded border border-border bg-surface-elevated px-2 py-0.5 text-xs font-mono text-muted-foreground">
            {item.location}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {item.orders_using > 0 ? (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 text-xs font-medium">
            <Package className="h-3 w-3" />
            {item.orders_using}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">0</span>
        )}
      </td>
    </tr>
  )
}

export function InventoryPage() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [warehouseId] = useState<number | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setCurrentPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const isSearching = debouncedSearch.trim().length >= 2

  const listQuery = useInventory({
    warehouseId,
    page: currentPage,
    perPage: 25,
  })

  const searchQuery = useStockSearch({
    productCode: debouncedSearch,
    warehouseId,
    enabled: isSearching,
  })

  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading
  const isError = isSearching ? searchQuery.isError : listQuery.isError
  const error = isSearching ? searchQuery.error : listQuery.error

  const items: InventoryItem[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.data ?? [])

  const meta = !isSearching ? listQuery.data?.meta : undefined

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] })
  }

  // Summary stats from list
  const outOfStock = items.filter((i) => i.stock_total === 0).length
  const lowStock = items.filter(
    (i) => i.stock_total > 0 && i.orders_using > 0 && i.stock_total < i.orders_using * 2
  ).length
  const totalProducts = meta?.total ?? items.length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground">
            Inventario
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stock en tiempo real desde Flexxus ERP
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded border border-border bg-surface px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Productos Activos
            </span>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-foreground tabular-nums">
            {totalProducts}
          </p>
          <p className="text-xs text-muted-foreground">en pedidos activos</p>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Stock Bajo
            </span>
            <TrendingDown className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-amber-400 tabular-nums">
            {lowStock}
          </p>
          <p className="text-xs text-muted-foreground">menos del doble de demanda</p>
        </div>

        <div className="rounded-lg border border-red-500/20 bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sin Stock
            </span>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-red-400 tabular-nums">
            {outOfStock}
          </p>
          <p className="text-xs text-muted-foreground">stock total = 0</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por código de producto..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded border border-border bg-surface py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
        {isSearching && (
          <span className="text-sm text-muted-foreground">
            Buscando "{debouncedSearch}"
          </span>
        )}
      </div>

      {/* Error state */}
      {isError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div>
              <p className="font-medium text-red-400">Error al cargar inventario</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Error desconocido'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        {/* Legend */}
        <div className="flex items-center gap-6 border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Stock OK
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Stock Bajo
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Sin Stock
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-px">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="h-4 w-24 animate-pulse rounded bg-surface-elevated" />
                <div className="h-4 flex-1 animate-pulse rounded bg-surface-elevated" />
                <div className="h-4 w-20 animate-pulse rounded bg-surface-elevated" />
                <div className="h-4 w-12 animate-pulse rounded bg-surface-elevated" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <CheckCircle className="mb-3 h-8 w-8 opacity-40" />
            <p className="font-medium">
              {isSearching ? 'Sin resultados para esa búsqueda' : 'No hay productos en pedidos activos'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Código
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Depósito
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Stock Total
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Stock Real
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ubicación
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    En Pedidos
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <InventoryRow key={`${item.product_code}-${item.warehouse_code}-${idx}`} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {items.length} de {meta.total} productos
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
                {currentPage} / {meta.last_page}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={currentPage === meta.last_page}
                className="rounded border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
