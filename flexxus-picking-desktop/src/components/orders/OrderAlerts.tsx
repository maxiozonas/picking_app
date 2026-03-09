import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PickingAlert {
  id: number
  order_id: number
  type: string
  message: string
  severity: 'warning' | 'error' | 'info'
  created_at: string
  resolved_at?: string
}

interface OrderAlertsProps {
  alerts: PickingAlert[]
  className?: string
}

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
}

export function OrderAlerts({ alerts, className }: OrderAlertsProps) {
  if (alerts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay alertas para este pedido
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Alertas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const config = alertConfig[alert.severity]
          const Icon = config.icon

          return (
            <div
              key={alert.id}
              className={cn(
                'flex gap-3 rounded-lg border p-3',
                config.bgColor,
                config.borderColor
              )}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.color)} />
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{alert.message}</p>
                  {alert.resolved_at && (
                    <Badge variant="outline" className="flex-shrink-0">
                      Resuelta
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(alert.created_at).toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
