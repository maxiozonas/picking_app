import { initializeEcho, getEcho, disconnectEcho, reconnectEcho, isEchoConnected } from './echo'

// Mock dependencies
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

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
}))

jest.mock('socket.io-client', () => {
  const mockSocket = {
    connected: false,
    on: jest.fn(),
    off: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  }

  return {
    __esModule: true,
    default: jest.fn(() => mockSocket),
  }
})

jest.mock('laravel-echo', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      private: jest.fn(),
      connector: {
        socket: {
          connected: true,
          on: jest.fn(),
          off: jest.fn(),
        },
      },
      disconnect: jest.fn(),
    })),
  }
})

jest.mock('react-native', () => ({
  AppState: {
    current: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}))

describe('Echo Client', () => {
  const mockToken = JSON.stringify({
    token: 'test-token',
    userId: 1,
    lastValidatedAt: new Date().toISOString(),
  })

  beforeEach(() => {
    jest.clearAllMocks()
    disconnectEcho()
  })

  describe('initializeEcho', () => {
    it('should return null when WebSocket is disabled', async () => {
      const Constants = require('expo-constants')
      Constants.expoConfig.extra.websocketEnabled = false

      const echo = await initializeEcho()

      expect(echo).toBeNull()

      // Reset
      Constants.expoConfig.extra.websocketEnabled = true
    })

    it('should return null when no auth token is available', async () => {
      const SecureStore = require('expo-secure-store')
      SecureStore.getItemAsync.mockResolvedValueOnce(null)

      const echo = await initializeEcho()

      expect(echo).toBeNull()
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('flexxus-picking-mobile/session')
    })

    it('should initialize Echo when token is available', async () => {
      const SecureStore = require('expo-secure-store')
      SecureStore.getItemAsync.mockResolvedValueOnce(mockToken)

      const echo = await initializeEcho()

      expect(echo).toBeDefined()
      expect(SecureStore.getItemAsync).toHaveBeenCalled()
    })

    it('should handle JSON parse errors gracefully', async () => {
      const SecureStore = require('expo-secure-store')
      SecureStore.getItemAsync.mockResolvedValueOnce('invalid-json')

      const echo = await initializeEcho()

      expect(echo).toBeNull()
    })

    it('should setup connection event handlers', async () => {
      const SecureStore = require('expo-secure-store')
      SecureStore.getItemAsync.mockResolvedValueOnce(mockToken)

      const echo = await initializeEcho()

      expect(echo?.connector.socket?.on).toHaveBeenCalledWith('connect', expect.any(Function))
      expect(echo?.connector.socket?.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
      expect(echo?.connector.socket?.on).toHaveBeenCalledWith('error', expect.any(Function))
    })
  })

  describe('getEcho', () => {
    it('should return existing instance if already initialized', async () => {
      const SecureStore = require('expo-secure-store')
      SecureStore.getItemAsync.mockResolvedValueOnce(mockToken)

      const echo1 = await initializeEcho()
      const echo2 = await getEcho()

      expect(echo1).toBe(echo2)
    })

    it('should initialize new instance if not exists', async () => {
      disconnectEcho()

      const SecureStore = require('expo-secure-store')
      SecureStore.getItemAsync.mockResolvedValueOnce(mockToken)

      const echo = await getEcho()

      expect(echo).toBeDefined()
    })
  })

  describe('disconnectEcho', () => {
    it('should disconnect and cleanup Echo instance', async () => {
      const SecureStore = require('expo-secure-store')
      SecureStore.getItemAsync.mockResolvedValueOnce(mockToken)

      await initializeEcho()
      disconnectEcho()

      expect(isEchoConnected()).toBe(false)
    })

    it('should handle disconnect when no instance exists', () => {
      expect(() => disconnectEcho()).not.toThrow()
    })
  })

  describe('reconnectEcho', () => {
    it('should disconnect and reconnect', async () => {
      const SecureStore = require('expo-secure-store')
      SecureStore.getItemAsync.mockResolvedValueOnce(mockToken)

      await initializeEcho()
      const echo = await reconnectEcho()

      expect(echo).toBeDefined()
    })

    it('should wait before reconnecting with exponential backoff', async () => {
      const SecureStore = require('expo-secure-store')
      SecureStore.getItemAsync.mockResolvedValueOnce(mockToken)

      jest.useFakeTimers()

      await initializeEcho()
      const promise = reconnectEcho()

      // Fast-forward past the base delay
      jest.advanceTimersByTime(1000)

      await promise

      expect(isEchoConnected()).toBe(true)

      jest.useRealTimers()
    })
  })

  describe('isEchoConnected', () => {
    it('should return false when Echo is not initialized', () => {
      disconnectEcho()

      expect(isEchoConnected()).toBe(false)
    })

    it('should return connection status', async () => {
      const SecureStore = require('expo-secure-store')
      SecureStore.getItemAsync.mockResolvedValueOnce(mockToken)

      await initializeEcho()

      expect(isEchoConnected()).toBe(true)
    })
  })

  describe('React Native lifecycle', () => {
    it('should setup AppState listener on initialization', async () => {
      const SecureStore = require('expo-secure-store')
      SecureStore.getItemAsync.mockResolvedValueOnce(mockToken)

      const AppState = require('react-native').AppState

      await initializeEcho()

      expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should cleanup AppState listener on disconnect', async () => {
      const SecureStore = require('expo-secure-store')
      SecureStore.getItemAsync.mockResolvedValueOnce(mockToken)

      await initializeEcho()
      disconnectEcho()

      // Verify no errors are thrown during cleanup
      expect(isEchoConnected()).toBe(false)
    })
  })
})
