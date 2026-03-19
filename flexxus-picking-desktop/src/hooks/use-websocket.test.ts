import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useWarehouseChannel } from '@/hooks/use-websocket'
import echo from '@/lib/echo'
import { useAuthStore } from '@/stores/auth-store'

// Mock echo module
vi.mock('@/lib/echo', () => ({
  default: {
    private: vi.fn(),
    leave: vi.fn(),
  },
}))

// Mock auth store
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(),
}))

describe('useWebSocket hooks', () => {
  let queryClient: QueryClient
  const mockChannel = {
    listen: vi.fn(() => ({ stopListening: vi.fn() })),
    listenForWhisper: vi.fn(() => ({ stopListening: vi.fn() })),
    notification: vi.fn(() => ({ stopListening: vi.fn() })),
    stopListening: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    vi.clearAllMocks()

    // Mock auth store to return authenticated user
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
      token: 'test-token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      setToken: vi.fn(),
    })

    // Mock echo.private to return our mock channel
    vi.mocked(echo.private).mockReturnValue(mockChannel as any)
  })

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  describe('useWarehouseChannel', () => {
    it('should subscribe to private warehouse channel', () => {
      const { result } = renderHook(() => useWarehouseChannel(1), { wrapper })

      expect(result.current.isConnected).toBe(false) // Not connected until subscription
      expect(echo.private).toHaveBeenCalledWith('private-warehouse.1')
    })

    it('should listen for OrderStarted events', () => {
      renderHook(() => useWarehouseChannel(1), { wrapper })

      expect(mockChannel.listen).toHaveBeenCalledWith('order.started', expect.any(Function))
    })

    it('should listen for OrderCompleted events', () => {
      renderHook(() => useWarehouseChannel(1), { wrapper })

      expect(mockChannel.listen).toHaveBeenCalledWith('order.completed', expect.any(Function))
    })

    it('should listen for PickingProgress events', () => {
      renderHook(() => useWarehouseChannel(1), { wrapper })

      expect(mockChannel.listen).toHaveBeenCalledWith('picking.progress', expect.any(Function))
    })

    it('should listen for StockAlert events', () => {
      renderHook(() => useWarehouseChannel(1), { wrapper })

      expect(mockChannel.listen).toHaveBeenCalledWith('stock.alert', expect.any(Function))
    })

    it('should invalidate pending orders query on OrderStarted event', async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useWarehouseChannel(1), { wrapper })

      // Get the callback for order.started event
      const listenCalls = mockChannel.listen.mock.calls
      const orderStartedCall = listenCalls.find((call) => call[0] === 'order.started')
      const eventCallback = orderStartedCall?.[1]

      // Simulate receiving an event
      if (eventCallback) {
        eventCallback({
          order_number: 'EXP-2026-001',
          warehouse_id: 1,
          user_id: 1,
          user_name: 'Test User',
          message: 'Order started',
        })
      }

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['pending-orders', 1],
        })
      })

      // Wait for state to update
      await waitFor(() => {
        expect(result.current.lastEvent).toEqual({
          type: 'order.started',
          data: {
            order_number: 'EXP-2026-001',
            warehouse_id: 1,
            user_id: 1,
            user_name: 'Test User',
            message: 'Order started',
          },
        })
      })
    })

    it('should cleanup channel on unmount', () => {
      const { unmount } = renderHook(() => useWarehouseChannel(1), { wrapper })

      unmount()

      expect(echo.leave).toHaveBeenCalledWith('private-warehouse.1')
    })

    it('should not subscribe if warehouseId is null', () => {
      renderHook(() => useWarehouseChannel(null), { wrapper })

      expect(echo.private).not.toHaveBeenCalled()
    })

    it('should update connection state when channel subscribes', async () => {
      const { result } = renderHook(() => useWarehouseChannel(1), { wrapper })

      // Initially isSubscribing should be true
      expect(result.current.isSubscribing).toBe(true)

      // Wait for the setTimeout to trigger and set isConnected to true
      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
        expect(result.current.isSubscribing).toBe(false)
      })
    })
  })
})
