import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { disconnectEcho, getEcho, isEchoConnected, reconnectEcho } from '../lib/echo'

/**
 * Generic hook for WebSocket channel subscriptions
 *
 * Handles:
 * - Automatic subscription on mount
 * - Automatic unsubscription on unmount
 * - Connection state tracking
 * - Error handling
 * - Reconnection on connection loss
 *
 * @param channelName - Channel name (e.g., 'private-warehouse.1')
 * @param eventName - Event name to listen for
 * @param callback - Callback function when event is received
 * @param options - Optional configuration
 */
export function useWebsocketChannel<T = any>(
  channelName: string | null,
  eventName: string,
  callback: (data: T) => void,
  options?: {
    enabled?: boolean
    invalidateQueries?: string[]
    showToast?: boolean
  }
) {
  const { enabled = true, invalidateQueries = [], showToast = false } = options ?? {}

  const [isConnected, setIsConnected] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const queryClient = useQueryClient()

  const channelRef = useRef<any>(null)
  const callbackRef = useRef(callback)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Keep callback reference updated
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const subscribe = useCallback(async () => {
    if (!enabled || !channelName) {
      return
    }

    setIsSubscribing(true)
    setError(null)

    try {
      const echo = await getEcho()

      if (!echo) {
        console.warn('[useWebsocketChannel] Echo not available')
        setIsSubscribing(false)
        return
      }

      // Subscribe to channel
      const channel = echo.private(channelName)

      // Listen for event
      channel.listen(eventName, (data: T) => {
        console.info(`[useWebsocketChannel] Received ${eventName} on ${channelName}:`, data)

        // Invalidate queries if specified
        if (invalidateQueries.length > 0) {
          queryClient.invalidateQueries({ queryKey: invalidateQueries })
        }

        // Call user callback
        callbackRef.current(data)
      })

      channelRef.current = channel
      setIsConnected(true)
      setIsSubscribing(false)

      console.info(`[useWebsocketChannel] Subscribed to ${channelName}`)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      setIsSubscribing(false)
      console.error('[useWebsocketChannel] Subscription failed:', error)
    }
  }, [channelName, eventName, enabled, invalidateQueries, queryClient])

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.stopListening(eventName)
      console.info(`[useWebsocketChannel] Unsubscribed from ${channelName}`)
      channelRef.current = null
    }
    setIsConnected(false)

    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [eventName, channelName])

  // Handle reconnection on connection loss
  useEffect(() => {
    if (!enabled || !channelName) {
      return
    }

    const checkConnection = () => {
      if (!isEchoConnected() && isConnected) {
        console.warn('[useWebsocketChannel] Connection lost, attempting to reconnect...')
        reconnectEcho()
      }
    }

    const interval = setInterval(checkConnection, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [enabled, channelName, isConnected])

  // Subscribe/unsubscribe based on enabled state
  useEffect(() => {
    if (enabled && channelName) {
      subscribe()
    }

    return () => {
      unsubscribe()
    }
  }, [enabled, channelName, subscribe, unsubscribe])

  return {
    isConnected,
    isSubscribing,
    error,
  }
}

/**
 * Subscribe to warehouse-specific channel
 *
 * Channel: private-warehouse.{warehouseId}
 * Events: order.started, order.completed, picking.progress, stock.alert
 */
export function useWarehouseChannel(
  warehouseId: number | null,
  options?: {
    enabled?: boolean
  }
) {
  const channelName = warehouseId ? `private-warehouse.${warehouseId}` : null

  return useWebsocketChannel(
    channelName,
    '*.updated', // Listen to all events
    (data: any) => {
      console.info('[useWarehouseChannel] Warehouse update received:', data)
    },
    {
      enabled: options?.enabled ?? !!warehouseId,
      invalidateQueries: [['pending-orders']],
    }
  )
}

/**
 * Subscribe to user-specific channel
 *
 * Channel: private-user.{userId}
 * Events: stock.alert, order.assigned, order.completed
 */
export function useUserChannel(
  userId: number | null,
  options?: {
    enabled?: boolean
    onStockAlert?: (alert: any) => void
    onOrderAssigned?: (order: any) => void
  }
) {
  const channelName = userId ? `private-user.${userId}` : null

  return useWebsocketChannel(
    channelName,
    '*.updated',
    (data: any) => {
      // Handle different event types
      if (data.event_type === 'stock.alert' && options?.onStockAlert) {
        options.onStockAlert(data)
      } else if (data.event_type === 'order.assigned' && options?.onOrderAssigned) {
        options.onOrderAssigned(data)
      }
    },
    {
      enabled: options?.enabled ?? !!userId,
      invalidateQueries: [['pending-orders'], ['alerts']],
    }
  )
}

/**
 * Subscribe to order-specific channel
 *
 * Channel: private-order.{orderNumber}
 * Events: picking.progress, order.completed
 */
export function useOrderChannel(
  orderNumber: string | null,
  options?: {
    enabled?: boolean
    onProgress?: (progress: any) => void
    onCompleted?: (order: any) => void
  }
) {
  const channelName = orderNumber ? `private-order.${orderNumber}` : null

  return useWebsocketChannel(
    channelName,
    '*.updated',
    (data: any) => {
      // Handle different event types
      if (data.event_type === 'picking.progress' && options?.onProgress) {
        options.onProgress(data)
      } else if (data.event_type === 'order.completed' && options?.onCompleted) {
        options.onCompleted(data)
      }
    },
    {
      enabled: options?.enabled ?? !!orderNumber,
      invalidateQueries: [['pending-orders'], ['order-detail', orderNumber]],
    }
  )
}
