import { buildOrderNumber, buildPendingOrderNumber, matchesPendingOrderNumber } from './order-number'
import type { PendingOrder } from './types'

describe('order-number', () => {
  it('builds full order numbers', () => {
    expect(buildOrderNumber('NP', '123')).toBe('NP-123')
  })

  it('builds order number from pending order shape', () => {
    const order: Pick<PendingOrder, 'orderType' | 'orderNumber'> = {
      orderType: 'EXP',
      orderNumber: '2026-001',
    }

    expect(buildPendingOrderNumber(order)).toBe('EXP-2026-001')
  })

  it('matches pending order references against full order numbers', () => {
    const order: Pick<PendingOrder, 'orderType' | 'orderNumber'> = {
      orderType: 'NP',
      orderNumber: '100',
    }

    expect(matchesPendingOrderNumber(order, 'NP-100')).toBe(true)
    expect(matchesPendingOrderNumber(order, 'NP-101')).toBe(false)
  })
})
