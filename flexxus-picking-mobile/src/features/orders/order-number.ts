import type { PendingOrder } from './types'

type PendingOrderRef = Pick<PendingOrder, 'orderType' | 'orderNumber'>

export function buildOrderNumber(orderType: string, orderNumber: string): string {
  return `${orderType}-${orderNumber}`
}

export function buildPendingOrderNumber(order: PendingOrderRef): string {
  return buildOrderNumber(order.orderType, order.orderNumber)
}

export function matchesPendingOrderNumber(order: PendingOrderRef, fullOrderNumber: string): boolean {
  return buildPendingOrderNumber(order) === fullOrderNumber
}
