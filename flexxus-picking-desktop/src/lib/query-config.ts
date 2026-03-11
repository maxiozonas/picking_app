/**
 * TanStack Query cache configuration constants
 * Centralized configuration for consistent cache behavior across hooks
 */

export const QueryCacheTime = {
  Stats: 30000,
  StatsRefetch: 30000,
  PendingOrders: 30000,
  Inventory: 30000,
  Orders: 45000,
  OrderDetail: 60000,
  Employees: 60000,
  Warehouses: 300000,
  StockSearch: 30000,
} as const

export const QueryRetryConfig = {
  MaxAttempts: 3,
  MaxDelay: 30000,
  BaseDelay: 1000,
} as const

export const NonRetryableStatuses = [401, 403, 404, 422] as const

interface ErrorWithStatus {
  status?: number
  response?: { status?: number }
}

export function retryFn(failureCount: number, error: unknown): boolean {
  const err = error as ErrorWithStatus
  const status = err?.status || err?.response?.status

  if (
    typeof status === 'number' &&
    NonRetryableStatuses.includes(status as 401 | 403 | 404 | 422)
  ) {
    return false
  }

  if (status === 408 || status === 429) {
    return failureCount <= QueryRetryConfig.MaxAttempts
  }

  if (typeof status === 'number' && status >= 400 && status < 500) {
    return false
  }

  return failureCount <= QueryRetryConfig.MaxAttempts
}

export function retryDelay(attemptIndex: number): number {
  return Math.min(QueryRetryConfig.BaseDelay * 2 ** attemptIndex, QueryRetryConfig.MaxDelay)
}
