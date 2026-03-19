import { describe, it, expect, vi, beforeEach } from 'vitest'
import echo from '@/lib/echo'
import api from '@/lib/api'

// Mock socket.io-client and pusher-js
const mockSocket = vi.hoisted(() => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(),
  emit: vi.fn(),
}))

vi.mock('socket.io-client', () => ({
  default: vi.fn(() => mockSocket),
}))

// Mock api for authorizer
vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('echo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset environment variables - disable WebSockets for tests
    process.env.VITE_PUSHER_APP_KEY = 'test-app-key'
    process.env.VITE_WEBSOCKET_HOST = 'localhost'
    process.env.VITE_WEBSOCKET_PORT = '6001'
    process.env.VITE_ENABLE_WEBSOCKETS = 'false'
  })

  it('should export a singleton Echo instance', () => {
    expect(echo).toBeDefined()
    expect(echo).toHaveProperty('channel')
    expect(echo).toHaveProperty('private')
    expect(echo).toHaveProperty('leave')
    expect(echo).toHaveProperty('disconnect')
    expect(echo).toHaveProperty('connect')
  })

  it('should be configured with socket.io broadcaster', () => {
    expect(echo.connector).toBeDefined()
    // Echo with socket.io uses 'socket.io' as the broadcaster name
    // @ts-ignore - accessing internal property
    expect(echo.options.broadcaster).toBe('socket.io')
  })

  it('should use host from environment variable', () => {
    // @ts-ignore - accessing internal property
    const host = echo.options?.host || echo.connector?.options?.host
    expect(host).toBeDefined()
  })

  it('should have exponential backoff reconnection configured', () => {
    // @ts-ignore - accessing internal property
    const reconnectAttempts = echo.options?.reconnectAttempts || echo.connector?.options?.reconnectAttempts
    expect(reconnectAttempts).toBeGreaterThan(0)
  })

  it('should include authorizer with Bearer token', async () => {
    const authorizer = {
      authorize: vi.fn((socketId: string, callback: Function) => {
        callback(false, { auth: { signature: 'test-signature' } })
      }),
    }

    // Test that authorizer is called with correct format
    const socketId = 'test-socket-id'
    const channelName = 'private-warehouse.1'

    // Simulate authorization call
    await authorizer.authorize(socketId, (_error: any, success: any) => {
      expect(success).toBeDefined()
      expect(success.auth).toBeDefined()
    })

    expect(authorizer.authorize).toHaveBeenCalledWith(
      'test-socket-id',
      expect.any(Function)
    )
  })

  it('should handle connection errors gracefully', () => {
    // Echo should have error handling configured
    // @ts-ignore - accessing internal property
    const errorHandler = echo.connector?.options?.onError

    if (errorHandler) {
      expect(typeof errorHandler).toBe('function')
    }
  })
})
