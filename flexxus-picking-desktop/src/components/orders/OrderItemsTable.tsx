import { Check, Minus, AlertOctagon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PickingOrderItem } from '@/types/api'

interface OrderItemsTableProps {
  items: PickingOrderItem[]
  className?: string
}

function PickStatusIcon({ status }: { status: PickingOrderItem['status'] }) {
  switch (status) {
    case 'completed':
      return <Check className="h-3.5 w-3.5 text-emerald-400" />
    case 'in_progress':
      return <Minus className="h-3.5 w-3.5 text-amber-400" />
    case 'issue_reported':
      return <AlertOctagon className="h-3.5 w-3.5 text-red-400" />
    default:
      return <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-border" />
  }
}

export function OrderItemsTable({ items, className }: OrderItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-10 text-muted-foreground', className)}>
        <p className="text-sm">No hay items en este pedido</p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg border border-border bg-surface overflow-hidden', className)}>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="w-10 px-4 py-3" />
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Código
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Descripción
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Requerido
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pickeado
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ubicación
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => {
            const isComplete = item.status === 'completed'
            const hasIssue = item.status === 'issue_reported'

            return (
              <tr
                key={item.id}
                className={cn(
                  'transition-colors hover:bg-surface-elevated/50',
                  hasIssue && 'bg-red-500/5'
                )}
              >
                <td className="px-4 py-3">
                  <PickStatusIcon status={item.status} />
                </td>
                <td className="px-4 py-3">
                  <span className={cn('font-mono text-sm', isComplete ? 'text-muted-foreground' : 'text-foreground')}>
                    {item.product_code}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs">
                  <span className="line-clamp-1">{item.description || '—'}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono text-sm font-medium text-foreground tabular-nums">
                    {item.quantity}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      'font-mono text-sm font-medium tabular-nums',
                      item.picked_quantity >= item.quantity
                        ? 'text-emerald-400'
                        : item.picked_quantity > 0
                        ? 'text-amber-400'
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.picked_quantity}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {item.location ? (
                    <span className="inline-flex items-center rounded border border-border bg-surface-elevated px-2 py-0.5 text-xs font-mono text-muted-foreground">
                      {item.location}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
