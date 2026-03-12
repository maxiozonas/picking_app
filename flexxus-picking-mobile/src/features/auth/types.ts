export type UserRole = 'admin' | 'empleado'

export type WarehouseSummary = {
  id: number
  code: string
  name: string
  isActive?: boolean
  isOverride?: boolean
}

export type UserSession = {
  id: number
  username: string
  name: string
  email: string
  role: UserRole
  warehouseId: number | null
  warehouse: WarehouseSummary | null
}

export type LoginInput = {
  username: string
  password: string
}

export type AuthToken = {
  token: string
  expiresAt: string | null
}

export type LoginResponse = {
  token: AuthToken
  user: UserSession
}
