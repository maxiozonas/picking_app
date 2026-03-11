import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { QueryCacheTime } from '@/lib/query-config'
import { handlers } from '@/test/mocks/handlers'
import EmployeeFormDialog from '@/components/employees/EmployeeFormDialog'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// MSW server setup
const server = setupServer(...handlers)

const mockEmployee = {
  id: 1,
  name: 'Juan Pérez',
  email: 'juan@example.com',
  warehouse_id: 1,
  warehouse: {
    id: 1,
    code: 'CENTRO',
    name: 'Centro',
  },
}

const mockWarehouses = [
  { id: 1, code: 'CENTRO', name: 'Centro' },
  { id: 2, code: 'NORTE', name: 'Norte' },
]

describe('E2E: Employee Mutation Error Handling', () => {
  let queryClient: QueryClient

  beforeAll(() => {
    server.listen()
  })

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: QueryCacheTime.STALE_TIME,
          gcTime: QueryCacheTime.GC_TIME,
        },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
    vi.spyOn(toast, 'error')
    vi.spyOn(toast, 'success')

    // Set authenticated state
    useAuthStore.getState().login({
      user: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
      token: 'mock-token',
    })

    // Setup default handlers
    server.use(
      http.get('*/api/admin/warehouses', () => {
        return HttpResponse.json(mockWarehouses)
      })
    )
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
        React.createElement(
          BrowserRouter,
          null,
          React.createElement(ProtectedRoute, { children: component })
        )
      )
    )
  }

  describe('successful employee creation flow', () => {
    it('should successfully create an employee', async () => {
      server.use(
        http.post('*/api/admin/employees', async ({ request }) => {
          const body = await request.json()
          return HttpResponse.json(
            {
              ...mockEmployee,
              ...body,
            },
            { status: 201 }
          )
        })
      )

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(true)
        const [isLoading, setIsLoading] = React.useState(false)

        const handleSubmit = async (data: any) => {
          setIsLoading(true)
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/employees`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${useAuthStore.getState().token}`,
              },
              body: JSON.stringify(data),
            })

            if (!response.ok) {
              const error = await response.json()
              throw error
            }

            const result = await response.json()
            toast.success('Employee created successfully')
            setIsOpen(false)
            return result
          } catch (error: any) {
            if (error.errors) {
              const firstError = Object.values(error.errors)[0] as string[]
              toast.error(firstError[0])
            } else {
              toast.error(error.message || 'Failed to create employee')
            }
            throw error
          } finally {
            setIsLoading(false)
          }
        }

        return React.createElement(
          EmployeeFormDialog,
          {
            open: isOpen,
            onOpenChange: setIsOpen,
            onSubmit: handleSubmit,
            isLoading: isLoading,
          }
        )
      }

      renderWithProviders(React.createElement(TestComponent))

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText(/create employee|add employee/i)).toBeInTheDocument()
      })

      // Fill form
      const nameInput = screen.getByLabelText(/name/i) || screen.getByPlaceholderText(/name/i)
      const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i)
      const warehouseSelect = screen.getByLabelText(/warehouse/i)

      fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } })
      fireEvent.change(emailInput, { target: { value: 'juan@example.com' } })
      fireEvent.change(warehouseSelect, { target: { value: '1' } })

      // Submit form
      const submitButton = screen.getByText(/create|save|submit/i)
      fireEvent.click(submitButton)

      // Should show success toast
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Employee created successfully')
      })

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByText(/create employee/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('validation error (422) handling', () => {
    it('should show validation error toast on 422 response', async () => {
      server.use(
        http.post('*/api/admin/employees', async ({ request }) => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: {
                email: ['The email has already been taken.'],
                name: ['The name field is required.'],
              },
            },
            { status: 422 }
          )
        })
      )

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(true)
        const [isLoading, setIsLoading] = React.useState(false)

        const handleSubmit = async (data: any) => {
          setIsLoading(true)
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/employees`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${useAuthStore.getState().token}`,
              },
              body: JSON.stringify(data),
            })

            if (!response.ok) {
              const error = await response.json()
              throw error
            }

            toast.success('Employee created')
            setIsOpen(false)
          } catch (error: any) {
            if (error.errors) {
              const firstError = Object.values(error.errors)[0] as string[]
              toast.error(firstError[0])
            } else {
              toast.error(error.message || 'Failed to create employee')
            }
            throw error
          } finally {
            setIsLoading(false)
          }
        }

        return React.createElement(
          EmployeeFormDialog,
          {
            open: isOpen,
            onOpenChange: setIsOpen,
            onSubmit: handleSubmit,
            isLoading: isLoading,
          }
        )
      }

      renderWithProviders(React.createElement(TestComponent))

      // Wait for dialog
      await waitFor(() => {
        expect(screen.getByText(/create employee/i)).toBeInTheDocument()
      })

      // Fill form with duplicate email
      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })

      // Submit form
      const submitButton = screen.getByText(/create|save/i)
      fireEvent.click(submitButton)

      // Should show validation error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('The email has already been taken.')
      })

      // Should NOT show success toast
      expect(toast.success).not.toHaveBeenCalled()
    })

    it('should show individual field validation errors', async () => {
      server.use(
        http.post('*/api/admin/employees', async () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: {
                name: ['The name field is required.'],
                email: ['The email must be a valid email address.'],
                warehouse_id: ['The warehouse_id field is required.'],
              },
            },
            { status: 422 }
          )
        })
      )

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(true)
        const [isLoading, setIsLoading] = React.useState(false)
        const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})

        const handleSubmit = async (data: any) => {
          setIsLoading(true)
          setFieldErrors({})
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/employees`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${useAuthStore.getState().token}`,
              },
              body: JSON.stringify(data),
            })

            if (!response.ok) {
              const error = await response.json()
              if (error.errors) {
                setFieldErrors(error.errors)
                throw error
              }
            }

            toast.success('Employee created')
            setIsOpen(false)
          } catch (error: any) {
            if (error.errors) {
              const firstError = Object.values(error.errors)[0] as string[]
              toast.error(firstError[0])
            }
          } finally {
            setIsLoading(false)
          }
        }

        return React.createElement(
          'div',
          null,
          React.createElement(EmployeeFormDialog, {
            open: isOpen,
            onOpenChange: setIsOpen,
            onSubmit: handleSubmit,
            isLoading: isLoading,
            fieldErrors: fieldErrors,
          })
        )
      }

      renderWithProviders(React.createElement(TestComponent))

      await waitFor(() => {
        expect(screen.getByText(/create employee/i)).toBeInTheDocument()
      })

      // Submit empty form
      const submitButton = screen.getByText(/create|save/i)
      fireEvent.click(submitButton)

      // Should show validation error
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('The name field is required.')
      })
    })
  })

  describe('form accessibility after error', () => {
    it('should keep form accessible after validation error', async () => {
      server.use(
        http.post('*/api/admin/employees', async () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: {
                email: ['The email has already been taken.'],
              },
            },
            { status: 422 }
          )
        })
      )

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(true)
        const [isLoading, setIsLoading] = React.useState(false)

        const handleSubmit = async (data: any) => {
          setIsLoading(true)
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/employees`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${useAuthStore.getState().token}`,
              },
              body: JSON.stringify(data),
            })

            if (!response.ok) {
              const error = await response.json()
              throw error
            }

            setIsOpen(false)
          } catch (error: any) {
            if (error.errors) {
              const firstError = Object.values(error.errors)[0] as string[]
              toast.error(firstError[0])
            }
          } finally {
            setIsLoading(false)
          }
        }

        return React.createElement(
          EmployeeFormDialog,
          {
            open: isOpen,
            onOpenChange: setIsOpen,
            onSubmit: handleSubmit,
            isLoading: isLoading,
          }
        )
      }

      renderWithProviders(React.createElement(TestComponent))

      await waitFor(() => {
        expect(screen.getByText(/create employee/i)).toBeInTheDocument()
      })

      // Fill form with existing email
      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })

      const submitButton = screen.getByText(/create|save/i)
      fireEvent.click(submitButton)

      // Wait for error
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      // Form should still be open
      expect(screen.getByText(/create employee/i)).toBeInTheDocument()

      // Form inputs should still be accessible
      const nameInput = screen.getByLabelText(/name/i)
      expect(nameInput).not.toBeDisabled()

      // Should be able to modify and resubmit
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } })
      expect((nameInput as HTMLInputElement).value).toBe('Updated Name')
    })

    it('should allow correction and resubmission after error', async () => {
      let attemptCount = 0

      server.use(
        http.post('*/api/admin/employees', async ({ request }) => {
          attemptCount++
          const body = await request.json()

          // First attempt fails
          if (attemptCount === 1) {
            return HttpResponse.json(
              {
                message: 'Validation failed',
                errors: {
                  email: ['The email has already been taken.'],
                },
              },
              { status: 422 }
            )
          }

          // Second attempt succeeds
          return HttpResponse.json(
            {
              ...mockEmployee,
              ...body,
            },
            { status: 201 }
          )
        })
      )

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(true)
        const [isLoading, setIsLoading] = React.useState(false)

        const handleSubmit = async (data: any) => {
          setIsLoading(true)
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/employees`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${useAuthStore.getState().token}`,
              },
              body: JSON.stringify(data),
            })

            if (!response.ok) {
              const error = await response.json()
              throw error
            }

            toast.success('Employee created')
            setIsOpen(false)
          } catch (error: any) {
            if (error.errors) {
              const firstError = Object.values(error.errors)[0] as string[]
              toast.error(firstError[0])
            }
          } finally {
            setIsLoading(false)
          }
        }

        return React.createElement(
          EmployeeFormDialog,
          {
            open: isOpen,
            onOpenChange: setIsOpen,
            onSubmit: handleSubmit,
            isLoading: isLoading,
          }
        )
      }

      renderWithProviders(React.createElement(TestComponent))

      await waitFor(() => {
        expect(screen.getByText(/create employee/i)).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText(/email/i)
      const nameInput = screen.getByLabelText(/name/i)
      const submitButton = screen.getByText(/create|save/i)

      // First attempt with invalid email
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
      fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } })
      fireEvent.click(submitButton)

      // Should show error
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('The email has already been taken.')
      })

      // Correct the email
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } })

      // Submit again
      fireEvent.click(submitButton)

      // Should succeed
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Employee created')
      })

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByText(/create employee/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('server error (500) handling', () => {
    it('should show server error toast on 500 response', async () => {
      server.use(
        http.post('*/api/admin/employees', async () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(true)
        const [isLoading, setIsLoading] = React.useState(false)

        const handleSubmit = async (data: any) => {
          setIsLoading(true)
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/employees`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${useAuthStore.getState().token}`,
              },
              body: JSON.stringify(data),
            })

            if (!response.ok) {
              const error = await response.json()
              throw error
            }

            setIsOpen(false)
          } catch (error: any) {
            toast.error(error.message || 'Failed to create employee')
          } finally {
            setIsLoading(false)
          }
        }

        return React.createElement(
          EmployeeFormDialog,
          {
            open: isOpen,
            onOpenChange: setIsOpen,
            onSubmit: handleSubmit,
            isLoading: isLoading,
          }
        )
      }

      renderWithProviders(React.createElement(TestComponent))

      await waitFor(() => {
        expect(screen.getByText(/create employee/i)).toBeInTheDocument()
      })

      const submitButton = screen.getByText(/create|save/i)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Internal Server Error')
      })

      // Form should remain open
      expect(screen.getByText(/create employee/i)).toBeInTheDocument()
    })
  })
})
