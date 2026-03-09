import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de operaciones del picking</p>
        </div>
        <div className="p-6 border border-red-200 bg-red-50 rounded-lg">
          <p className="text-red-800">Error al cargar las estadísticas: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de operaciones del picking</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
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
