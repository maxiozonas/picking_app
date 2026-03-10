import React, { useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  Warehouse,
  ShieldCheck,
  HardHat,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, useWarehouses } from '@/hooks/use-employees'
import { EmployeeFormDialog } from '@/components/employees/EmployeeFormDialog'
import { useToast } from '@/hooks/use-toast'
import type { Employee, EmployeeFormData } from '@/types/api'
import { AxiosError } from 'axios'

export function EmployeesPage() {
  const { toast } = useToast()

  // Filters
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue])

  // Data
  const { data, isLoading, isError, error } = useEmployees({
    search: debouncedSearch || undefined,
    role: roleFilter,
    is_active: activeFilter,
    page: currentPage,
  })
  useWarehouses() // prefetch for dialog

  // Mutations
  const createMutation = useCreateEmployee()
  const updateMutation = useUpdateEmployee()
  const deleteMutation = useDeleteEmployee()

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Employee | null>(null)

  const handleCreate = () => {
    setEditingEmployee(null)
    setDialogOpen(true)
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setDialogOpen(true)
  }

  const handleSubmit = (formData: EmployeeFormData) => {
    if (editingEmployee) {
      updateMutation.mutate(
        { id: editingEmployee.id, data: formData },
        {
          onSuccess: () => {
            toast({ title: 'Empleado actualizado', description: `${formData.name} fue actualizado correctamente.` })
            setDialogOpen(false)
          },
          onError: (err) => {
            const message = err instanceof AxiosError ? err.response?.data?.message ?? err.message : 'Error desconocido'
            toast({ title: 'Error al actualizar', description: message, variant: 'destructive' })
          },
        }
      )
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast({ title: 'Empleado creado', description: `${formData.name} fue creado correctamente.` })
          setDialogOpen(false)
        },
        onError: (err) => {
          const message = err instanceof AxiosError ? err.response?.data?.message ?? err.message : 'Error desconocido'
          toast({ title: 'Error al crear', description: message, variant: 'destructive' })
        },
      })
    }
  }

  const handleDelete = (employee: Employee) => {
    setDeleteConfirm(employee)
  }

  const confirmDelete = () => {
    if (!deleteConfirm) return
    deleteMutation.mutate(deleteConfirm.id, {
      onSuccess: () => {
        toast({ title: 'Empleado eliminado', description: `${deleteConfirm.name} fue eliminado.` })
        setDeleteConfirm(null)
      },
      onError: (err) => {
        const message = err instanceof AxiosError ? err.response?.data?.message ?? err.message : 'Error desconocido'
        toast({ title: 'Error al eliminar', description: message, variant: 'destructive' })
      },
    })
  }

  const employees = data?.data ?? []
  const meta = data?.meta

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground">
            Empleados
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestión de empleados y depósitos</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-5">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div>
            <p className="font-medium text-red-400">Error al cargar empleados</p>
            <p className="text-sm text-muted-foreground">{error?.message || 'Ha ocurrido un error desconocido'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground">
            Empleados
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestión de empleados y depósitos</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo empleado
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Nombre, usuario o email..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rol
          </label>
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1) }}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Todos</option>
            <option value="empleado">Empleado</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Estado
          </label>
          <select
            value={activeFilter}
            onChange={e => { setActiveFilter(e.target.value); setCurrentPage(1) }}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Todos</option>
            <option value="1">Activos</option>
            <option value="0">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Empleado</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Rol</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Depósito</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Estado</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-24 animate-pulse rounded bg-surface-elevated" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No se encontraron empleados</p>
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr
                    key={emp.id}
                    className="border-b border-border/50 transition-colors hover:bg-surface-elevated/50"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">@{emp.username}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{emp.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium',
                          emp.role === 'admin'
                            ? 'bg-violet-500/10 text-violet-400'
                            : 'bg-blue-500/10 text-blue-400'
                        )}
                      >
                        {emp.role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : <HardHat className="h-3 w-3" />}
                        {emp.role === 'admin' ? 'Admin' : 'Empleado'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {emp.warehouse ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                          <Warehouse className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-mono text-xs text-primary">{emp.warehouse.code}</span>
                          <span className="text-muted-foreground">—</span>
                          <span>{emp.warehouse.name}</span>
                        </span>
                      ) : (
                        <span className="text-xs italic text-muted-foreground/50">
                          {emp.role === 'admin' ? 'N/A' : 'Sin asignar'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {emp.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
                          <XCircle className="h-3.5 w-3.5" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {employees.length} de {meta.total} empleados
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-sm tabular-nums text-muted-foreground">
              {currentPage} / {meta.last_page}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(meta.last_page, p + 1))}
              disabled={currentPage === meta.last_page}
              className="rounded border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <EmployeeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        employee={editingEmployee}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
              Confirmar eliminación
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              ¿Estás seguro de que deseas eliminar a <span className="font-medium text-foreground">{deleteConfirm.name}</span>?
              Esta acción no se puede deshacer.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
