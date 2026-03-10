import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useStats } from '@/hooks/use-stats'
import { StatsCards, WarehouseSelector, DateRangePicker, WarehouseStats } from '@/components/dashboard'
import { toast } from '@/hooks/use-toast'

export function DashboardPage() {
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  const { data: stats, isLoading, error, refetch } = useStats(dateFrom, dateTo)

  const handleRefresh = () => {
    refetch()
    toast({
      title: 'Actualizando...',
      description: 'Las estadísticas se están actualizando',
    })
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Resumen de operaciones del picking</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-red-400">Error al cargar las estadísticas: {error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded border border-red-500/30 bg-transparent px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Resumen de operaciones del picking</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded border border-border bg-surface px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <WarehouseSelector />
        <DateRangePicker
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />
      </div>

      {/* Statistics Cards */}
      <StatsCards stats={stats} isLoading={isLoading} />

      {/* Warehouse Breakdown */}
      <WarehouseStats stats={stats?.by_warehouse} isLoading={isLoading} />
    </div>
  )
}
