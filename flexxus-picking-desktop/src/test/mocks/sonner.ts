import { vi } from 'vitest'

export const toast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  promise: vi.fn(),
  dismiss: vi.fn(),
}

export const Toaster = () => null
