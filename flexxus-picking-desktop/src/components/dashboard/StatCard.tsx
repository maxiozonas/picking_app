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
  accent?: 'blue' | 'green' | 'red' | 'amber'
  className?: string
}

const accentMap = {
  blue: {
    icon: 'text-blue-400',
    value: 'text-blue-400',
    glow: 'bg-blue-400/10 border-blue-400/20',
    corner: 'border-blue-400/30',
  },
  green: {
    icon: 'text-emerald-400',
    value: 'text-emerald-400',
    glow: 'bg-emerald-400/10 border-emerald-400/20',
    corner: 'border-emerald-400/30',
  },
  red: {
    icon: 'text-red-400',
    value: 'text-red-400',
    glow: 'bg-red-400/10 border-red-400/20',
    corner: 'border-red-400/30',
  },
  amber: {
    icon: 'text-amber-400',
    value: 'text-amber-400',
    glow: 'bg-amber-400/10 border-amber-400/20',
    corner: 'border-amber-400/30',
  },
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  accent = 'red',
  className,
}: StatCardProps) {
  const colors = accentMap[accent]

  return (
    <div
      className={cn(
        'relative rounded-lg border border-border bg-surface p-5',
        'transition-all duration-[var(--transition-normal)]',
        'hover:border-border/60 hover:-translate-y-0.5 hover:shadow-md',
        className
      )}
    >
      {/* Corner Accents - Industrial Tech Feel */}
      <div className="pointer-events-none absolute top-0 left-0 h-2 w-2 border-l-2 border-t-2 opacity-40" style={{ borderColor: `hsl(${colors.corner.replace('border-', '').replace('/30', '')})` }} />
      <div className="pointer-events-none absolute top-0 right-0 h-2 w-2 border-r-2 border-t-2 opacity-40" style={{ borderColor: `hsl(${colors.corner.replace('border-', '').replace('/30', '')})` }} />
      <div className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-l-2 border-b-2 opacity-40" style={{ borderColor: `hsl(${colors.corner.replace('border-', '').replace('/30', '')})` }} />
      <div className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-r-2 border-b-2 opacity-40" style={{ borderColor: `hsl(${colors.corner.replace('border-', '').replace('/30', '')})` }} />

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

      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}

      {trend && (
        <p
          className={cn(
            'mt-2 text-xs font-medium flex items-center gap-1',
            trend.isPositive ? 'text-emerald-400' : 'text-red-400'
          )}
        >
          <span className="text-base leading-none">
            {trend.isPositive ? '▲' : '▼'}
          </span>
          <span>{Math.abs(trend.value)}%</span>
        </p>
      )}
    </div>
  )
}
