import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas por Depósito</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay datos disponibles para el periodo seleccionado.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas por Depósito</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((warehouse) => (
            <div
              key={warehouse.warehouse_id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{warehouse.warehouse_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {warehouse.warehouse_code}
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-sm font-medium">{warehouse.total_orders}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-yellow-600">
                    {warehouse.in_progress_count}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    En Proceso
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-green-600">
                    {warehouse.completed_count}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Completados
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function WarehouseStatsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas por Depósito</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <Skeleton className="h-4 w-8 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-4 w-8 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-4 w-8 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
