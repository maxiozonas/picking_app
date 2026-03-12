import { User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getWarehouseColor } from '@/types/api'

interface EmployeeAvatarProps {
  name?: string | null
  warehouseCode?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}

const sizeMap = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
}

const iconSizeMap = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

/**
 * Extract initials from a name
 * Handles single names, multiple names, and edge cases
 */
function getInitials(name: string): string {
  if (!name || name.trim().length === 0) return '?'

  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    // Single name - take first 2 characters (or 1 if name is short)
    return parts[0].slice(0, 2).toUpperCase()
  }

  // Multiple names - take first letter of first two parts
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function EmployeeAvatar({
  name,
  warehouseCode,
  size = 'md',
  className,
  'aria-label': ariaLabel,
}: EmployeeAvatarProps) {
  const hasName = name && name.trim().length > 0
  const initials = hasName ? getInitials(name) : null

  // Get warehouse-specific background color, or default to slate
  const bgColor = warehouseCode
    ? getWarehouseColor(warehouseCode)
    : 'hsl(215 20% 65%)' // Default slate-400

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-md font-medium',
        'transition-all duration-[var(--transition-fast)]',
        'hover:scale-105 hover:shadow-md',
        sizeMap[size],
        className
      )}
      style={{
        backgroundColor: hasName ? `${bgColor.replace(')', ') / 0.15')}` : 'hsl(218 11% 13%)',
        color: bgColor,
        border: `1px solid ${bgColor.replace(')', ') / 0.3')}`,
      }}
      aria-label={ariaLabel || name || 'Empleado'}
    >
      {initials ? (
        <span className="font-semibold">{initials}</span>
      ) : (
        <User className={iconSizeMap[size]} style={{ color: 'hsl(214 8% 52%)' }} />
      )}
    </div>
  )
}
