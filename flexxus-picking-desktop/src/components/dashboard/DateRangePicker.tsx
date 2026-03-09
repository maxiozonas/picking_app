import { Calendar } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  dateFrom?: string
  dateTo?: string
  onDateFromChange: (date: string) => void
  onDateToChange: (date: string) => void
  className?: string
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="date-from" className="text-xs text-muted-foreground">
          Desde
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="pl-9 w-[160px]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="date-to" className="text-xs text-muted-foreground">
          Hasta
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="pl-9 w-[160px]"
          />
        </div>
      </div>
    </div>
  )
}
