import Echo from 'laravel-echo'
import io from 'socket.io-client'
import { useAuthStore } from '@/stores/auth-store'
import api from '@/lib/api'

/**
 * WebSocket configuration using Laravel Echo with Socket.IO broadcaster.
 *
 * This singleton instance connects to the Laravel WebSocket server and provides
 * real-time event subscriptions for warehouse, user, and order channels.
 *
 * @module lib/echo
 *
 * @remarks
 * - **Broadcaster:** socket.io (not pusher-js, despite the config name)
 * - **Reconnection:** Exponential backoff with 5 attempts
 * - **Authentication:** Bearer token from Zustand auth store via /broadcasting/auth
 * - **Feature Flag:** VITE_ENABLE_WEBSOCKETS env var (default: true)
 * - **Connection:** Automatic on import, manual via echo.connect()
 *
 * @example
 * ```tsx
 * import echo from '@/lib/echo'
 *
 * // Subscribe to warehouse events
 * const channel = echo.private(`warehouse-${warehouseId}`)
 *   .listen('OrderStarted', (e) => console.log('Order started:', e))
 *
 * // Cleanup on unmount
 * useEffect(() => () => echo.leave(`warehouse-${warehouseId}`), [])
 * ```
 *
 * @see {@link https://laravel.com/docs/broadcasting#client-side-implementation}
 */

// WebSocket enabled flag (for testing and feature toggling)
const WEBSOCKETS_ENABLED = import.meta.env.VITE_ENABLE_WEBSOCKETS !== 'false'

// Connection configuration
const echoConfig: {
  broadcaster: string
  host: string
  port: number
  key: string
  forceTLS: boolean
  encrypted: boolean
  disableStats: boolean
  enabled: boolean
  reconnectAttempts: number
  reconnectWait: number
  client: any
  authorizer?: (channel: any, options: any) => {
    authorize: (socketId: string, callback: Function) => void
  }
} = {
  broadcaster: 'socket.io',
  host: import.meta.env.VITE_WEBSOCKET_HOST || 'localhost',
  port: Number(import.meta.env.VITE_WEBSOCKET_PORT) || 6001,
  key: import.meta.env.VITE_PUSHER_APP_KEY || 'local',
  forceTLS: false,
  encrypted: false,
  disableStats: true,
  enabled: WEBSOCKETS_ENABLED,
  reconnectAttempts: 5,
  reconnectWait: 1000,
  client: io,
}

// Add authorizer for private channels (required for Laravel Sanctum)
if (WEBSOCKETS_ENABLED) {
  echoConfig.authorizer = (channel: any) => ({
    authorize: (socketId: string, callback: Function) => {
      // Get token from Zustand store (sync - no hooks needed)
      const token = useAuthStore.getState().token

      if (!token) {
        // No token = cannot authorize private channels
        callback(new Error('No authentication token available'), null)
        return
      }

      // Call Laravel's broadcasting auth endpoint
      api
        .post('/broadcasting/auth', {
          socket_id: socketId,
          channel_name: channel.name,
        })
        .then((response) => {
          callback(false, response.data)
        })
        .catch((error) => {
          console.error('[Echo] Channel authorization failed:', error)
          callback(error, null)
        })
    },
  })
}

// Create and export singleton instance
const echo = new Echo(echoConfig)

// Connection state tracking (for debugging and UI feedback)
let isConnected = false
let isReconnecting = false

// Hook into connection events for debugging
if (typeof window !== 'undefined' && WEBSOCKETS_ENABLED) {
  // @ts-ignore - accessing socket.io connector
  const connector = echo.connector

  // Check if connector has the expected methods (Socket.IO connector)
  if (connector && typeof connector.on === 'function') {
    // Listen for connection events
    connector.on('connect', () => {
      isConnected = true
      isReconnecting = false
      console.log('[Echo] Connected to WebSocket server')
    })

    connector.on('disconnect', (reason: string) => {
      isConnected = false
      console.log('[Echo] Disconnected from WebSocket server:', reason)

      // Reconnect if not intentional
      if (reason === 'io server disconnect') {
        isReconnecting = true
        console.log('[Echo] Server disconnected, reconnecting...')
        echo.connect()
      }
    })

    connector.on('error', (error: Error) => {
      console.error('[Echo] Connection error:', error)
      isReconnecting = false
    })

    connector.on('reconnect', (attemptNumber: number) => {
      isConnected = true
      isReconnecting = false
      console.log('[Echo] Reconnected after', attemptNumber, 'attempts')
    })

    connector.on('reconnect_attempt', (attemptNumber: number) => {
      isReconnecting = true
      console.log('[Echo] Reconnection attempt', attemptNumber)
    })

    connector.on('reconnect_failed', () => {
      isReconnecting = false
      console.error('[Echo] Reconnection failed')
    })
  }
}

/**
 * Get current WebSocket connection state.
 * Useful for UI indicators and debugging.
 *
 * @returns Connection state object
 */
export function getConnectionState() {
  return {
    isConnected,
    isReconnecting,
    isEnabled: WEBSOCKETS_ENABLED,
    socketId: WEBSOCKETS_ENABLED ? echo.socketId() : null,
  }
}

export default echo
