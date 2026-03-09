import { Button } from '@/components/ui/button'
import { Eye, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface OrderActionsProps {
  orderNumber: string
  onRefresh?: () => void
}

export function OrderActions({ orderNumber, onRefresh }: OrderActionsProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/orders/${orderNumber}`)}
        className="h-8 w-8 p-0"
        title="Ver detalles"
      >
        <Eye className="h-4 w-4" />
      </Button>
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="h-8 w-8 p-0"
          title="Actualizar"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
