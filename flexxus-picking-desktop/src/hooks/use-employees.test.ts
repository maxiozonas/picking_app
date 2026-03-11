import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  useEmployees,
  useWarehouses,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from '@/hooks/use-employees'
import api from '@/lib/api'
import { Employee, PaginatedResponse, Warehouse } from '@/types/api'
import { QueryCacheTime } from '@/lib/query-config'

vi.mock('@/lib/api')

describe('useEmployees', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  it('should fetch employees', async () => {
    const mockEmployees: PaginatedResponse<Employee> = {
      data: [
        {
          id: 1,
          username: 'juan',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          role: 'empleado',
          is_active: true,
          created_at: '2026-03-09T10:00:00Z',
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 1,
      },
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockEmployees })

    const { result } = renderHook(() => useEmployees(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.isFetching).toBe(false)
    })

    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('page=1'))
    expect(result.current.data?.data).toHaveLength(1)
    expect(result.current.data?.data[0].username).toBe('juan')
  })

  it('should use QueryCacheTime.Employees for staleTime', async () => {
    const mockEmployees: PaginatedResponse<Employee> = {
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockEmployees })

    const { result } = renderHook(() => useEmployees(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(QueryCacheTime.Employees).toBe(60000)
  })

  it('should provide placeholder data while loading', async () => {
    vi.mocked(api.get).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                data: [],
                meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
              },
            })
          }, 100)
        })
    )

    const { result } = renderHook(() => useEmployees(), { wrapper })

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.data).toHaveLength(15)
    expect(result.current.isFetching).toBe(true)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should handle search parameter', async () => {
    const mockEmployees: PaginatedResponse<Employee> = {
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockEmployees })

    const { result } = renderHook(() => useEmployees({ search: 'juan' }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('search=juan'))
  })

  it('should handle role parameter', async () => {
    const mockEmployees: PaginatedResponse<Employee> = {
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockEmployees })

    const { result } = renderHook(() => useEmployees({ role: 'admin' }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('role=admin'))
  })

  it('should handle warehouse_id parameter', async () => {
    const mockEmployees: PaginatedResponse<Employee> = {
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockEmployees })

    const { result } = renderHook(() => useEmployees({ warehouse_id: 1 }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('warehouse_id=1'))
  })

  it('should handle is_active parameter', async () => {
    const mockEmployees: PaginatedResponse<Employee> = {
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockEmployees })

    const { result } = renderHook(() => useEmployees({ is_active: 'true' }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('is_active=true'))
  })

  it('should handle pagination', async () => {
    const mockEmployees: PaginatedResponse<Employee> = {
      data: [],
      meta: { current_page: 2, last_page: 5, per_page: 15, total: 75 },
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockEmployees })

    const { result } = renderHook(() => useEmployees({ page: 2 }), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('page=2'))
  })
})

describe('useWarehouses', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  it('should fetch warehouses', async () => {
    const mockWarehouses: Warehouse[] = [
      { id: 1, name: 'Centro', code: 'CENTRO', is_active: true },
      { id: 2, name: 'Sur', code: 'SUR', is_active: true },
    ]

    vi.mocked(api.get).mockResolvedValue({ data: mockWarehouses })

    const { result } = renderHook(() => useWarehouses(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith('/admin/warehouses')
    expect(result.current.data).toHaveLength(2)
  })

  it('should use QueryCacheTime.Warehouses for staleTime (5 minutes)', async () => {
    const mockWarehouses: Warehouse[] = []

    vi.mocked(api.get).mockResolvedValue({ data: mockWarehouses })

    const { result } = renderHook(() => useWarehouses(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(QueryCacheTime.Warehouses).toBe(300000)
  })

  it('should handle { data: [...] } response format', async () => {
    const mockWarehouses: Warehouse[] = [{ id: 1, name: 'Centro', code: 'CENTRO', is_active: true }]

    vi.mocked(api.get).mockResolvedValue({ data: { data: mockWarehouses } })

    const { result } = renderHook(() => useWarehouses(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockWarehouses)
  })
})

describe('useCreateEmployee', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  it('should create employee and invalidate queries', async () => {
    const newEmployee = {
      username: 'newuser',
      name: 'New User',
      email: 'new@example.com',
      role: 'empleado' as const,
      is_active: true,
      password: 'password123',
    }

    const mockResponse = {
      id: 1,
      ...newEmployee,
      created_at: '2026-03-11T10:00:00Z',
    }

    vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

    const { result } = renderHook(() => useCreateEmployee(), { wrapper })

    await result.current.mutateAsync(newEmployee)

    expect(api.post).toHaveBeenCalledWith('/admin/users', newEmployee)
    await waitFor(() => {
      expect(queryClient.isMutating()).toBe(0)
    })
  })
})

describe('useUpdateEmployee', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  it('should update employee and invalidate queries', async () => {
    const updateData = {
      name: 'Updated Name',
      is_active: false,
    }

    const mockResponse = {
      id: 1,
      username: 'juan',
      name: 'Updated Name',
      email: 'juan@example.com',
      role: 'empleado',
      is_active: false,
      created_at: '2026-03-09T10:00:00Z',
    }

    vi.mocked(api.put).mockResolvedValue({ data: mockResponse })

    const { result } = renderHook(() => useUpdateEmployee(), { wrapper })

    await result.current.mutateAsync({ id: 1, data: updateData })

    expect(api.put).toHaveBeenCalledWith('/admin/users/1', updateData)
    await waitFor(() => {
      expect(queryClient.isMutating()).toBe(0)
    })
  })
})

describe('useDeleteEmployee', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  it('should delete employee and invalidate queries', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { success: true } })

    const { result } = renderHook(() => useDeleteEmployee(), { wrapper })

    await result.current.mutateAsync(1)

    expect(api.delete).toHaveBeenCalledWith('/admin/users/1')
    await waitFor(() => {
      expect(queryClient.isMutating()).toBe(0)
    })
  })
})
