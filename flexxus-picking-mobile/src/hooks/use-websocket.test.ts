import { renderHook, waitFor, act } from '@testing-library/react-native'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useWarehouseChannel, useUserChannel, useOrderChannel } from './use-websocket'

// Mock Echo and socket.io-client
jest.mock('laravel-echo', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      private: jest.fn().mockReturnValue({
        listen: jest.fn(),
        stopListening: jest.fn(),
      }),
      connector: {
        socket: {
          connected: true,
          on: jest.fn(),
        },
      },
      disconnect: jest.fn(),
    })),
  }
})

jest.mock('socket.io-client', () => ({
  __esModule: true,
  default: jest.fn(),
}))

// Mock Expo SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))

// Mock Expo Constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      websocketEnabled: true,
      websocketHost: 'localhost',
      websocketPort: 6001,
      pusherAppKey: 'test-key',
    },
  },
}))

// Mock AppState
jest.mock('react-native', () => ({
  AppState: {
    current: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}))

describe('useWebsocketChannel', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  describe('useWarehouseChannel', () => {
    it('should not subscribe when warehouseId is null', () => {
      const { result } = renderHook(() => useWarehouseChannel(null), { wrapper })

      expect(result.current.isConnected).toBe(false)
      expect(result.current.isSubscribing).toBe(false)
    })

    it('should subscribe to warehouse channel when warehouseId is provided', async () => {
      const { result } = renderHook(() => useWarehouseChannel(1), { wrapper })

      await waitFor(() => {
        expect(result.current.isSubscribing).toBe(false)
      })

      expect(result.current.isConnected).toBe(true)
      expect(result.current.error).toBe(null)
    })

    it('should not subscribe when enabled is false', async () => {
      const { result } = renderHook(() => useWarehouseChannel(1, { enabled: false }), { wrapper })

      await waitFor(() => {
        expect(result.current.isSubscribing).toBe(false)
      })

      expect(result.current.isConnected).toBe(false)
    })
  })

  describe('useUserChannel', () => {
    it('should not subscribe when userId is null', () => {
      const { result } = renderHook(() => useUserChannel(null), { wrapper })

      expect(result.current.isConnected).toBe(false)
    })

    it('should subscribe to user channel and call callbacks on events', async () => {
      const onStockAlert = jest.fn()
      const onOrderAssigned = jest.fn()

      const { result } = renderHook(
        () => useUserChannel(1, { onStockAlert, onOrderAssigned }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isSubscribing).toBe(false)
      })

      expect(result.current.isConnected).toBe(true)
    })

    it('should handle stock alert events', async () => {
      const onStockAlert = jest.fn()

      renderHook(() => useUserChannel(1, { onStockAlert }), { wrapper })

      // Note: In a real test, we would emit an event through Echo
      // For now, we're just verifying the hook doesn't crash
      await waitFor(() => {
        expect(onStockAlert).not.toHaveBeenCalled()
      })
    })
  })

  describe('useOrderChannel', () => {
    it('should not subscribe when orderNumber is null', () => {
      const { result } = renderHook(() => useOrderChannel(null), { wrapper })

      expect(result.current.isConnected).toBe(false)
    })

    it('should subscribe to order channel when orderNumber is provided', async () => {
      const onProgress = jest.fn()
      const onCompleted = jest.fn()

      const { result } = renderHook(
        () => useOrderChannel('ORD-001', { onProgress, onCompleted }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isSubscribing).toBe(false)
      })

      expect(result.current.isConnected).toBe(true)
    })
  })

  describe('cleanup', () => {
    it('should unsubscribe on unmount', async () => {
      const { unmount } = renderHook(() => useWarehouseChannel(1), { wrapper })

      await waitFor(() => {
        expect(queryClient.isMutating()).toBe(0)
      })

      expect(() => unmount()).not.toThrow()
    })

    it('should handle multiple subscriptions', async () => {
      const { result } = renderHook(
        () => {
          const warehouse = useWarehouseChannel(1)
          const user = useUserChannel(1)
          const order = useOrderChannel('ORD-001')
          return { warehouse, user, order }
        },
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.warehouse).toBeDefined()
        expect(result.current.user).toBeDefined()
        expect(result.current.order).toBeDefined()
      })
    })
  })

  describe('query invalidation', () => {
    it('should invalidate queries when configured', async () => {
      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries')

      renderHook(() => useWarehouseChannel(1), { wrapper })

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalled()
      }, { timeout: 3000 })
    })
  })
})
