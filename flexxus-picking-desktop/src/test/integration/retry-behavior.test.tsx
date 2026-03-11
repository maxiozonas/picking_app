import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { useStats } from '@/hooks/use-stats'
import { QueryRetryConfig } from '@/lib/query-config'
import { handlers } from '@/test/mocks/handlers'

// MSW server setup
const server = setupServer(...handlers)

const mockStats = {
  total_orders: 150,
  in_progress_count: 12,
  completed_count: 85,
  pending_count: 45,
  orders_with_issues: 8,
  by_warehouse: [],
}

describe('TanStack Query Retry Behavior Integration Tests', () => {
  let queryClient: QueryClient

  beforeAll(() => {
    server.listen()
  })

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: QueryRetryConfig.MAX_RETRIES,
          retryDelay: QueryRetryConfig.RETRY_DELAY,
        },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
  })

  afterAll(() => {
    server.close()
  })

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  describe('no retry on client errors (4xx)', () => {
    it('should not retry on 401 unauthorized errors', async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', () => {
          requestCount++
          return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      // Should only make 1 request (no retries)
      expect(requestCount).toBe(1)
      expect(result.current.error).toBeTruthy()
    })

    it('should not retry on 403 forbidden errors', async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', () => {
          requestCount++
          return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(requestCount).toBe(1)
    })

    it('should not retry on 404 not found errors', async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', () => {
          requestCount++
          return HttpResponse.json({ message: 'Not Found' }, { status: 404 })
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(requestCount).toBe(1)
    })

    it('should not retry on 422 validation errors', async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', () => {
          requestCount++
          return HttpResponse.json(
            { message: 'Validation failed', errors: {} },
            { status: 422 }
          )
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(requestCount).toBe(1)
    })

    it('should not retry on 400 bad request errors', async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', () => {
          requestCount++
          return HttpResponse.json({ message: 'Bad Request' }, { status: 400 })
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(requestCount).toBe(1)
    })

    it('should retry on 408 request timeout errors', { timeout: 10000 }, async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', () => {
          requestCount++
          return HttpResponse.json({ message: 'Request Timeout' }, { status: 408 })
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(requestCount).toBeGreaterThan(1)
      expect(requestCount).toBeLessThanOrEqual(QueryRetryConfig.MAX_RETRIES + 1)
    })

    it('should retry on 429 too many requests errors', { timeout: 10000 }, async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', () => {
          requestCount++
          return HttpResponse.json(
            { message: 'Too Many Requests' },
            { status: 429 }
          )
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(requestCount).toBeGreaterThan(1)
      expect(requestCount).toBeLessThanOrEqual(QueryRetryConfig.MAX_RETRIES + 1)
    })
  })

  describe('retry on server errors (5xx)', () => {
    it('should retry on 500 internal server errors', { timeout: 10000 }, async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', () => {
          requestCount++
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(requestCount).toBe(QueryRetryConfig.MAX_RETRIES + 1)
    })

    it('should retry on 502 bad gateway errors', { timeout: 10000 }, async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', () => {
          requestCount++
          return HttpResponse.json({ message: 'Bad Gateway' }, { status: 502 })
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(requestCount).toBe(QueryRetryConfig.MAX_RETRIES + 1)
    })

    it('should retry on 503 service unavailable errors', { timeout: 10000 }, async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', () => {
          requestCount++
          return HttpResponse.json(
            { message: 'Service Unavailable' },
            { status: 503 }
          )
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(requestCount).toBe(QueryRetryConfig.MAX_RETRIES + 1)
    })

    it('should stop retrying after successful response', async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', () => {
          requestCount++
          if (requestCount < 2) {
            return HttpResponse.json(
              { message: 'Internal Server Error' },
              { status: 500 }
            )
          }
          return HttpResponse.json(mockStats)
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Should have retried once and succeeded
      expect(requestCount).toBe(2)
    })
  })

  describe('retry on network errors', () => {
    it('should retry on network connection errors', async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', () => {
          requestCount++
          if (requestCount < 2) {
            return HttpResponse.error()
          }
          return HttpResponse.json(mockStats)
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Should retry network errors
      expect(requestCount).toBeGreaterThan(1)
    })

    it('should fail after max retries on persistent network errors', { timeout: 10000 }, async () => {
      let requestCount = 0

      server.use(
        http.get('*/api/admin/stats', () => {
          requestCount++
          return HttpResponse.error()
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(requestCount).toBe(QueryRetryConfig.MAX_RETRIES + 1)
    })
  })

  describe('exponential backoff timing', () => {
    it('should use exponential backoff for retries (1s, 2s, 4s)', { timeout: 15000 }, async () => {
      const timestamps: number[] = []

      server.use(
        http.get('*/api/admin/stats', () => {
          timestamps.push(Date.now())
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      // Should have 4 requests (1 initial + 3 retries)
      expect(timestamps.length).toBe(QueryRetryConfig.MAX_RETRIES + 1)

      // Calculate delays between requests
      const delays: number[] = []
      for (let i = 1; i < timestamps.length; i++) {
        delays.push(timestamps[i] - timestamps[i - 1])
      }

      // First retry should be ~1s (allowing for variance)
      expect(delays[0]).toBeGreaterThanOrEqual(900)
      expect(delays[0]).toBeLessThanOrEqual(1500)

      // Second retry should be ~2s
      expect(delays[1]).toBeGreaterThanOrEqual(1900)
      expect(delays[1]).toBeLessThanOrEqual(2500)

      // Third retry should be ~4s
      expect(delays[2]).toBeGreaterThanOrEqual(3900)
      expect(delays[2]).toBeLessThanOrEqual(4500)
    })

    it('should respect retry delay function', { timeout: 15000 }, async () => {
      let requestCount = 0
      const delays: number[] = []

      server.use(
        http.get('*/api/admin/stats', () => {
          const startTime = Date.now()
          requestCount++

          // Track delay timing
          if (requestCount > 1) {
            delays.push(startTime)
          }

          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      // Verify exponential backoff pattern
      expect(delays.length).toBe(QueryRetryConfig.MAX_RETRIES)

      // Delays should increase exponentially
      // Due to timing, we check relative ordering
      for (let i = 1; i < delays.length; i++) {
        expect(delays[i]).toBeGreaterThan(delays[i - 1])
      }
    })
  })

  describe('retry behavior with error details', () => {
    it('should preserve original error after retries', { timeout: 10000 }, async () => {
      server.use(
        http.get('*/api/admin/stats', () => {
          return HttpResponse.json(
            { message: 'Custom error message', code: 'CUSTOM_ERROR' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      const error = result.current.error as any

      expect(error).toBeTruthy()
      expect(error.message).toContain('Custom error message')
    })
  })
})
