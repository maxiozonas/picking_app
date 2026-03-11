import { cn } from '@/lib/utils'
import { CheckCircle2, Package, PlayCircle, ClipboardCheck } from 'lucide-react'
import type { PickingOrderEvent } from '@/types/api'

interface OrderActivityLogProps {
  events: PickingOrderEvent[]
  className?: string
}

const eventConfig = {
  order_started: {
    icon: PlayCircle,
    color: 'text-blue-400',
    dot: 'bg-blue-500',
    label: 'Pedido iniciado',
  },
  item_picked: {
    icon: Package,
    color: 'text-red-400',
    dot: 'bg-red-400',
    label: 'Items pickeados',
  },
  item_completed: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    dot: 'bg-emerald-500',
    label: 'Item completado',
  },
  order_completed: {
    icon: ClipboardCheck,
    color: 'text-emerald-400',
    dot: 'bg-emerald-500',
    label: 'Pedido completado',
  },
} as const

function getConfig(eventType: string) {
  return (
    eventConfig[eventType as keyof typeof eventConfig] ?? {
      icon: Package,
      color: 'text-muted-foreground',
      dot: 'bg-muted-foreground',
      label: eventType,
    }
  )
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return iso
  }
}

export function OrderActivityLog({ events, className }: OrderActivityLogProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-surface p-5', className)}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Actividad
      </h3>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin actividad registrada.</p>
      ) : (
        <ol className="relative ml-2 space-y-0 border-l border-border">
          {events.map((event, idx) => {
            const cfg = getConfig(event.event_type)
            const Icon = cfg.icon
            const isLast = idx === events.length - 1
            return (
              <li key={event.id} className={cn('ml-4', isLast ? 'pb-0' : 'pb-4')}>
                {/* dot on timeline */}
                <span
                  className={cn(
                    'absolute -left-[5px] flex h-2.5 w-2.5 items-center justify-center rounded-full ring-2 ring-surface',
                    cfg.dot
                  )}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2">
                    <Icon className={cn('mt-0.5 h-3.5 w-3.5 flex-shrink-0', cfg.color)} />
                    <div className="min-w-0">
                      <p className="text-sm leading-snug text-foreground">{event.message}</p>
                      {event.user && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{event.user.name}</p>
                      )}
                    </div>
                  </div>
                  <span className="flex-shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                    {formatTime(event.created_at)}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
