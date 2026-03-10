import { AlertTriangle, AlertCircle, Info, X, Clock, CheckCircle2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PickingAlert } from '@/types/api'

interface AlertTimelineModalProps {
  alerts: PickingAlert[]
  open: boolean
  onClose: () => void
}

const alertConfig = {
  high: {
    icon: AlertCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/5',
    borderColor: 'border-red-500/20',
    lineColor: 'bg-red-500/40',
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/5',
    borderColor: 'border-amber-500/20',
    lineColor: 'bg-amber-500/40',
  },
  low: {
    icon: Info,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/5',
    borderColor: 'border-blue-500/20',
    lineColor: 'bg-blue-500/40',
  },
} as const

function getConfig(severity: string) {
  return alertConfig[severity as keyof typeof alertConfig] ?? alertConfig.medium
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AlertTimelineModal({ alerts, open, onClose }: AlertTimelineModalProps) {
  if (!open) return null

  const sorted = [...alerts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[80vh] rounded-lg border border-border bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
              Timeline de Alertas
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {sorted.length} alerta{sorted.length !== 1 ? 's' : ''} registrada{sorted.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <CheckCircle2 className="mb-2 h-8 w-8 opacity-40" />
              <p className="text-sm">Sin actividad registrada</p>
            </div>
          ) : (
            <div className="relative space-y-0">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

              {sorted.map((alert) => {
                const config = getConfig(alert.severity)
                const Icon = config.icon
                const isResolved = alert.status === 'resolved' || alert.resolved_at != null

                return (
                  <div key={alert.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Dot */}
                    <div
                      className={cn(
                        'relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border',
                        isResolved
                          ? 'border-emerald-500/30 bg-emerald-500/10'
                          : config.borderColor + ' ' + config.bgColor
                      )}
                    >
                      {isResolved ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Icon className={cn('h-4 w-4', config.color)} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5 pt-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-foreground/90">{alert.message}</p>
                        {isResolved && (
                          <span className="flex-shrink-0 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-400">
                            Resuelta
                          </span>
                        )}
                      </div>

                      {alert.product_code && (
                        <p className="font-mono text-xs text-muted-foreground">
                          Producto: {alert.product_code}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(alert.created_at)}
                        </span>
                        {alert.user && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {alert.user.name}
                          </span>
                        )}
                      </div>

                      {isResolved && alert.resolved_at && (
                        <div className="mt-1 rounded border border-emerald-500/10 bg-emerald-500/5 px-2.5 py-1.5 text-xs">
                          <span className="text-emerald-400">Resuelta: </span>
                          <span className="text-muted-foreground">{formatDate(alert.resolved_at)}</span>
                          {alert.resolution_notes && (
                            <p className="mt-0.5 text-muted-foreground">{alert.resolution_notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
