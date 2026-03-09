import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { handlers } from '@/test/mocks/handlers'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import OrdersPage from '@/pages/OrdersPage'
import OrderDetailPage from '@/pages/OrderDetailPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// MSW server setup
const server = setupServer(...handlers)

describe('User Flow Tests: Login → Dashboard → Orders → Detail', () => {
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
    // Reset auth state
    useAuthStore.getState().logout()
  })

  afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
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

  const renderApp = () => {
    return renderWithProviders(
      React.createElement(
        Routes,
        {},
        React.createElement(Route, {
          path: '/login',
          element: React.createElement(LoginPage),
        }),
        React.createElement(
          Route,
          {
            path: '/',
            element: React.createElement(ProtectedRoute, {}),
          },
          React.createElement(Route, {
            index: true,
            element: React.createElement(DashboardPage),
          }),
          React.createElement(Route, {
            path: 'orders',
            element: React.createElement(OrdersPage),
          }),
          React.createElement(Route, {
            path: 'orders/:orderNumber',
            element: React.createElement(OrderDetailPage),
          })
        )
      )
    )
  }

  describe('Flow: Complete Login to Order Detail Journey', () => {
    it('should navigate from login to dashboard to orders to detail', async () => {
      const { container } = renderApp()

      // Step 1: User is on login page
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()

      // Step 2: User enters credentials and logs in
      const emailInput = screen.getByLabelText(/correo/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const loginButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await userEvent.type(emailInput, 'admin@example.com')
      await userEvent.type(passwordInput, 'password')
      await userEvent.click(loginButton)

      // Step 3: User is redirected to dashboard
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })

      // Step 4: Dashboard shows statistics
      await waitFor(() => {
        expect(screen.getByText(/órdenes/i)).toBeInTheDocument()
      })

      // Step 5: User navigates to orders page
      const ordersLink = screen.getByText(/órdenes/i)
      await userEvent.click(ordersLink)

      // Step 6: Orders list is displayed
      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      // Step 7: User clicks on an order to view details
      const orderLink = screen.getByText(/EXP-2026-00123/)
      await userEvent.click(orderLink)

      // Step 8: Order detail page is shown
      await waitFor(() => {
        expect(screen.getByText(/detalle de orden/i)).toBeInTheDocument()
      })

      // Verify order details are displayed
      expect(screen.getByText(/Cliente ABC/i)).toBeInTheDocument()
      expect(screen.getByText(/items/i)).toBeInTheDocument()
    })
  })

  describe('Flow: Protected Routes Redirect', () => {
    it('should redirect to login when accessing protected route without auth', async () => {
      // Start at dashboard without auth
      window.history.pushState({}, 'Dashboard', '/')

      renderApp()

      // Should redirect to login
      await waitFor(() => {
        expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
      })
    })

    it('should allow access to protected routes after login', async () => {
      // Login first
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      window.history.pushState({}, 'Dashboard', '/')

      renderApp()

      // Should see dashboard content
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
    })
  })

  describe('Flow: Login Error Handling', () => {
    it('should show error message on failed login', async () => {
      // Override handler to return error
      server.use(
        http.post('*/api/auth/login', () => {
          return HttpResponse.json(
            { message: 'Credenciales inválidas' },
            { status: 401 }
          )
        })
      )

      renderApp()

      const emailInput = screen.getByLabelText(/correo/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const loginButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await userEvent.type(emailInput, 'wrong@example.com')
      await userEvent.type(passwordInput, 'wrongpassword')
      await userEvent.click(loginButton)

      // Should show error message
      await waitFor(() => {
        expect(
          screen.getByText(/credenciales inválidas|error de autenticación/i)
        ).toBeInTheDocument()
      })

      // Should still be on login page
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
    })
  })

  describe('Flow: Logout Journey', () => {
    it('should logout and redirect to login page', async () => {
      // Start logged in
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      renderApp()

      // Should be on dashboard
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })

      // Click logout button (assuming there's one in the sidebar/header)
      const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i })
      await userEvent.click(logoutButton)

      // Should redirect to login
      await waitFor(() => {
        expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
      })

      // Auth store should be cleared
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('Flow: Dashboard Filters to Orders', () => {
    it('should navigate from dashboard to orders with warehouse filter', async () => {
      // Start logged in
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      renderApp()

      // On dashboard
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })

      // Select warehouse filter (if implemented)
      const warehouseFilter = screen.getByRole('combobox', {
        name: /warehouse/i,
      })
      await userEvent.selectOptions(warehouseFilter, 'CENTRO')

      // Click "View Orders" button on a stat card
      const viewOrdersButton = screen.getAllByText(/ver órdenes/i)[0]
      await userEvent.click(viewOrdersButton)

      // Should navigate to orders page with filter applied
      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      // Verify warehouse filter is active
      expect(warehouseFilter).toHaveValue('CENTRO')
    })
  })

  describe('Flow: Orders List Pagination', () => {
    it('should navigate through paginated orders', async () => {
      // Start logged in
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      window.history.pushState({}, 'Orders', '/orders')

      renderApp()

      // On orders page
      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      // Click next page
      const nextPageButton = screen.getByRole('button', { name: /siguiente|next/i })
      await userEvent.click(nextPageButton)

      // Should show loading state
      expect(screen.getByTestId(/loading|spinner/i)).toBeInTheDocument()

      // Should show new page of orders
      await waitFor(() => {
        expect(screen.getByText(/página 2/i)).toBeInTheDocument()
      })
    })
  })

  describe('Flow: Search Orders', () => {
    it('should search for orders by order number', async () => {
      // Start logged in
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      window.history.pushState({}, 'Orders', '/orders')

      renderApp()

      // On orders page
      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      // Type in search box
      const searchInput = screen.getByRole('textbox', { name: /buscar/i })
      await userEvent.type(searchInput, 'EXP-2026-00123')

      // Should show filtered results
      await waitFor(() => {
        expect(screen.getByText(/EXP-2026-00123/i)).toBeInTheDocument()
      })

      // Should not show other orders
      expect(screen.queryByText(/EXP-2026-00124/i)).not.toBeInTheDocument()
    })
  })

  describe('Flow: Order Detail Navigation', () => {
    it('should navigate from orders list to order detail and back', async () => {
      // Start logged in
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      window.history.pushState({}, 'Orders', '/orders')

      renderApp()

      // On orders page
      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })

      // Click on an order
      const orderLink = screen.getByText(/EXP-2026-00123/)
      await userEvent.click(orderLink)

      // Should be on order detail page
      await waitFor(() => {
        expect(screen.getByText(/detalle de orden/i)).toBeInTheDocument()
      })

      // Click back button
      const backButton = screen.getByRole('button', { name: /volver|atrás/i })
      await userEvent.click(backButton)

      // Should be back on orders list
      await waitFor(() => {
        expect(screen.getByText(/lista de órdenes/i)).toBeInTheDocument()
      })
    })
  })

  describe('Flow: View Order Items and Alerts', () => {
    it('should display order items and alerts on detail page', async () => {
      // Start logged in
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      window.history.pushState({}, 'Order Detail', '/orders/EXP-2026-00123')

      renderApp()

      // On order detail page
      await waitFor(() => {
        expect(screen.getByText(/detalle de orden/i)).toBeInTheDocument()
      })

      // Should show items section
      expect(screen.getByText(/items/i)).toBeInTheDocument()

      // Should show at least one item
      expect(screen.getByText(/PROD-001|Producto de prueba/i)).toBeInTheDocument()

      // Should show alerts section (if any)
      const alertsSection = screen.queryByText(/alertas/i)
      if (alertsSection) {
        expect(alertsSection).toBeInTheDocument()
        expect(screen.getByText(/Stock insuficiente/i)).toBeInTheDocument()
      }
    })
  })

  describe('Flow: Session Expiry', () => {
    it('should redirect to login when session expires', async () => {
      // Start logged in
      useAuthStore
        .getState()
        .login(
          { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
          'token'
        )

      renderApp()

      // On dashboard
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })

      // Simulate 401 response (session expired)
      server.use(
        http.get('*/api/admin/dashboard/stats', () => {
          return HttpResponse.json(
            { message: 'Unauthenticated' },
            { status: 401 }
          )
        })
      )

      // Try to fetch data
      await waitFor(() => {
        expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
      })

      // Auth store should be cleared
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })
})
