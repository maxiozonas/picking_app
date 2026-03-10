import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Employee, EmployeeFormData, PaginatedResponse, Warehouse } from '@/types/api'

export interface UseEmployeesParams {
  search?: string
  role?: string
  warehouse_id?: number | null
  is_active?: string
  page?: number
  perPage?: number
}

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
    staleTime: 30000,
  })
}

export function useWarehouses() {
  return useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await api.get('/admin/warehouses')
      // Response may be { data: [...] } or direct array
      const result = response.data
      return Array.isArray(result) ? result : (result?.data ?? result ?? [])
    },
    staleTime: 60000,
  })
}

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
  })
}

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
  })
}

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
  })
}
