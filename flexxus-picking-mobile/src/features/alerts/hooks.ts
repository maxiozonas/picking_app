import { useMutation, useQueryClient } from '@tanstack/react-query'

import { pendingOrdersQueryKeys } from '../orders/hooks'
import { pickingQueryKeys } from '../picking/hooks'
import type { OrderDetail } from '../picking/types'
import { createOrderAlert } from './api'
import type { CreateAlertInput, PickingAlert } from './types'
import { useUserChannel } from '../../hooks/use-websocket'
import { useAuthStore } from '../../stores/auth-store'

export const alertsQueryKeys = {
  all: ['order-alerts'] as const,
  list: (orderNumber: string) => ['order-alerts', orderNumber] as const,
}

/**
 * Hook for listening to personal alerts via WebSocket
 *
 * Subscribes to private-user.{userId} channel for real-time stock alerts
 * and order assignments.
 */
export function usePersonalAlerts(options?: {
  onStockAlert?: (alert: PickingAlert) => void
  onOrderAssigned?: (order: any) => void
}) {
  const user = useAuthStore((state) => state.user)
  const userId = user?.id ?? null

  useUserChannel(userId, {
    enabled: !!userId,
    onStockAlert: options?.onStockAlert,
    onOrderAssigned: options?.onOrderAssigned,
  })
}

function mergeAlert(detail: OrderDetail, alert: PickingAlert): OrderDetail {
  const alerts = [alert, ...detail.alerts.filter((current) => current.id !== alert.id)].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )

  return {
    ...detail,
    alerts,
  }
}

export function useCreateAlertMutation(orderNumber: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAlertInput) => createOrderAlert(orderNumber, input),
    onSuccess: (alert) => {
      queryClient.setQueryData<OrderDetail>(pickingQueryKeys.detail(orderNumber), (current) => {
        if (!current) {
          return current
        }

        return mergeAlert(current, alert)
      })

      void queryClient.invalidateQueries({
        queryKey: pickingQueryKeys.detail(orderNumber),
        refetchType: 'active',
      })
      void queryClient.invalidateQueries({ queryKey: alertsQueryKeys.list(orderNumber) })
      void queryClient.invalidateQueries({ queryKey: pendingOrdersQueryKeys.all, refetchType: 'active' })
    },
  })
}
