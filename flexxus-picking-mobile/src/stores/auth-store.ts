import { create } from 'zustand'

import type { UserSession } from '../features/auth/types'
import {
  clearPersistedSession,
  readPersistedSession,
  writePersistedSession,
} from '../lib/storage/secure-session'

export type BootstrapStatus = 'idle' | 'restoring' | 'authenticated' | 'unauthenticated'

type AuthState = {
  token: string | null
  user: UserSession | null
  bootstrapStatus: BootstrapStatus
  hasHydrated: boolean
  authenticate: (token: string, user: UserSession) => Promise<void>
  bootstrap: (validateSession: () => Promise<UserSession>) => Promise<void>
  clearSession: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  bootstrapStatus: 'idle',
  hasHydrated: false,
  authenticate: async (token, user) => {
    await writePersistedSession({
      token,
      userId: user.id,
      lastValidatedAt: new Date().toISOString(),
    })

    set({ token, user, bootstrapStatus: 'authenticated', hasHydrated: true })
  },
  bootstrap: async (validateSession) => {
    if (get().bootstrapStatus === 'restoring') {
      return
    }

    set({ bootstrapStatus: 'restoring' })

    const persisted = await readPersistedSession()
    if (!persisted?.token) {
      set({ token: null, user: null, bootstrapStatus: 'unauthenticated', hasHydrated: true })
      return
    }

    set({ token: persisted.token })

    try {
      const user = await validateSession()
      await writePersistedSession({
        token: persisted.token,
        userId: user.id,
        lastValidatedAt: new Date().toISOString(),
      })

      set({ user, bootstrapStatus: 'authenticated', hasHydrated: true })
    } catch {
      await clearPersistedSession()
      set({ token: null, user: null, bootstrapStatus: 'unauthenticated', hasHydrated: true })
    }
  },
  clearSession: async () => {
    await clearPersistedSession()
    set({ token: null, user: null, bootstrapStatus: 'unauthenticated', hasHydrated: true })
  },
  logout: async () => {
    await clearPersistedSession()
    set({ token: null, user: null, bootstrapStatus: 'unauthenticated', hasHydrated: true })
  },
}))
