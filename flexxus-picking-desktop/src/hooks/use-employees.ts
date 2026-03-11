import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Employee, EmployeeFormData, PaginatedResponse, Warehouse } from '@/types/api'
import { QueryCacheTime } from '@/lib/query-config'
import { toast } from '@/hooks/use-toast'

export interface UseEmployeesParams {
  search?: string
  role?: string
  warehouse_id?: number | null
  is_active?: string
  page?: number
  perPage?: number
}

function generatePlaceholderEmployees(count: number): PaginatedResponse<Employee> {
  return {
    data: Array.from({ length: count }, (_, i) => ({
      id: i,
      username: `user_${i}`,
      name: `Usuario ${i + 1}`,
      email: `user${i}@example.com`,
      role: 'empleado',
      is_active: true,
      created_at: new Date().toISOString(),
    })),
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: count,
      total: count,
    },
  }
}

/**
 * Fetches paginated list of employees with filters and search capabilities.
 * 
 * @param params - Query parameters for filtering and pagination
 * @param params.search - Search term to filter by username, name, or email
 * @param params.role - Role filter ('admin' | 'empleado' | 'all')
 * @param params.warehouse_id - Warehouse ID filter
 * @param params.is_active - Active status filter ('true' | 'false' | 'all')
 * @param params.page - Page number for pagination (default: 1)
 * @param params.perPage - Number of items per page (default: 15)
 * 
 * @returns TanStack Query result with PaginatedResponse<Employee>
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useEmployees({
 *   role: 'empleado',
 *   warehouse_id: 1,
 *   page: 1,
 *   perPage: 15
 * })
 * ```
 * 
 * @remarks
 * - **Cache Time:** 60 seconds (QueryCacheTime.Employees)
 * - **Placeholder Data:** Shows skeleton UI with 15 placeholder items during loading
 * - **Query Key:** `['employees', search, role, warehouse_id, is_active, page, perPage]`
 * - **UX Feature:** Prevents layout shift during pagination transitions
 */
export function useEmployees(params: UseEmployeesParams = {}) {
  const { search, role, warehouse_id, is_active, page = 1, perPage = 15 } = params

  return useQuery<PaginatedResponse<Employee>>({
    queryKey: ['employees', search, role, warehouse_id, is_active, page, perPage],
    queryFn: async () => {
      const queryParams = new URLSearchParams()

      if (search) queryParams.append('search', search)
      if (role && role !== 'all') queryParams.append('role', role)
      if (warehouse_id) queryParams.append('warehouse_id', warehouse_id.toString())
      if (is_active && is_active !== 'all') queryParams.append('is_active', is_active)

      queryParams.append('page', page.toString())
      queryParams.append('per_page', perPage.toString())

      const response = await api.get(`/admin/users?${queryParams.toString()}`)
      return response.data
    },
    placeholderData: (previousData) => previousData ?? generatePlaceholderEmployees(perPage),
    staleTime: QueryCacheTime.Employees,
  })
}

/**
 * Fetches list of all warehouses available in the system.
 * 
 * @returns TanStack Query result with Warehouse[] array
 * 
 * @example
 * ```tsx
 * const { data: warehouses, isLoading, error } = useWarehouses()
 * ```
 * 
 * @remarks
 * - **Cache Time:** 5 minutes (QueryCacheTime.Warehouses)
 * - **Low Volatility:** Warehouses rarely change, hence long cache time
 * - **Query Key:** `['warehouses']`
 * - **Response Format:** Handles both array and { data: [...] } response formats
 */
export function useWarehouses() {
  return useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await api.get('/admin/warehouses')
      // Response may be { data: [...] } or direct array
      const result = response.data
      return Array.isArray(result) ? result : (result?.data ?? result ?? [])
    },
    staleTime: QueryCacheTime.Warehouses,
  })
}

/**
 * Mutation to create a new employee in the system.
 * 
 * @returns TanStack mutation with trigger function
 * 
 * @example
 * ```tsx
 * const createEmployee = useCreateEmployee()
 * 
 * const handleSubmit = (data: EmployeeFormData) => {
 *   createEmployee.mutate(data)
 * }
 * ```
 * 
 * @remarks
 * - **Endpoint:** POST /admin/users
 * - **Cache Invalidation:** Invalidates ['employees'] query on success
 * - **Error Handling:** Shows toast notification with error message
 * - **Success Handling:** Automatically refetches employee list
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const response = await api.post('/admin/users', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al crear empleado'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      })
    },
  })
}

/**
 * Mutation to update an existing employee's information.
 * 
 * @returns TanStack mutation with trigger function
 * 
 * @example
 * ```tsx
 * const updateEmployee = useUpdateEmployee()
 * 
 * const handleUpdate = (id: number, data: Partial<EmployeeFormData>) => {
 *   updateEmployee.mutate({ id, data })
 * }
 * ```
 * 
 * @remarks
 * - **Endpoint:** PUT /admin/users/{id}
 * - **Cache Invalidation:** Invalidates ['employees'] query on success
 * - **Error Handling:** Shows toast notification with error message
 * - **Success Handling:** Automatically refetches employee list
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EmployeeFormData> }) => {
      const response = await api.put(`/admin/users/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al actualizar empleado'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      })
    },
  })
}

/**
 * Mutation to delete an employee from the system.
 * 
 * @returns TanStack mutation with trigger function
 * 
 * @example
 * ```tsx
 * const deleteEmployee = useDeleteEmployee()
 * 
 * const handleDelete = (id: number) => {
 *   if (confirm('Are you sure?')) {
 *     deleteEmployee.mutate(id)
 *   }
 * }
 * ```
 * 
 * @remarks
 * - **Endpoint:** DELETE /admin/users/{id}
 * - **Cache Invalidation:** Invalidates ['employees'] query on success
 * - **Error Handling:** Shows toast notification with error message
 * - **Success Handling:** Automatically refetches employee list
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/users/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Error al eliminar empleado'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      })
    },
  })
}
