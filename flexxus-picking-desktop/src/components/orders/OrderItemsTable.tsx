import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Check, X, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

import { PickingOrderItem } from '@/types/api'

interface OrderItemsTableProps {
  items: PickingOrderItem[]
  className?: string
}

function PickStatusIcon({ status }: { status: PickingOrderItem['status'] }) {
  switch (status) {
    case 'completed':
      return <Check className="h-4 w-4 text-green-600" />
    case 'in_progress':
      return <Minus className="h-4 w-4 text-yellow-600" />
    case 'pending':
      return <X className="h-4 w-4 text-gray-400" />
  }
}

export function OrderItemsTable({ items, className }: OrderItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        No hay items en este pedido
      </div>
    )
  }

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Estado</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="text-right">Pickeado</TableHead>
            <TableHead>Ubicación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <PickStatusIcon status={item.status} />
              </TableCell>
              <TableCell className="font-mono text-sm">{item.product_code}</TableCell>
              <TableCell>{item.product_name}</TableCell>
              <TableCell className="text-right font-medium">{item.quantity_required}</TableCell>
              <TableCell className="text-right font-medium">{item.quantity_picked}</TableCell>
              <TableCell>
                {item.location ? (
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                    {item.location}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
