import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { handlers } from '@/test/mocks/handlers'

// MSW server setup
const server = setupServer(...handlers)

describe('React Query DevTools Integration Tests', () => {
  let queryClient: QueryClient

  beforeAll(() => {
    server.listen()
  })

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
  })

  afterAll(() => {
    server.close()
  })

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  describe('DevTools in development mode', () => {
    it('should render DevTools component when import.meta.env.DEV is true', () => {
      // Mock import.meta.env.DEV
      const originalDev = import.meta.env.DEV
      vi.stubGlobal('import.meta', { env: { DEV: true, MODE: 'development' } })

      const { container } = render(
        React.createElement(ReactQueryDevtools, { initialIsOpen: false }),
        { wrapper }
      )

      // DevTools should be in document
      const devtoolsButton = container.querySelector('[data-react-query-devtool]')
      expect(devtoolsButton).toBeTruthy()

      vi.unstubAllGlobals()
    })

    it('should not render DevTools in production mode', () => {
      // Mock import.meta.env.PROD
      vi.stubGlobal('import.meta', { env: { DEV: false, MODE: 'production' } })

      const { container } = render(
        React.createElement(ReactQueryDevtools, { initialIsOpen: false }),
        { wrapper }
      )

      // DevTools button should not be in document
      const devtoolsButton = container.querySelector('[data-react-query-devtool]')
      expect(devtoolsButton).toBeNull()

      vi.unstubAllGlobals()
    })

    it('should have DevTools button accessible in DOM during development', () => {
      vi.stubGlobal('import.meta', { env: { DEV: true, MODE: 'development' } })

      const { container } = render(
        React.createElement(ReactQueryDevtools, { initialIsOpen: false }),
        { wrapper }
      )

      // Find the DevTools toggle button
      const buttons = container.querySelectorAll('button')
      const devtoolsButton = Array.from(buttons).find(
        (btn) => btn.getAttribute('aria-label')?.includes('React Query')
      )

      expect(devtoolsButton).toBeTruthy()

      vi.unstubAllGlobals()
    })
  })

  describe('DevTools configuration', () => {
    it('should respect initialIsOpen prop', () => {
      vi.stubGlobal('import.meta', { env: { DEV: true, MODE: 'development' } })

      const { container, rerender } = render(
        React.createElement(ReactQueryDevtools, { initialIsOpen: false }),
        { wrapper }
      )

      // Initially closed
      let panel = container.querySelector('[data-react-query-devtool-panel]')
      expect(panel).toBeNull()

      // Rerender with open
      rerender(React.createElement(ReactQueryDevtools, { initialIsOpen: true }))

      // Should be open
      panel = container.querySelector('[data-react-query-devtool-panel]')
      expect(panel).toBeTruthy()

      vi.unstubAllGlobals()
    })

    it('should use correct position defaults', () => {
      vi.stubGlobal('import.meta', { env: { DEV: true, MODE: 'development' } })

      const { container } = render(
        React.createElement(ReactQueryDevtools, {
          initialIsOpen: false,
          position: 'bottom-right',
        }),
        { wrapper }
      )

      const devtoolsButton = container.querySelector('[data-react-query-devtool]')
      expect(devtoolsButton).toBeTruthy()

      vi.unstubAllGlobals()
    })
  })
})
