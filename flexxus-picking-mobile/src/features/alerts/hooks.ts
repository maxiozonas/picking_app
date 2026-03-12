import { useMutation, useQueryClient } from '@tanstack/react-query'

import { pendingOrdersQueryKeys } from '../orders/hooks'
import type { OrderDetail } from '../picking/types'
import { createOrderAlert } from './api'
import type { CreateAlertInput, PickingAlert } from './types'

export const alertsQueryKeys = {
  all: ['order-alerts'] as const,
  list: (orderNumber: string) => ['order-alerts', orderNumber] as const,
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
      queryClient.setQueryData<OrderDetail>(['order-detail', orderNumber], (current) => {
        if (!current) {
          return current
        }

        return mergeAlert(current, alert)
      })

      void queryClient.invalidateQueries({ queryKey: ['order-detail', orderNumber], refetchType: 'active' })
      void queryClient.invalidateQueries({ queryKey: alertsQueryKeys.list(orderNumber) })
      void queryClient.invalidateQueries({ queryKey: pendingOrdersQueryKeys.all, refetchType: 'active' })
    },
  })
}
