import { StatCard } from './StatCard'
import { Package, CheckCircle, Clock, Users } from 'lucide-react'
import { DashboardStats } from '@/types/api'

interface StatsCardsProps {
  stats?: DashboardStats
  isLoading?: boolean
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const pendingOrders = stats
    ? stats.total_orders - stats.completed_count - stats.in_progress_count
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Pedidos"
        value={stats?.total_orders ?? 0}
        icon={Package}
        description="Pedidos del periodo"
      />
      <StatCard
        title="En Proceso"
        value={stats?.in_progress_count ?? 0}
        icon={Clock}
        description="Pedidos activos"
      />
      <StatCard
        title="Completados"
        value={stats?.completed_count ?? 0}
        icon={CheckCircle}
        description="Pedidos terminados"
      />
      <StatCard
        title="Pendientes"
        value={pendingOrders}
        icon={Users}
        description="Sin asignar"
      />
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="p-6 border rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
      </div>
      <div className="h-8 w-16 bg-muted animate-pulse rounded" />
      <div className="h-3 w-32 bg-muted animate-pulse rounded" />
    </div>
  )
}
