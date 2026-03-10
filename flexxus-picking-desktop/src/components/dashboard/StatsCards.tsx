import { StatCard } from './StatCard'
import { Package, CheckCircle, Clock, Inbox } from 'lucide-react'
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
        accent="amber"
      />
      <StatCard
        title="En Proceso"
        value={stats?.in_progress_count ?? 0}
        icon={Clock}
        description="Pedidos activos"
        accent="blue"
      />
      <StatCard
        title="Completados"
        value={stats?.completed_count ?? 0}
        icon={CheckCircle}
        description="Pedidos terminados"
        accent="green"
      />
      <StatCard
        title="Pendientes"
        value={pendingOrders}
        icon={Inbox}
        description="Sin asignar"
        accent="red"
      />
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-elevated" />
        <div className="h-8 w-8 animate-pulse rounded bg-surface-elevated" />
      </div>
      <div className="h-8 w-16 animate-pulse rounded bg-surface-elevated" />
      <div className="h-3 w-28 animate-pulse rounded bg-surface-elevated" />
    </div>
  )
}
