import { OrderStatus } from '@/types/api'
import { Search } from 'lucide-react'

interface OrderFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  statusFilter: OrderStatus | 'all'
  onStatusChange: (status: OrderStatus | 'all') => void
}

const statusOptions: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Proceso' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export function OrderFilters({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: OrderFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por número de pedido..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded border border-border bg-surface py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
        />
      </div>

      <div className="flex items-center gap-1 rounded border border-border bg-surface p-1">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === option.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
