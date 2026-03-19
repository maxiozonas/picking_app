import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import Echo from 'laravel-echo'
import { AppState, AppStateStatus } from 'react-native'
import io from 'socket.io-client'

import { apiClient } from './api/client'

const WEBSOCKET_ENABLED =
  (Constants.expoConfig?.extra?.websocketEnabled as boolean | undefined) ?? false

const WEBSOCKET_HOST =
  (Constants.expoConfig?.extra?.websocketHost as string | undefined) ?? 'localhost'

const WEBSOCKET_PORT =
  Number(Constants.expoConfig?.extra?.websocketPort as number | undefined) ?? 6001

const PUSHER_APP_KEY =
  (Constants.expoConfig?.extra?.pusherAppKey as string | undefined) ?? 'local-key'

interface EchoConfig {
  enabled: boolean
  host: string
  port: number
  appKey: string
}

let echoInstance: Echo | null = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const BASE_RECONNECT_DELAY = 1000 // 1 second

/**
 * Get WebSocket configuration from Expo constants
 */
export function getWebSocketConfig(): EchoConfig {
  return {
    enabled: WEBSOCKET_ENABLED,
    host: WEBSOCKET_HOST,
    port: WEBSOCKET_PORT,
    appKey: PUSHER_APP_KEY,
  }
}

/**
 * Calculate exponential backoff delay for reconnection
 */
function getReconnectDelay(attempt: number): number {
  return Math.min(BASE_RECONNECT_DELAY * Math.pow(2, attempt), 30000) // Max 30s
}

/**
 * Initialize and configure Echo client for React Native
 *
 * Mobile-specific considerations:
 * - Handles app state changes (background/foreground)
 * - Implements exponential backoff reconnection
 * - Retrieves auth token from SecureStore
 * - Gracefully degrades if WebSocket is disabled
 */
export async function initializeEcho(): Promise<Echo | null> {
  const config = getWebSocketConfig()

  if (!config.enabled) {
    console.info('[Echo] WebSockets disabled via EXPO_PUBLIC_WEBSOCKET_ENABLED')
    return null
  }

  // Clean up existing instance
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
  }

  try {
    const token = await SecureStore.getItemAsync('flexxus-picking-mobile/session')
    const authToken = token ? JSON.parse(token).token : null

    if (!authToken) {
      console.warn('[Echo] No auth token available, skipping WebSocket connection')
      return null
    }

    echoInstance = new Echo({
      broadcaster: 'socket.io',
      host: `${config.host}:${config.port}`,
      auth: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
      client: io,
      namespace: '',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: BASE_RECONNECT_DELAY,
      reconnectionDelayMax: 30000,
      timeout: 10000,
      autoConnect: true,
    })

    // Setup connection event handlers
    echoInstance.connector.socket?.on('connect', () => {
      console.info('[Echo] Connected to WebSocket server')
      reconnectAttempts = 0 // Reset on successful connection
    })

    echoInstance.connector.socket?.on('disconnect', (reason: string) => {
      console.warn('[Echo] Disconnected from WebSocket server:', reason)
    })

    echoInstance.connector.socket?.on('error', (error: Error) => {
      console.error('[Echo] WebSocket error:', error.message)
    })

    echoInstance.connector.socket?.on('reconnect_attempt', (attempt: number) => {
      reconnectAttempts = attempt
      console.info(`[Echo] Reconnection attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS}`)
    })

    echoInstance.connector.socket?.on('reconnect_failed', () => {
      console.error('[Echo] Failed to reconnect after maximum attempts')
      // Reset to allow manual reconnection later
      reconnectAttempts = 0
    })

    // Handle app state changes for React Native lifecycle
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && echoInstance) {
        console.info('[Echo] App came to foreground, checking WebSocket connection')
        // Socket.io will auto-reconnect when app comes to foreground
        if (!echoInstance.connector.socket?.connected) {
          console.info('[Echo] WebSocket disconnected, will auto-reconnect')
        }
      } else if (nextAppState === 'background') {
        console.info('[Echo] App went to background, WebSocket will pause')
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    // Store cleanup function on the instance for later use
    ;(echoInstance as any)._appStateCleanup = subscription.remove

    console.info('[Echo] Initialized successfully')
    return echoInstance
  } catch (error) {
    console.error('[Echo] Failed to initialize:', error)
    return null
  }
}

/**
 * Get the singleton Echo instance
 * Initializes if not already created
 */
export async function getEcho(): Promise<Echo | null> {
  if (!echoInstance) {
    return await initializeEcho()
  }
  return echoInstance
}

/**
 * Disconnect and cleanup Echo instance
 */
export function disconnectEcho(): void {
  if (echoInstance) {
    // Clean up app state listener
    if ((echoInstance as any)._appStateCleanup) {
      ;(echoInstance as any)._appStateCleanup()
    }

    echoInstance.disconnect()
    echoInstance = null
    console.info('[Echo] Disconnected and cleaned up')
  }
}

/**
 * Reconnect Echo with exponential backoff
 * Useful for manual reconnection after network changes
 */
export async function reconnectEcho(): Promise<Echo | null> {
  console.info('[Echo] Attempting to reconnect...')

  // Disconnect first
  disconnectEcho()

  // Wait before reconnecting (exponential backoff)
  const delay = getReconnectDelay(reconnectAttempts)
  await new Promise((resolve) => setTimeout(resolve, delay))

  // Attempt reconnection
  return await initializeEcho()
}

/**
 * Check if Echo is connected
 */
export function isEchoConnected(): boolean {
  return echoInstance?.connector?.socket?.connected ?? false
}

/**
 * Get current reconnection attempt count
 */
export function getReconnectAttempts(): number {
  return reconnectAttempts
}

export default getEcho
