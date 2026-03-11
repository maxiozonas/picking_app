import React, { useState, useMemo } from 'react'
import { useInventory, useStockSearch } from '@/hooks/use-inventory'
import { useQueryClient } from '@tanstack/react-query'
import { Search, RefreshCw, Package, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InventoryItem } from '@/types/api'

// ─── Stock status helpers ─────────────────────────────────────────────────────

type StockStatus = 'ok' | 'low' | 'out'

function getStockStatus(item: InventoryItem): StockStatus {
  const total = Math.max(0, item.stock_total)
  if (total === 0) return 'out'
  if (item.orders_using > 0 && total < item.orders_using * 2) return 'low'
  return 'ok'
}

const stockNumClass: Record<StockStatus, string> = {
  ok: 'text-emerald-400',
  low: 'text-amber-400',
  out: 'text-red-400',
}

// Tiny horizontal bar for each warehouse chip
function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const color = pct === 0 ? 'bg-red-500' : pct < 50 ? 'bg-amber-400' : 'bg-emerald-500'
  return (
    <div className="h-1 w-14 overflow-hidden rounded-full bg-surface-elevated">
      <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ─── Grouping logic ───────────────────────────────────────────────────────────

interface GroupedProduct {
  product_code: string
  description: string
  warehouses: InventoryItem[]
  worstStatus: StockStatus
  totalOrdersUsing: number
}

const STATUS_RANK: Record<StockStatus, number> = { ok: 0, low: 1, out: 2 }

function groupByProduct(items: InventoryItem[]): GroupedProduct[] {
  const map = new Map<string, GroupedProduct>()

  for (const item of items) {
    const existing = map.get(item.product_code)
    const status = getStockStatus(item)

    if (existing) {
      existing.warehouses.push(item)
      if (STATUS_RANK[status] > STATUS_RANK[existing.worstStatus]) {
        existing.worstStatus = status
      }
      existing.totalOrdersUsing += item.orders_using
    } else {
      map.set(item.product_code, {
        product_code: item.product_code,
        description: item.description,
        warehouses: [item],
        worstStatus: status,
        totalOrdersUsing: item.orders_using,
      })
    }
  }

  return Array.from(map.values())
}

// ─── Grouped row component ────────────────────────────────────────────────────

interface WarehouseColumn {
  code: string
  name: string
}

function GroupedInventoryRow({
  group,
  warehouseColumns,
}: {
  group: GroupedProduct
  warehouseColumns: WarehouseColumn[]
}) {
  const byWarehouse = new Map(group.warehouses.map((w) => [w.warehouse_code, w]))

  return (
    <tr className="border-b border-border transition-colors hover:bg-surface-elevated/50">
      {/* Code — no status dot */}
      <td className="px-4 py-3 align-middle">
        <span className="font-mono text-sm font-medium text-foreground">{group.product_code}</span>
      </td>

      {/* Description */}
      <td className="px-4 py-3 align-middle">
        <span className="line-clamp-2 text-sm text-muted-foreground">
          {group.description || '—'}
        </span>
      </td>

      {/* One TD per warehouse */}
      {warehouseColumns.map(({ code }) => {
        const item = byWarehouse.get(code)
        if (!item) {
          return (
            <td key={code} className="px-4 py-3 text-center align-middle">
              <span className="text-xs text-muted-foreground">—</span>
            </td>
          )
        }
        const total = Math.max(0, item.stock_total)
        const st = getStockStatus(item)
        const maxVal = Math.max(total, item.orders_using * 3, 10)
        return (
          <td key={code} className="px-4 py-3 align-middle">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'font-display text-base font-bold tabular-nums leading-none',
                  stockNumClass[st]
                )}
              >
                {total}
              </span>
              <MiniBar value={total} max={maxVal} />
              {item.location && (
                <span className="rounded border border-border px-1 font-mono text-[10px] text-muted-foreground">
                  {item.location}
                </span>
              )}
            </div>
          </td>
        )
      })}

      {/* Orders using (sum across warehouses) */}
      <td className="px-4 py-3 text-center align-middle">
        {group.totalOrdersUsing > 0 ? (
          <span className="inline-flex items-center gap-1 rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
            <Package className="h-3 w-3" />
            {group.totalOrdersUsing}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">0</span>
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

  const isLoading = isSearching ? searchQuery.isLoading : (listQuery.isLoading || listQuery.isPlaceholderData)
  const isError = isSearching ? searchQuery.isError : listQuery.isError
  const error = isSearching ? searchQuery.error : listQuery.error

  const rawItems: InventoryItem[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.data ?? [])

  const meta = !isSearching ? listQuery.data?.meta : undefined

  // Group flat rows by product_code
  const groups = useMemo(() => groupByProduct(rawItems), [rawItems])

  // Unique warehouses in appearance order — drives dynamic columns
  const warehouseColumns = useMemo(() => {
    const seen = new Map<string, string>()
    for (const item of rawItems) {
      if (!seen.has(item.warehouse_code)) seen.set(item.warehouse_code, item.warehouse_name)
    }
    return Array.from(seen.entries()).map(([code, name]) => ({ code, name }))
  }, [rawItems])

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] })
  }

  // Summary stats — unique product groups
  const outOfStock = groups.filter((g) => g.worstStatus === 'out').length
  const lowStock = groups.filter((g) => g.worstStatus === 'low').length
  const totalProducts = isSearching ? groups.length : (meta?.total ?? rawItems.length)

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
      {(!isSearching ? !listQuery.isPlaceholderData : true) && (
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Productos Activos
            </span>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground">
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
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-amber-400">
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
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-red-400">
            {outOfStock}
          </p>
          <p className="text-xs text-muted-foreground">stock total = 0</p>
        </div>
      </div>
      )}

      {/* Search bar */}
      <div className="flex items-center gap-4">
        <div className="relative max-w-md flex-1">
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
          <span className="text-sm text-muted-foreground">Buscando "{debouncedSearch}"</span>
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
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
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
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="h-4 w-24 animate-pulse rounded bg-surface-elevated" />
                <div className="h-4 flex-1 animate-pulse rounded bg-surface-elevated" />
                <div className="h-12 flex-1 animate-pulse rounded bg-surface-elevated" />
                <div className="h-4 w-10 animate-pulse rounded bg-surface-elevated" />
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <CheckCircle className="mb-3 h-8 w-8 opacity-40" />
            <p className="font-medium">
              {isSearching
                ? 'Sin resultados para esa búsqueda'
                : 'No hay productos en pedidos activos'}
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
                  {warehouseColumns.map(({ code, name }) => (
                    <th
                      key={code}
                      className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span>{name}</span>
                        <span className="font-mono text-[10px] normal-case tracking-normal text-muted-foreground/60">
                          {code}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    En Pedidos
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <GroupedInventoryRow
                    key={group.product_code}
                    group={group}
                    warehouseColumns={warehouseColumns}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {groups.length} de {meta.total} productos
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
