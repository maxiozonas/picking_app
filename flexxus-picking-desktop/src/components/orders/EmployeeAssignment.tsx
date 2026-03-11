import { User } from 'lucide-react'

interface EmployeeAssignmentProps {
  employee?: {
    id: number
    name: string
    email?: string
  } | null
}

export function EmployeeAssignment({ employee }: EmployeeAssignmentProps) {
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Empleado Asignado
      </p>

      {employee ? (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-primary/10 text-sm font-bold text-primary">
            {getInitials(employee.name)}
          </div>
          <div>
            <p className="font-medium text-foreground">{employee.name}</p>
            {employee.email && <p className="text-xs text-muted-foreground">{employee.email}</p>}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex h-10 w-10 items-center justify-center rounded border border-dashed border-border">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm">Sin asignar</span>
        </div>
      )}
    </div>
  )
}
