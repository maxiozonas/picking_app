import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWarehouses } from '@/hooks/use-employees'
import type { Employee, EmployeeFormData } from '@/types/api'

interface EmployeeFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: EmployeeFormData) => void
  employee?: Employee | null
  isLoading?: boolean
}

export function EmployeeFormDialog({
  open,
  onClose,
  onSubmit,
  employee,
  isLoading,
}: EmployeeFormDialogProps) {
  const { data: warehouses = [] } = useWarehouses()
  const isEditing = !!employee

  const [form, setForm] = useState<EmployeeFormData>({
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'empleado',
    warehouse_id: null,
    is_active: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (employee) {
      setForm({
        username: employee.username,
        name: employee.name,
        email: employee.email,
        role: employee.role as 'admin' | 'empleado',
        warehouse_id: employee.warehouse?.id ?? null,
        is_active: employee.is_active,
      })
    } else {
      setForm({
        username: '',
        name: '',
        email: '',
        password: '',
        role: 'empleado',
        warehouse_id: null,
        is_active: true,
      })
    }
    setErrors({})
  }, [employee, open])

  if (!open) return null

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.username.trim()) errs.username = 'El usuario es obligatorio'
    if (!form.name.trim()) errs.name = 'El nombre es obligatorio'
    if (!form.email.trim()) errs.email = 'El email es obligatorio'
    if (!isEditing && (!form.password || form.password.length < 6)) {
      errs.password = 'La contraseña debe tener al menos 6 caracteres'
    }
    if (form.role === 'empleado' && !form.warehouse_id) {
      errs.warehouse_id = 'El depósito es obligatorio para empleados'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const payload: EmployeeFormData = { ...form }
    if (isEditing && !payload.password) {
      delete payload.password
    }
    onSubmit(payload)
  }

  const updateField = <K extends keyof EmployeeFormData>(key: K, value: EmployeeFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
            {isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Usuario
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => updateField('username', e.target.value)}
              className={cn(
                'flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary',
                errors.username ? 'border-red-500' : 'border-input'
              )}
              placeholder="nombre.usuario"
            />
            {errors.username && <p className="text-xs text-red-400">{errors.username}</p>}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nombre completo
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={cn(
                'flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary',
                errors.name ? 'border-red-500' : 'border-input'
              )}
              placeholder="Juan Pérez"
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={cn(
                'flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary',
                errors.email ? 'border-red-500' : 'border-input'
              )}
              placeholder="juan@empresa.com"
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contraseña{' '}
              {isEditing && (
                <span className="normal-case tracking-normal text-muted-foreground">
                  (dejar vacío para mantener)
                </span>
              )}
            </label>
            <input
              type="password"
              value={form.password ?? ''}
              onChange={(e) => updateField('password', e.target.value)}
              className={cn(
                'flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary',
                errors.password ? 'border-red-500' : 'border-input'
              )}
              placeholder={isEditing ? '••••••' : 'Mínimo 6 caracteres'}
            />
            {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
          </div>

          {/* Role + Warehouse row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rol
              </label>
              <select
                value={form.role}
                onChange={(e) => {
                  const role = e.target.value as 'admin' | 'empleado'
                  updateField('role', role)
                  if (role === 'admin') updateField('warehouse_id', null)
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="empleado">Empleado</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Warehouse */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Depósito
              </label>
              <select
                value={form.warehouse_id ?? ''}
                onChange={(e) =>
                  updateField('warehouse_id', e.target.value ? Number(e.target.value) : null)
                }
                disabled={form.role === 'admin'}
                className={cn(
                  'flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
                  errors.warehouse_id ? 'border-red-500' : 'border-input'
                )}
              >
                <option value="">Seleccionar...</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.code} — {wh.name}
                  </option>
                ))}
              </select>
              {errors.warehouse_id && <p className="text-xs text-red-400">{errors.warehouse_id}</p>}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateField('is_active', !form.is_active)}
              className={cn(
                'relative h-5 w-9 rounded-full border transition-colors',
                form.is_active
                  ? 'border-primary bg-primary/20'
                  : 'border-border bg-surface-elevated'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all',
                  form.is_active ? 'left-[18px] bg-primary' : 'left-0.5 bg-muted-foreground'
                )}
              />
            </button>
            <span className="text-sm text-foreground">
              {form.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
