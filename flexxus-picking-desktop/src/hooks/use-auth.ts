import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import type { LoginRequest, LoginResponseData } from '@/types/api'
import { toast } from '@/hooks/use-toast'

interface LoginCredentials extends LoginRequest {}

interface AuthError {
  message: string
  errors?: Record<string, string[]>
}

/**
 * Authentication hook providing login and logout functionality.
 * Integrates with Zustand auth store for state management and TanStack Query for mutations.
 * 
 * @returns Auth object with login, logout functions and loading state
 * @returns {function(data: LoginCredentials): void} login - Function to initiate login mutation
 * @returns {function(): Promise<void>} logout - Function to logout and clear session
 * @returns {boolean} isLoading - Whether login mutation is in progress
 * 
 * @example
 * ```tsx
 * const { login, logout, isLoading } = useAuth()
 * 
 * // Login
 * login({ username: 'admin', password: 'secret' })
 * 
 * // Logout
 * await logout()
 * ```
 * 
 * @remarks
 * - **Login Flow:**
 *   1. Calls POST /auth/login
 *   2. Stores token in Zustand store
 *   3. Clears all TanStack Query caches
 *   4. Shows success toast and navigates to dashboard
 * 
 * - **Logout Flow:**
 *   1. Calls POST /auth/logout (invalidates server token)
 *   2. Clears local auth state (always happens, even if server call fails)
 *   3. Clears all TanStack Query caches
 *   4. Shows logout toast and navigates to login
 * 
 * - **Error Handling:** Shows toast notifications for both login and logout errors
 * - **Token Format:** Expects { token: { token: string, name, abilities, expires_at }, user }
 */
export function useAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponseData> => {
      // After the axios interceptor unwraps { success, data } → we get { token: {...}, user: {...} }
      const response = await api.post<LoginResponseData>('/auth/login', credentials)
      return response.data
    },
    onSuccess: (data) => {
      // data.token is an object { token: string, name, abilities, expires_at }
      login(data.user, data.token.token)
      queryClient.clear()
      toast({
        title: 'Inicio de sesión exitoso',
        description: `Bienvenido, ${data.user.name}`,
      })
      navigate('/')
    },
    onError: (error: unknown) => {
      const authError = error as { response?: { data?: AuthError } }
      const message = authError.response?.data?.message || 'Error al iniciar sesión'
      toast({
        variant: 'destructive',
        title: 'Error de autenticación',
        description: message,
      })
    },
  })

  const handleLogout = async () => {
    try {
      // Invalidate token server-side before clearing local state
      await api.post('/auth/logout')
    } catch {
      // Always clear local state even if server call fails
    } finally {
      logout()
      queryClient.clear()
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión exitosamente',
      })
      navigate('/login')
    }
  }

  return {
    login: loginMutation.mutate,
    logout: handleLogout,
    isLoading: loginMutation.isPending,
  }
}
