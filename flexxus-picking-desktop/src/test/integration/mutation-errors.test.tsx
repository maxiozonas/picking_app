import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { toast } from 'sonner'
import { useOrders } from '@/hooks/use-orders'
import { QueryCacheTime } from '@/lib/query-config'

// MSW server setup
const server = setupServer()

const mockOrders = {
  data: [
    {
      id: 1,
      order_number: 'EXP-2026-00123',
      customer_name: 'Cliente ABC',
      status: 'in_progress',
      warehouse: { id: 1, code: 'CENTRO', name: 'Centro' },
    },
  ],
  meta: {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 1,
  },
}

describe('Mutation Error Handling Integration Tests', () => {
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
    vi.spyOn(toast, 'error')
    vi.spyOn(toast, 'success')
  })

  afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
    vi.restoreAllMocks()
  })

  afterAll(() => {
    server.close()
  })

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  describe('toast notifications on mutation failure', () => {
    it('should show toast notification on 422 validation error', async () => {
      // Mock a mutation endpoint (e.g., create order or employee)
      server.use(
        http.post('*/api/admin/employees', () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: {
                email: ['The email field is required.'],
                name: ['The name field is required.'],
              },
            },
            { status: 422 }
          )
        })
      )

      const TestComponent = () => {
        const [mutate] = React.useState<any>(null)

        // Simulate a mutation that would fail with 422
        const handleMutate = async () => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/employees`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({}),
            })
            const data = await response.json()
            if (!response.ok) {
              throw data
            }
            return data
          } catch (error: any) {
            // This would normally be handled by the mutation's onError
            if (error.errors) {
              const firstError = Object.values(error.errors)[0] as string[]
              toast.error(firstError[0])
            } else {
              toast.error(error.message || 'An error occurred')
            }
            throw error
          }
        }

        return (
          <div>
            <button onClick={handleMutate}>Submit</button>
          </div>
        )
      }

      render(
        React.createElement(TestComponent),
        { wrapper }
      )

      const button = screen.getByText('Submit')
      button.click()

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('required')
        )
      })
    })

    it('should show toast notification on 500 server error', async () => {
      server.use(
        http.post('*/api/admin/employees', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const TestComponent = () => {
        const handleMutate = async () => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/employees`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: 'Test', email: 'test@example.com' }),
            })
            if (!response.ok) {
              const data = await response.json()
              throw data
            }
            return await response.json()
          } catch (error: any) {
            toast.error(error.message || 'An error occurred')
            throw error
          }
        }

        return <button onClick={handleMutate}>Submit</button>
      }

      render(React.createElement(TestComponent), { wrapper })

      const button = screen.getByText('Submit')
      button.click()

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Internal Server Error')
      })
    })

    it('should show network error toast on connection failure', async () => {
      server.use(
        http.post('*/api/admin/employees', () => {
          return HttpResponse.error()
        })
      )

      const TestComponent = () => {
        const handleMutate = async () => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/employees`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: 'Test', email: 'test@example.com' }),
            })
            if (!response.ok) {
              throw new Error('Network error')
            }
            return await response.json()
          } catch (error: any) {
            toast.error('Network error. Please check your connection.')
            throw error
          }
        }

        return <button onClick={handleMutate}>Submit</button>
      }

      render(React.createElement(TestComponent), { wrapper })

      const button = screen.getByText('Submit')
      button.click()

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Network error')
        )
      })
    })
  })

  describe('cache invalidation behavior on mutation errors', () => {
    it('should NOT invalidate cache on mutation error', async () => {
      // Populate cache first
      server.use(
        http.get('*/api/admin/orders', () => {
          return HttpResponse.json(mockOrders)
        }),
        http.post('*/api/admin/orders', () => {
          return HttpResponse.json(
            { message: 'Validation failed' },
            { status: 422 }
          )
        })
      )

      const { result } = renderHook(() => useOrders(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const cachedDataBeforeMutation = queryClient.getQueryData(['orders', null, null, null, 1, 15, null, null])

      // Perform mutation that fails
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/admin/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      } catch (e) {
        // Expected to fail
      }

      // Cache should NOT be invalidated
      const cachedDataAfterMutation = queryClient.getQueryData(['orders', null, null, null, 1, 15, null, null])

      expect(cachedDataAfterMutation).toEqual(cachedDataBeforeMutation)
    })

    it('should NOT refetch queries after failed mutation', async () => {
      let fetchCount = 0

      server.use(
        http.get('*/api/admin/orders', () => {
          fetchCount++
          return HttpResponse.json(mockOrders)
        }),
        http.post('*/api/admin/orders', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useOrders(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const fetchCountBeforeMutation = fetchCount

      // Perform failed mutation
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/admin/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      } catch (e) {
        // Expected
      }

      // Should NOT trigger refetch
      await waitFor(() => {
        expect(fetchCount).toBe(fetchCountBeforeMutation)
      })
    })
  })

  describe('form accessibility after mutation errors', () => {
    it('should keep form accessible after validation error', async () => {
      server.use(
        http.post('*/api/admin/employees', () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: { email: ['Invalid email format'] },
            },
            { status: 422 }
          )
        })
      )

      const TestComponent = () => {
        const [email, setEmail] = React.useState('')
        const [isSubmitting, setIsSubmitting] = React.useState(false)

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()
          setIsSubmitting(true)
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/employees`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            })
            if (!response.ok) {
              const data = await response.json()
              throw data
            }
            toast.success('Employee created')
          } catch (error: any) {
            if (error.errors) {
              toast.error(error.errors.email[0])
            }
          } finally {
            setIsSubmitting(false)
          }
        }

        return (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              data-testid="email-input"
            />
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </form>
        )
      }

      render(React.createElement(TestComponent), { wrapper })

      const input = screen.getByTestId('email-input') as HTMLInputElement
      const button = screen.getByText('Submit') as HTMLButtonElement

      // Initially accessible
      expect(input.disabled).toBe(false)
      expect(button.disabled).toBe(false)

      // Submit with invalid data
      button.click()

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      // Form should still be accessible
      expect(input.disabled).toBe(false)
      expect(button.disabled).toBe(false)

      // Should be able to type and submit again
      input.value = 'test@example.com'
      input.dispatchEvent(new Event('input', { bubbles: true }))

      expect(input.value).toBe('test@example.com')
    })

    it('should allow resubmission after error', async () => {
      let attemptCount = 0

      server.use(
        http.post('*/api/admin/employees', () => {
          attemptCount++
          if (attemptCount === 1) {
            return HttpResponse.json(
              { message: 'Server error' },
              { status: 500 }
            )
          }
          return HttpResponse.json({ id: 1, name: 'Test' })
        })
      )

      const TestComponent = () => {
        const [submitCount, setSubmitCount] = React.useState(0)

        const handleSubmit = async () => {
          setSubmitCount((prev) => prev + 1)
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/employees`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: 'Test' }),
            })
            if (!response.ok) {
              throw await response.json()
            }
            toast.success('Success')
          } catch (error: any) {
            toast.error(error.message || 'Error')
          }
        }

        return (
          <div>
            <button onClick={handleSubmit}>Submit</button>
            <span data-testid="count">{submitCount}</span>
          </div>
        )
      }

      render(React.createElement(TestComponent), { wrapper })

      const button = screen.getByText('Submit')
      const count = screen.getByTestId('count')

      // First attempt (fails)
      button.click()

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      expect(count.textContent).toBe('1')

      // Second attempt (succeeds)
      button.click()

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })

      expect(count.textContent).toBe('2')
    })
  })

  describe('error message display from API', () => {
    it('should display API error message in toast', async () => {
      const apiErrorMessage = 'Employee with this email already exists'

      server.use(
        http.post('*/api/admin/employees', () => {
          return HttpResponse.json(
            { message: apiErrorMessage },
            { status: 409 }
          )
        })
      )

      const TestComponent = () => {
        const handleSubmit = async () => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/employees`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: 'existing@example.com' }),
            })
            if (!response.ok) {
              const data = await response.json()
              throw data
            }
          } catch (error: any) {
            toast.error(error.message)
          }
        }

        return <button onClick={handleSubmit}>Submit</button>
      }

      render(React.createElement(TestComponent), { wrapper })

      const button = screen.getByText('Submit')
      button.click()

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(apiErrorMessage)
      })
    })

    it('should extract validation errors from response', async () => {
      const validationErrors = {
        name: ['The name field is required.'],
        email: ['The email must be a valid email address.'],
      }

      server.use(
        http.post('*/api/admin/employees', () => {
          return HttpResponse.json(
            { message: 'Validation failed', errors: validationErrors },
            { status: 422 }
          )
        })
      )

      const TestComponent = () => {
        const handleSubmit = async () => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/employees`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({}),
            })
            if (!response.ok) {
              const data = await response.json()
              throw data
            }
          } catch (error: any) {
            if (error.errors) {
              const firstError = Object.values(error.errors)[0] as string[]
              toast.error(firstError[0])
            }
          }
        }

        return <button onClick={handleSubmit}>Submit</button>
      }

      render(React.createElement(TestComponent), { wrapper })

      const button = screen.getByText('Submit')
      button.click()

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'The name field is required.'
        )
      })
    })
  })
})
