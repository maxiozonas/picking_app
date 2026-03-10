import { useState } from 'react'
import { AlertTriangle, AlertCircle, Info, Clock as ClockIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PickingAlert } from '@/types/api'
import { AlertTimelineModal } from './AlertTimelineModal'

interface OrderAlertsProps {
  alerts: PickingAlert[]
  className?: string
}

const alertConfig = {
  high: {
    icon: AlertCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/5',
    borderColor: 'border-red-500/20',
    badge: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/5',
    borderColor: 'border-amber-500/20',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  low: {
    icon: Info,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/5',
    borderColor: 'border-blue-500/20',
    badge: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
} as const

function getAlertConfig(severity: string) {
  return alertConfig[severity as keyof typeof alertConfig] ?? alertConfig.medium
}

export function OrderAlerts({ alerts, className }: OrderAlertsProps) {
  const [showTimeline, setShowTimeline] = useState(false)

  // Get the latest alert by created_at
  const latestAlert = alerts.length > 0
    ? [...alerts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null

  return (
    <>
      <div className={cn('rounded-lg border border-border bg-surface p-5', className)}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Última Alerta
            {alerts.length > 0 && (
              <span className="ml-2 rounded bg-surface-elevated px-1.5 py-0.5 font-mono text-xs">
                {alerts.length}
              </span>
            )}
          </p>
          {alerts.length > 1 && (
            <button
              onClick={() => setShowTimeline(true)}
              className="flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ClockIcon className="h-3 w-3" />
              Ver timeline ({alerts.length})
            </button>
          )}
        </div>

        {!latestAlert ? (
          <p className="text-sm text-muted-foreground">Sin actividad registrada</p>
        ) : (
          (() => {
            const config = getAlertConfig(latestAlert.severity)
            const Icon = config.icon
            const isResolved = latestAlert.status === 'resolved' || latestAlert.resolved_at != null

            return (
              <div
                className={cn(
                  'flex gap-3 rounded border p-3',
                  config.bgColor,
                  config.borderColor
                )}
              >
                <Icon className={cn('h-4 w-4 flex-shrink-0 mt-0.5', config.color)} />
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-foreground/90">{latestAlert.message}</p>
                    {isResolved && (
                      <span className={cn('flex-shrink-0 rounded border px-1.5 py-0.5 text-xs', config.badge)}>
                        Resuelta
                      </span>
                    )}
                  </div>
                  {latestAlert.product_code && (
                    <p className="font-mono text-xs text-muted-foreground">{latestAlert.product_code}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(latestAlert.created_at).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            )
          })()
        )}

        {alerts.length === 1 && (
          <button
            onClick={() => setShowTimeline(true)}
            className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <ClockIcon className="h-3 w-3" />
            Ver timeline
          </button>
        )}
      </div>

      <AlertTimelineModal
        alerts={alerts}
        open={showTimeline}
        onClose={() => setShowTimeline(false)}
      />
    </>
  )
}
