import { act } from '@testing-library/react-native'

import type { UserSession } from '../features/auth/types'
import { useAuthStore } from './auth-store'
import {
  clearPersistedSession,
  readPersistedSession,
  writePersistedSession,
} from '../lib/storage/secure-session'

jest.mock('../lib/storage/secure-session', () => ({
  clearPersistedSession: jest.fn(),
  readPersistedSession: jest.fn(),
  writePersistedSession: jest.fn(),
}))

const mockedClearPersistedSession = jest.mocked(clearPersistedSession)
const mockedReadPersistedSession = jest.mocked(readPersistedSession)
const mockedWritePersistedSession = jest.mocked(writePersistedSession)

const user: UserSession = {
  id: 7,
  username: 'operario',
  name: 'Ada Operaria',
  email: 'ada@example.com',
  role: 'empleado',
  warehouseId: 4,
  warehouse: {
    id: 4,
    code: 'DEP-04',
    name: 'Deposito Norte',
    isActive: true,
  },
}

function resetStore() {
  useAuthStore.setState({
    token: null,
    user: null,
    bootstrapStatus: 'idle',
    hasHydrated: false,
  })
}

describe('useAuthStore', () => {
  beforeEach(() => {
    resetStore()
    mockedClearPersistedSession.mockResolvedValue(undefined)
    mockedReadPersistedSession.mockResolvedValue(null)
    mockedWritePersistedSession.mockResolvedValue(undefined)
  })

  it('persists the session on authenticate', async () => {
    await act(async () => {
      await useAuthStore.getState().authenticate('token-123', user)
    })

    expect(mockedWritePersistedSession).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'token-123',
        userId: user.id,
      }),
    )
    expect(useAuthStore.getState()).toMatchObject({
      token: 'token-123',
      user,
      bootstrapStatus: 'authenticated',
      hasHydrated: true,
    })
  })

  it('marks the store unauthenticated when no persisted token exists', async () => {
    const validateSession = jest.fn()

    await act(async () => {
      await useAuthStore.getState().bootstrap(validateSession)
    })

    expect(validateSession).not.toHaveBeenCalled()
    expect(useAuthStore.getState()).toMatchObject({
      token: null,
      user: null,
      bootstrapStatus: 'unauthenticated',
      hasHydrated: true,
    })
  })

  it('restores a valid persisted session', async () => {
    mockedReadPersistedSession.mockResolvedValue({
      token: 'token-123',
      userId: user.id,
      lastValidatedAt: null,
    })
    const validateSession = jest.fn().mockResolvedValue(user)

    await act(async () => {
      await useAuthStore.getState().bootstrap(validateSession)
    })

    expect(validateSession).toHaveBeenCalledTimes(1)
    expect(mockedWritePersistedSession).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'token-123',
        userId: user.id,
      }),
    )
    expect(useAuthStore.getState()).toMatchObject({
      token: 'token-123',
      user,
      bootstrapStatus: 'authenticated',
      hasHydrated: true,
    })
  })

  it('clears the persisted session after bootstrap validation fails', async () => {
    mockedReadPersistedSession.mockResolvedValue({
      token: 'expired-token',
      userId: user.id,
      lastValidatedAt: null,
    })
    const validateSession = jest.fn().mockRejectedValue(new Error('Unauthorized'))

    await act(async () => {
      await useAuthStore.getState().bootstrap(validateSession)
    })

    expect(mockedClearPersistedSession).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState()).toMatchObject({
      token: null,
      user: null,
      bootstrapStatus: 'unauthenticated',
      hasHydrated: true,
    })
  })
})
