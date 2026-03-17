import type { InfiniteData } from '@tanstack/react-query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { patchInfiniteQueryItem } from '../../app/queryClient'
import { useAuthStore } from '../../stores/auth-store'
import { completeOrder, getItemStock, getOrderDetail, getOrderStockValidations, pickOrderItem, startOrder } from './api'
import type { ItemStockInfo, OrderDetail, PickItem, PickMutationResult, StockValidation } from './types'
import { pendingOrdersQueryKeys } from '../orders/hooks'
import { matchesPendingOrderNumber } from '../orders/order-number'
import type { PendingOrder, PendingOrdersResponse } from '../orders/types'

type PendingOrdersInfiniteData = InfiniteData<PendingOrdersResponse>

export const pickingQueryKeys = {
  detail: (orderNumber: string) => ['order-detail', orderNumber] as const,
  itemStock: (orderNumber: string, productCode: string) => ['order-stock', orderNumber, productCode] as const,
  stockValidations: (orderNumber: string) => ['order-stock-validations', orderNumber] as const,
}

function patchPendingOrders(
  queryClient: ReturnType<typeof useQueryClient>,
  matcher: (order: PendingOrder) => boolean,
  updater: (order: PendingOrder) => PendingOrder,
) {
  const entries = queryClient.getQueriesData<PendingOrdersInfiniteData>({ queryKey: pendingOrdersQueryKeys.all })

  for (const [queryKey, data] of entries) {
    queryClient.setQueryData<PendingOrdersInfiniteData | undefined>(queryKey, (current) =>
      patchInfiniteQueryItem<PendingOrdersResponse, PendingOrder>(current ?? data ?? undefined, matcher, updater),
    )
  }
}

function patchOrderDetailItem(detail: OrderDetail, productCode: string, updater: (item: PickItem) => PickItem): OrderDetail {
  const items = detail.items.map((item) => (item.productCode === productCode ? updater(item) : item))
  const pickedItems = items.filter((item) => item.status === 'completed').length

  return {
    ...detail,
    items,
    pickedItems,
    completedPercentage: detail.totalItems > 0 ? Number(((pickedItems / detail.totalItems) * 100).toFixed(2)) : 0,
  }
}

function applyStartState(detail: OrderDetail, userName: string | null, userId: number | null): OrderDetail {
  return {
    ...detail,
    status: 'in_progress',
    startedAt: detail.startedAt ?? new Date().toISOString(),
    assignedTo: {
      id: userId,
      name: userName,
    },
  }
}

function applyPickMutation(detail: OrderDetail, result: PickMutationResult): OrderDetail {
  return patchOrderDetailItem(detail, result.productCode, (item) => ({
    ...item,
    quantityPicked: result.quantityPicked,
    status: result.status,
    stockInfo: result.stockValidation
      ? {
          availableQuantity: result.stockAfterPick ?? result.stockValidation.availableQty,
          location: item.stockInfo?.location ?? item.location,
          lastUpdated: result.stockValidation.validatedAt,
        }
      : item.stockInfo,
  }))
}

export function useOrderDetail(orderNumber: string) {
  return useQuery({
    queryKey: pickingQueryKeys.detail(orderNumber),
    queryFn: () => getOrderDetail(orderNumber),
    staleTime: 15000,
  })
}

export function useItemStock(orderNumber: string, productCode: string, enabled: boolean) {
  return useQuery<ItemStockInfo>({
    queryKey: pickingQueryKeys.itemStock(orderNumber, productCode),
    queryFn: () => getItemStock(orderNumber, productCode),
    enabled,
    staleTime: 15000,
  })
}

export function useOrderStockValidations(orderNumber: string, enabled = true) {
  return useQuery<StockValidation[]>({
    queryKey: pickingQueryKeys.stockValidations(orderNumber),
    queryFn: () => getOrderStockValidations(orderNumber),
    enabled,
    staleTime: 10000,
  })
}

