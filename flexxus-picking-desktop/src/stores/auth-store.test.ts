import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/stores/auth-store'

describe('useAuthStore', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorage.clear()
    // Reset the store state by re-creating it
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('initial state', () => {
    it('should have initial state with no user and not authenticated', () => {
      const { result } = renderHook(() => useAuthStore())

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should restore token from localStorage on initialization', () => {
      const mockToken = 'test-token-123'
      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key) => (key === 'token' ? mockToken : null)),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      })

      // Re-import to trigger initialization with mocked localStorage
      const { useAuthStore: freshAuthStore } = require('@/stores/auth-store')
      const { result } = renderHook(() => freshAuthStore())

      expect(result.current.token).toBe(mockToken)
      expect(result.current.isAuthenticated).toBe(true)
      expect(localStorage.getItem).toHaveBeenCalledWith('token')
    })
  })

  describe('login', () => {
    it('should set user, token, and authenticate on login', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      }
      const mockToken = 'auth-token-456'

      act(() => {
        result.current.login(mockUser, mockToken)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe(mockToken)
      expect(result.current.isAuthenticated).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken)
    })

    it('should persist token to localStorage on login', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      }
      const mockToken = 'persisted-token'

      act(() => {
        result.current.login(mockUser, mockToken)
      })

      expect(localStorage.setItem).toHaveBeenCalledTimes(1)
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken)
    })

    it('should handle admin user login', () => {
      const { result } = renderHook(() => useAuthStore())
      const adminUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      }
      const adminToken = 'admin-token-123'

      act(() => {
        result.current.login(adminUser, adminToken)
      })

      expect(result.current.user?.role).toBe('admin')
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle employee user login', () => {
      const { result } = renderHook(() => useAuthStore())
      const employeeUser = {
        id: 5,
        name: 'Employee User',
        email: 'employee@example.com',
        role: 'employee',
      }
      const employeeToken = 'employee-token-456'

      act(() => {
        result.current.login(employeeUser, employeeToken)
      })

      expect(result.current.user?.role).toBe('employee')
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('logout', () => {
    it('should clear user, token, and authentication on logout', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      }
      const mockToken = 'test-token'

      // First login
      act(() => {
        result.current.login(mockUser, mockToken)
      })

      expect(result.current.isAuthenticated).toBe(true)

      // Then logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should remove token from localStorage on logout', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      }
      const mockToken = 'test-token'

      act(() => {
        result.current.login(mockUser, mockToken)
      })

      act(() => {
        result.current.logout()
      })

      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
    })

    it('should be idempotent - multiple logouts should not error', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.logout()
      })

      act(() => {
        result.current.logout()
      })

      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('setUser', () => {
    it('should update user without changing authentication state', () => {
      const { result } = renderHook(() => useAuthStore())
      const initialUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      }

      act(() => {
        result.current.login(initialUser, 'token')
      })

      const updatedUser = {
        id: 1,
        name: 'Updated User',
        email: 'updated@example.com',
        role: 'admin',
      }

      act(() => {
        result.current.setUser(updatedUser)
      })

      expect(result.current.user).toEqual(updatedUser)
      expect(result.current.token).toBe('token')
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should set user to null', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      }

      act(() => {
        result.current.login(mockUser, 'token')
      })

      act(() => {
        result.current.setUser(null)
      })

      expect(result.current.user).toBeNull()
      // Note: setUser(null) doesn't change authentication state or token
      expect(result.current.token).toBe('token')
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('setToken', () => {
    it('should set token and update authentication state', () => {
      const { result } = renderHook(() => useAuthStore())
      const newToken = 'new-token-789'

      act(() => {
        result.current.setToken(newToken)
      })

      expect(result.current.token).toBe(newToken)
      expect(result.current.isAuthenticated).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('token', newToken)
    })

    it('should clear token and update authentication state to false', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      }

      act(() => {
        result.current.login(mockUser, 'initial-token')
      })

      act(() => {
        result.current.setToken(null)
      })

      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
    })

    it('should persist token to localStorage when setting non-null token', () => {
      const { result } = renderHook(() => useAuthStore())
      const token = 'persisted-token'

      act(() => {
        result.current.setToken(token)
      })

      expect(localStorage.setItem).toHaveBeenCalledWith('token', token)
    })
  })

  describe('authentication scenarios', () => {
    it('should handle login-logout-login flow', () => {
      const { result } = renderHook(() => useAuthStore())
      const user1 = {
        id: 1,
        name: 'User 1',
        email: 'user1@example.com',
        role: 'admin',
      }
      const user2 = {
        id: 2,
        name: 'User 2',
        email: 'user2@example.com',
        role: 'employee',
      }

      // First login
      act(() => {
        result.current.login(user1, 'token1')
      })
      expect(result.current.user?.name).toBe('User 1')

      // Logout
      act(() => {
        result.current.logout()
      })
      expect(result.current.user).toBeNull()

      // Second login with different user
      act(() => {
        result.current.login(user2, 'token2')
      })
      expect(result.current.user?.name).toBe('User 2')
      expect(result.current.token).toBe('token2')
    })

    it('should maintain authentication state across store updates', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      }

      act(() => {
        result.current.login(mockUser, 'test-token')
      })

      // Update user info
      const updatedUser = { ...mockUser, name: 'Updated Name' }
      act(() => {
        result.current.setUser(updatedUser)
      })

      // Update token
      act(() => {
        result.current.setToken('new-token')
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user?.name).toBe('Updated Name')
      expect(result.current.token).toBe('new-token')
    })
  })

  describe('localStorage integration', () => {
    it('should handle localStorage errors gracefully', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      }

      // Mock localStorage to throw error
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(),
        setItem: vi.fn(() => {
          throw new Error('localStorage quota exceeded')
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
      })

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.login(mockUser, 'token')
        })
      }).not.toThrow()

      // State should still be updated
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
    })
  })
})
