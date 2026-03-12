import { Building2, Clock, CheckCircle } from 'lucide-react'
import { WarehouseStats as WarehouseStatsType, getWarehouseColor } from '@/types/api'
import { Skeleton } from '@/components/ui/skeleton'

interface WarehouseStatsProps {
  stats?: WarehouseStatsType[]
  isLoading?: boolean
}

export function WarehouseStats({ stats, isLoading }: WarehouseStatsProps) {
  if (isLoading) {
    return <WarehouseStatsSkeleton />
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
          Estadísticas por Depósito
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No hay datos disponibles para el periodo seleccionado.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
          Estadísticas por Depósito
        </h2>
      </div>
      <div className="divide-y divide-border">
        {stats.map((warehouse) => {
          const warehouseColor = warehouse.warehouse_code
            ? getWarehouseColor(warehouse.warehouse_code)
            : undefined

          return (
            <div
              key={warehouse.warehouse_id}
              className="flex items-center justify-between px-4 py-3 transition-all duration-[var(--transition-fast)] hover:bg-surface-elevated"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded"
                  style={{
                    backgroundColor: warehouseColor ? `${warehouseColor.replace(')', ') / 0.15')}` : 'hsl(218 11% 13%)',
                    color: warehouseColor || 'hsl(214 8% 52%)',
                  }}
                >
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p
                    className="font-medium text-foreground text-sm"
                    style={{
                      color: warehouseColor || undefined,
                    }}
                  >
                    {warehouse.warehouse_name}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {warehouse.warehouse_code}
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="text-center">
                  <p className="font-display text-lg font-bold tabular-nums text-foreground">
                    {warehouse.total_orders}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-lg font-bold tabular-nums text-blue-400">
                    {warehouse.in_progress_count}
                  </p>
                  <p className="flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground uppercase tracking-wide">
                    <Clock className="h-2.5 w-2.5" />
                    <span>En Proc</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-display text-lg font-bold tabular-nums text-emerald-400">
                    {warehouse.completed_count}
                  </p>
                  <p className="flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground uppercase tracking-wide">
                    <CheckCircle className="h-2.5 w-2.5" />
                    <span>Compl</span>
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WarehouseStatsSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <Skeleton className="h-4 w-40 bg-surface-elevated" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between px-4 py-3">
          <Skeleton className="h-8 w-36 bg-surface-elevated" />
          <Skeleton className="h-7 w-44 bg-surface-elevated" />
        </div>
      ))}
    </div>
  )
}

