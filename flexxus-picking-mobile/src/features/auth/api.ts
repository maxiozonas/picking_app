import { apiClient } from '../../lib/api/client'
import type { LoginInput, LoginResponse, UserSession } from './types'

type LoginTransport = {
  token: {
    token: string
    expires_at?: string | null
  }
  user: {
    id: number
    username: string
    name: string
    email: string
    role?: 'admin' | 'empleado'
    warehouse_id: number | null
    warehouse: {
      id: number
      code: string
      name: string
      is_active?: boolean
      is_override?: boolean
    } | null
  }
}

function mapUserSession(payload: LoginTransport['user']): UserSession {
  return {
    id: payload.id,
    username: payload.username,
    name: payload.name,
    email: payload.email,
    role: payload.role ?? 'empleado',
    warehouseId: payload.warehouse_id,
    warehouse: payload.warehouse
      ? {
          id: payload.warehouse.id,
          code: payload.warehouse.code,
          name: payload.warehouse.name,
          isActive: payload.warehouse.is_active,
          isOverride: payload.warehouse.is_override,
        }
      : null,
  }
}

export async function loginRequest(input: LoginInput): Promise<LoginResponse> {
  const response = await apiClient.post<LoginTransport>('/auth/login', input)

  return {
    token: {
      token: response.data.token.token,
      expiresAt: response.data.token.expires_at ?? null,
    },
    user: mapUserSession(response.data.user),
  }
}

export async function getCurrentUser(): Promise<UserSession> {
  const response = await apiClient.get<LoginTransport['user']>('/auth/me')
  return mapUserSession(response.data)
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout')
}
