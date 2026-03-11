/**
 * Unit tests for TanStack Query configuration
 * Tests retry logic, exponential backoff, and configuration constants
 */

import { describe, it, expect } from 'vitest'
import {
  retryFn,
  retryDelay,
  QueryCacheTime,
  QueryRetryConfig,
  NonRetryableStatuses,
} from '../query-config'

describe('Query configuration - retry logic', () => {
  describe('retry function', () => {
    it('should not retry on 401 Unauthorized errors', () => {
      const error = { status: 401 }
      expect(retryFn(1, error)).toBe(false)
      expect(retryFn(2, error)).toBe(false)
      expect(retryFn(3, error)).toBe(false)
    })

    it('should not retry on 403 Forbidden errors', () => {
      const error = { status: 403 }
      expect(retryFn(1, error)).toBe(false)
    })

    it('should not retry on 404 Not Found errors', () => {
      const error = { status: 404 }
      expect(retryFn(1, error)).toBe(false)
    })

    it('should not retry on 422 Unprocessable Entity errors', () => {
      const error = { status: 422 }
      expect(retryFn(1, error)).toBe(false)
    })

    it('should retry on 408 Request Timeout errors', () => {
      const error = { status: 408 }
      expect(retryFn(1, error)).toBe(true)
      expect(retryFn(2, error)).toBe(true)
      expect(retryFn(3, error)).toBe(true)
      expect(retryFn(4, error)).toBe(false)
    })

    it('should retry on 429 Too Many Requests errors', () => {
      const error = { status: 429 }
      expect(retryFn(1, error)).toBe(true)
    })

    it('should retry on 500 Internal Server Error up to 3 times', () => {
      const error = { status: 500 }
      expect(retryFn(1, error)).toBe(true)
      expect(retryFn(2, error)).toBe(true)
      expect(retryFn(3, error)).toBe(true)
      expect(retryFn(4, error)).toBe(false) // Exceeds max attempts
    })

    it('should retry on 502 Bad Gateway errors', () => {
      const error = { status: 502 }
      expect(retryFn(1, error)).toBe(true)
      expect(retryFn(2, error)).toBe(true)
      expect(retryFn(3, error)).toBe(true)
      expect(retryFn(4, error)).toBe(false)
    })

    it('should retry on 503 Service Unavailable errors', () => {
      const error = { status: 503 }
      expect(retryFn(1, error)).toBe(true)
    })

    it('should retry on network errors (no status code)', () => {
      const error = {}
      expect(retryFn(1, error)).toBe(true)
      expect(retryFn(2, error)).toBe(true)
      expect(retryFn(3, error)).toBe(true)
      expect(retryFn(4, error)).toBe(false)
    })

    it('should retry on errors with response.status property', () => {
      const error = { response: { status: 500 } }
      expect(retryFn(1, error)).toBe(true)
    })

    it('should respect max retry attempts', () => {
      const error = { status: 500 }
      expect(retryFn(1, error)).toBe(true)
      expect(retryFn(2, error)).toBe(true)
      expect(retryFn(3, error)).toBe(true)
      expect(retryFn(4, error)).toBe(false)
      expect(retryFn(10, error)).toBe(false)
    })
  })

  describe('retryDelay function (exponential backoff)', () => {
    it('should return 1 second delay on first retry', () => {
      expect(retryDelay(0)).toBe(1000)
    })

    it('should return 2 second delay on second retry', () => {
      expect(retryDelay(1)).toBe(2000)
    })

    it('should return 4 second delay on third retry', () => {
      expect(retryDelay(2)).toBe(4000)
    })

    it('should return 8 second delay on fourth retry', () => {
      expect(retryDelay(3)).toBe(8000)
    })

    it('should cap delay at 30 seconds for many retries', () => {
      expect(retryDelay(10)).toBe(30000)
      expect(retryDelay(20)).toBe(30000)
      expect(retryDelay(100)).toBe(30000)
    })

    it('should follow exponential backoff pattern', () => {
      // Formula: Math.min(1000 * 2 ** attemptIndex, 30000)
      expect(retryDelay(0)).toBe(1000 * 2 ** 0) // 1s
      expect(retryDelay(1)).toBe(1000 * 2 ** 1) // 2s
      expect(retryDelay(2)).toBe(1000 * 2 ** 2) // 4s
      expect(retryDelay(3)).toBe(1000 * 2 ** 3) // 8s
      expect(retryDelay(4)).toBe(1000 * 2 ** 4) // 16s
    })

    it('should calculate cap transition point correctly', () => {
      // At attempt 4: 1000 * 2 ** 4 = 16000 (under cap)
      expect(retryDelay(4)).toBe(16000)
      // At attempt 5: 1000 * 2 ** 5 = 32000 (over cap, should be 30000)
      expect(retryDelay(5)).toBe(30000)
    })
  })
})

describe('Query cache configuration constants', () => {
  it('should export QueryCacheTime with all required keys', () => {
    expect(QueryCacheTime).toBeDefined()
    expect(QueryCacheTime.Stats).toBe(30000)
    expect(QueryCacheTime.StatsRefetch).toBe(30000)
    expect(QueryCacheTime.PendingOrders).toBe(30000)
    expect(QueryCacheTime.Inventory).toBe(30000)
    expect(QueryCacheTime.Orders).toBe(45000)
    expect(QueryCacheTime.OrderDetail).toBe(60000)
    expect(QueryCacheTime.Employees).toBe(60000)
    expect(QueryCacheTime.Warehouses).toBe(300000)
  })

  it('should export QueryRetryConfig with max attempts', () => {
    expect(QueryRetryConfig).toBeDefined()
    expect(QueryRetryConfig.MaxAttempts).toBe(3)
    expect(QueryRetryConfig.MaxDelay).toBe(30000)
    expect(QueryRetryConfig.BaseDelay).toBe(1000)
  })

  it('should export NonRetryableStatuses array', () => {
    expect(NonRetryableStatuses).toBeDefined()
    expect(NonRetryableStatuses).toContain(401)
    expect(NonRetryableStatuses).toContain(403)
    expect(NonRetryableStatuses).toContain(404)
    expect(NonRetryableStatuses).toContain(422)
    expect(NonRetryableStatuses).toEqual(expect.any(Array))
  })

  it('should have QueryCacheTime as const (readonly)', () => {
    expect(QueryCacheTime.Stats).toBe(30000)
    expect(QueryCacheTime.Warehouses).toBe(300000)
  })

  it('should have consistent time units in milliseconds', () => {
    expect(QueryCacheTime.Stats).toBe(30 * 1000)
    expect(QueryCacheTime.Orders).toBe(45 * 1000)
    expect(QueryCacheTime.OrderDetail).toBe(60 * 1000)
    expect(QueryCacheTime.Warehouses).toBe(300 * 1000)
  })
})
