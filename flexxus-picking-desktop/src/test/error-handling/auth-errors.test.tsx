import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { useAuthStore } from '@/stores/auth-store'
import { handlers } from '@/test/mocks/handlers'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import OrdersPage from '@/pages/OrdersPage'
import OrderDetailPage from '@/pages/OrderDetailPage'

// MSW server setup
const server = setupServer(...handlers)

describe('Error Handling Tests: 401 Redirects, Error States, Retry Logic', () => {
  let queryClient: QueryClient

  beforeAll(() => {
    server.listen()
  })

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          onError: (error) => {
            // Suppress console errors during tests
            console.error('Test error:', error)
          },
        },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
    useAuthStore.getState().logout()
    vi.restoreAllMocks()
  })

  afterAll(() => {
    server.close()
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(BrowserRouter, {}, component)
      )
    )
  }

  describe('401 Unauthorized Handling', () => {
    it('should redirect to login on 401 response', async () => {
      // Start logged in
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      // Mock 401 response
      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          return HttpResponse.json(
            { message: 'Unauthenticated' },
            { status: 401 }
          )
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      // Should redirect to login
      await waitFor(() => {
        expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
      })

      // Auth store should be cleared
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().token).toBeNull()
    })

    it('should show error message on login failure', async () => {
      server.use(
        http.post('*/api/auth/login', () => {
          return HttpResponse.json(
            { message: 'Credenciales inválidas' },
            { status: 401 }
          )
        })
      )

      renderWithProviders(React.createElement(LoginPage))

      const emailInput = screen.getByLabelText(/correo/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const loginButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await userEvent.type(emailInput, 'wrong@example.com')
      await userEvent.type(passwordInput, 'wrongpassword')
      await userEvent.click(loginButton)

      await waitFor(() => {
        expect(
          screen.getByText(/credenciales inválidas|error de autenticación/i)
        ).toBeInTheDocument()
      })
    })

    it('should handle multiple 401 errors gracefully', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      // Mock all endpoints to return 401
      server.use(
        http.get('*/api/admin/*', () => {
          return HttpResponse.json(
            { message: 'Unauthenticated' },
            { status: 401 }
          )
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      // Should redirect to login once
      await waitFor(() => {
        expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
      })

      // Should stay on login page (not infinite redirect loop)
      await waitFor(
        () => {
          expect(window.location.pathname).toBe('/login')
        },
        { timeout: 2000 }
      )
    })
  })

  describe('Network Error Handling', () => {
    it('should show error state on network failure', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      // Mock network error
      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          return HttpResponse.error()
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      await waitFor(() => {
        expect(
          screen.getByText(/error de red|network error/i)
        ).toBeInTheDocument()
      })
    })

    it('should show retry button on network error', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          return HttpResponse.error()
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reintentar|retry/i })
        ).toBeInTheDocument()
      })
    })

    it('should retry on button click', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      let attemptCount = 0

      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          attemptCount++
          if (attemptCount === 1) {
            return HttpResponse.error()
          }
          return HttpResponse.json({
            total_orders: 100,
            in_progress_count: 10,
            completed_count: 60,
            pending_count: 30,
            orders_with_issues: 5,
            by_warehouse: [],
          })
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      // First attempt fails
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reintentar|retry/i })
        ).toBeInTheDocument()
      })

      // Click retry
      const retryButton = screen.getByRole('button', { name: /reintentar|retry/i })
      await userEvent.click(retryButton)

      // Should succeed on retry
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /reintentar|retry/i })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Server Error Handling (500, 502, 503)', () => {
    it('should handle 500 internal server error', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          )
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      await waitFor(() => {
        expect(
          screen.getByText(/error del servidor|server error/i)
        ).toBeInTheDocument()
      })
    })

    it('should handle 502 bad gateway', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          return HttpResponse.json(
            { message: 'Bad gateway' },
            { status: 502 }
          )
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      await waitFor(() => {
        expect(
          screen.getByText(/error del servidor|bad gateway/i)
        ).toBeInTheDocument()
      })
    })

    it('should handle 503 service unavailable', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          return HttpResponse.json(
            { message: 'Service unavailable' },
            { status: 503 }
          )
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      await waitFor(() => {
        expect(
          screen.getByText(/servicio no disponible|service unavailable/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('404 Not Found Handling', () => {
    it('should handle 404 for order detail', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      window.history.pushState({}, 'Order Detail', '/orders/NONEXISTENT')

      renderWithProviders(React.createElement(OrderDetailPage))

      await waitFor(() => {
        expect(
          screen.getByText(/orden no encontrada|order not found/i)
        ).toBeInTheDocument()
      })
    })

    it('should provide navigation back to orders list on 404', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      window.history.pushState({}, 'Order Detail', '/orders/NONEXISTENT')

      renderWithProviders(React.createElement(OrderDetailPage))

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /volver|atrás|back/i })
        ).toBeInTheDocument()
      })
    })
  })

  describe('Retry Logic', () => {
    it('should not retry on 4xx errors (client errors)', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      let requestCount = 0

      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          requestCount++
          return HttpResponse.json(
            { message: 'Bad request' },
            { status: 400 }
          )
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      await waitFor(() => {
        expect(screen.getByText(/bad request/i)).toBeInTheDocument()
      })

      // Should only make one request (no retry)
      expect(requestCount).toBe(1)
    })

    it('should show retry count in error message', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          return HttpResponse.error()
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      await waitFor(() => {
        expect(
          screen.getByText(/error de red|network error/i)
        ).toBeInTheDocument()
      })

      // Should mention retry option
      expect(screen.getByText(/reintentar|retry/i)).toBeInTheDocument()
    })
  })

  describe('Loading and Error State Transitions', () => {
    it('should show loading state before error', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          // Add delay to ensure loading state is visible
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(
                HttpResponse.json(
                  { message: 'Error' },
                  { status: 500 }
                )
              )
            }, 100)
          })
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      // Should show loading first
      expect(screen.getByTestId(/loading|spinner/i)).toBeInTheDocument()

      // Then show error
      await waitFor(() => {
        expect(
          screen.getByText(/error del servidor|server error/i)
        ).toBeInTheDocument()
      })
    })

    it('should recover from error on successful retry', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      let attemptCount = 0

      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          attemptCount++
          if (attemptCount === 1) {
            return HttpResponse.json(
              { message: 'Error' },
              { status: 500 }
            )
          }
          return HttpResponse.json({
            total_orders: 100,
            in_progress_count: 10,
            completed_count: 60,
            pending_count: 30,
            orders_with_issues: 5,
            by_warehouse: [],
          })
        })
      )

      renderWithProviders(React.createElement(DashboardPage))

      // First shows error
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reintentar|retry/i })
        ).toBeInTheDocument()
      })

      // Click retry
      const retryButton = screen.getByRole('button', { name: /reintentar|retry/i })
      await userEvent.click(retryButton)

      // Should show success
      await waitFor(() => {
        expect(screen.getByText(/órdenes/i)).toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /reintentar|retry/i })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Empty State Handling', () => {
    it('should show empty state when no orders match filters', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      server.use(
        http.get('*/api/admin/orders', () => {
          return HttpResponse.json({
            data: [],
            meta: {
              current_page: 1,
              last_page: 1,
              per_page: 15,
              total: 0,
            },
          })
        })
      )

      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(
          screen.getByText(/no se encontraron órdenes|no orders found/i)
        ).toBeInTheDocument()
      })
    })

    it('should provide option to clear filters on empty state', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      server.use(
        http.get('*/api/admin/orders', () => {
          return HttpResponse.json({
            data: [],
            meta: {
              current_page: 1,
              last_page: 1,
              per_page: 15,
              total: 0,
            },
          })
        })
      )

      renderWithProviders(React.createElement(OrdersPage))

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /limpiar filtros|clear filters/i })
        ).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle very large order numbers in search', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      renderWithProviders(React.createElement(OrdersPage))

      const searchInput = screen.getByRole('textbox', { name: /buscar|search/i })

      // Type a very long order number
      await userEvent.type(searchInput, 'EXP-2026-99999999999999999999')

      // Should handle gracefully (either show results or empty state)
      await waitFor(() => {
        expect(
          screen.queryByTestId(/error/i)
        ).not.toBeInTheDocument()
      })
    })

    it('should handle special characters in search', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      renderWithProviders(React.createElement(OrdersPage))

      const searchInput = screen.getByRole('textbox', { name: /buscar|search/i })

      // Type special characters
      await userEvent.type(searchInput, '!@#$%^&*()')

      // Should handle gracefully
      await waitFor(() => {
        expect(
          screen.queryByTestId(/error/i)
        ).not.toBeInTheDocument()
      })
    })

    it('should handle concurrent requests gracefully', async () => {
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      // Multiple requests happening at once (e.g., dashboard stats, orders, etc.)
      renderWithProviders(
        React.createElement(
          'div',
          null,
          React.createElement(DashboardPage),
          React.createElement(OrdersPage)
        )
      )

      // Should handle without errors
      await waitFor(() => {
        expect(
          screen.queryAllByTestId(/error/i).length
        ).toBe(0)
      })
    })
  })
})
