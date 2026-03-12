import { useMutation, useQueryClient } from '@tanstack/react-query'

import { getCurrentUser, loginRequest, logoutRequest } from './api'
import type { LoginInput } from './types'
import { useAuthStore } from '../../stores/auth-store'

export function useLoginMutation() {
  const authenticate = useAuthStore((state) => state.authenticate)

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const result = await loginRequest(input)
      await authenticate(result.token.token, result.user)
      return result.user
    },
  })
}

export function useLogoutMutation() {
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      try {
        await logoutRequest()
      } finally {
        await logout()
        queryClient.clear()
      }
    },
  })
}

export function useSessionBootstrap() {
  const bootstrap = useAuthStore((state) => state.bootstrap)

  return useMutation({
    mutationFn: async () => bootstrap(getCurrentUser),
  })
}
