import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import type { LoginRequest, LoginResponse } from '@/types/api'
import { toast } from '@/hooks/use-toast'

interface LoginCredentials extends LoginRequest {}

interface AuthError {
  message: string
  errors?: Record<string, string[]>
}

export function useAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await api.post<LoginResponse>('/auth/login', credentials)
      return response.data
    },
    onSuccess: (data) => {
      login(data.user, data.token)
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
