import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  accent?: 'amber' | 'blue' | 'green' | 'red'
  className?: string
}

const accentMap = {
  amber: { icon: 'text-amber-400', value: 'text-amber-400', glow: 'bg-amber-400/10 border-amber-400/20' },
  blue:  { icon: 'text-blue-400',  value: 'text-blue-400',  glow: 'bg-blue-400/10 border-blue-400/20'   },
  green: { icon: 'text-emerald-400', value: 'text-emerald-400', glow: 'bg-emerald-400/10 border-emerald-400/20' },
  red:   { icon: 'text-red-400',   value: 'text-red-400',   glow: 'bg-red-400/10 border-red-400/20'     },
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  accent = 'amber',
  className,
}: StatCardProps) {
  const colors = accentMap[accent]

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border/80',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded', colors.glow)}>
          <Icon className={cn('h-4 w-4', colors.icon)} />
        </div>
      </div>

      <p className={cn('mt-3 font-display text-3xl font-bold tabular-nums', colors.value)}>
        {value}
      </p>

      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}

      {trend && (
        <p
          className={cn(
            'mt-2 text-xs font-medium',
            trend.isPositive ? 'text-emerald-400' : 'text-red-400'
          )}
        >
          {trend.isPositive ? '▲' : '▼'} {Math.abs(trend.value)}%
        </p>
      )}
    </div>
  )
}
