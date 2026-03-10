import { Building2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWarehouseFilterStore } from '@/contexts/WarehouseFilterContext'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Warehouse } from '@/types/api'

interface WarehouseSelectorProps {
  className?: string
}

export function WarehouseSelector({ className }: WarehouseSelectorProps) {
  const { selectedWarehouseId, setSelectedWarehouseId } = useWarehouseFilterStore()

  // Fetch warehouses list
  const { data: warehouses } = useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
        const response = await api.get('/admin/warehouses')
        const body = response.data as any

        // Support both plain arrays and Laravel Resource collections ({ data: [...] })
        if (Array.isArray(body)) {
          return body as Warehouse[]
        }

        if (body && typeof body === 'object' && Array.isArray(body.data)) {
          return body.data as Warehouse[]
        }

        return [] as Warehouse[]
    },
  })

  return (
    <div className={className}>
      <Select
        value={selectedWarehouseId?.toString() || 'all'}
        onValueChange={(value) => {
          setSelectedWarehouseId(value === 'all' ? null : parseInt(value, 10))
        }}
      >
        <SelectTrigger className="w-[250px]">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Todos los depósitos" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los depósitos</SelectItem>
          {warehouses?.map((warehouse) => (
            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
              {warehouse.name} ({warehouse.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