export function useStartOrderMutation(orderNumber: string) {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: () => startOrder(orderNumber),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: pickingQueryKeys.detail(orderNumber) })

      const previousDetail = queryClient.getQueryData<OrderDetail>(pickingQueryKeys.detail(orderNumber))

      if (previousDetail) {
        queryClient.setQueryData<OrderDetail>(
          pickingQueryKeys.detail(orderNumber),
          applyStartState(previousDetail, user?.name ?? null, user?.id ?? null),
        )
      }

      return { previousDetail }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(pickingQueryKeys.detail(orderNumber), context.previousDetail)
      }
    },
    onSuccess: (order) => {
      patchPendingOrders(queryClient, (current) => matchesPendingOrderNumber(current, orderNumber), () => order)
      void queryClient.invalidateQueries({ queryKey: pickingQueryKeys.detail(orderNumber) })
      void queryClient.invalidateQueries({ queryKey: pendingOrdersQueryKeys.all })
    },
  })
}

export function usePickItemMutation(orderNumber: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productCode, quantity }: { productCode: string; quantity: number }) =>
      pickOrderItem(orderNumber, productCode, quantity),
    onMutate: async ({ productCode, quantity }) => {
      await queryClient.cancelQueries({ queryKey: pickingQueryKeys.detail(orderNumber) })

      const previousDetail = queryClient.getQueryData<OrderDetail>(pickingQueryKeys.detail(orderNumber))

      if (previousDetail) {
        queryClient.setQueryData<OrderDetail>(pickingQueryKeys.detail(orderNumber), (current) => {
          if (!current) {
            return current
          }

          return patchOrderDetailItem(current, productCode, (item) => {
            const nextPicked = Math.min(item.quantityRequired, item.quantityPicked + quantity)
            const nextStatus = nextPicked >= item.quantityRequired ? 'completed' : 'in_progress'

            return {
              ...item,
              quantityPicked: nextPicked,
              status: nextStatus,
            }
          })
        })
      }

      return { previousDetail }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(pickingQueryKeys.detail(orderNumber), context.previousDetail)
      }
    },
    onSuccess: (result) => {
      let nextPickedItems: number | null = null

      queryClient.setQueryData<OrderDetail>(pickingQueryKeys.detail(orderNumber), (current) => {
        if (!current) {
          return current
        }

        const nextDetail = applyPickMutation(current, result)
        nextPickedItems = nextDetail.pickedItems

        return nextDetail
      })

      patchPendingOrders(queryClient, (order) => matchesPendingOrderNumber(order, orderNumber), (order) => ({
        ...order,
        status: order.status === 'pending' ? 'in_progress' : order.status,
        itemsPicked: nextPickedItems ?? order.itemsPicked,
      }))

      if (result.stockValidation) {
        queryClient.setQueryData<StockValidation[]>(pickingQueryKeys.stockValidations(orderNumber), (current = []) => {
          const nextValidation: StockValidation = {
            id: Date.now(),
            productCode: result.productCode,
            requestedQty: result.quantityRequired - result.remaining,
            availableQty: result.stockValidation?.availableQty ?? 0,
            validated: result.stockValidation?.validated ?? true,
            validatedAt: result.stockValidation?.validatedAt ?? null,
            errorCode: result.stockValidation?.errorCode ?? null,
          }

          return [nextValidation, ...current.filter((validation) => validation.productCode !== result.productCode)]
        })
      }

      void queryClient.invalidateQueries({ queryKey: pendingOrdersQueryKeys.all, refetchType: 'active' })
    },
  })
}

export function useCompleteOrderMutation(orderNumber: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => completeOrder(orderNumber),
    onSuccess: (order) => {
      patchPendingOrders(queryClient, (current) => matchesPendingOrderNumber(current, orderNumber), () => order)
      void queryClient.invalidateQueries({ queryKey: pickingQueryKeys.detail(orderNumber) })
      void queryClient.invalidateQueries({ queryKey: pendingOrdersQueryKeys.all })
    },
  })
}
