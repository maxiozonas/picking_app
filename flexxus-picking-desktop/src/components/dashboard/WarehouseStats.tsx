import { Building2, Clock, CheckCircle } from 'lucide-react'
import { WarehouseStats as WarehouseStatsType } from '@/types/api'
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
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
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
      <div className="border-b border-border px-5 py-3">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
          Estadísticas por Depósito
        </h2>
      </div>
      <div className="divide-y divide-border">
        {stats.map((warehouse) => (
          <div
            key={warehouse.warehouse_id}
            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-elevated"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-surface-elevated">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{warehouse.warehouse_name}</p>
                <p className="text-xs font-mono text-muted-foreground">{warehouse.warehouse_code}</p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="text-center">
                <p className="font-display text-xl font-bold tabular-nums text-foreground">{warehouse.total_orders}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-bold tabular-nums text-blue-400">
                  {warehouse.in_progress_count}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  En Proceso
                </p>
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-bold tabular-nums text-emerald-400">
                  {warehouse.completed_count}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3" />
                  Completados
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WarehouseStatsSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-5 py-3">
        <Skeleton className="h-5 w-48 bg-surface-elevated" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between px-5 py-4">
          <Skeleton className="h-10 w-40 bg-surface-elevated" />
          <Skeleton className="h-8 w-48 bg-surface-elevated" />
        </div>
      ))}
    </div>
  )
}
