import { cn } from '@/lib/utils'
import { getWarehouseColor } from '@/types/api'

interface OrderProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  warehouseCode?: string
  className?: string
  showPercentage?: boolean
  'aria-label'?: string
}

export function OrderProgressRing({
  progress,
  size = 64,
  strokeWidth = 6,
  warehouseCode,
  className,
  showPercentage = true,
  'aria-label': ariaLabel,
}: OrderProgressRingProps) {
  // Validate and clamp progress
  const clampedProgress = Math.max(0, Math.min(100, progress))

  // Calculate SVG circle properties
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedProgress / 100) * circumference

  // Get warehouse color or default to progress color
  const strokeColor = warehouseCode
    ? getWarehouseColor(warehouseCode)
    : 'hsl(217 91% 60%)' // Default blue

  // Determine color based on progress if no warehouse specified
  const progressColor =
    clampedProgress >= 100
      ? 'hsl(142 76% 36%)' // Green for complete
      : clampedProgress > 0
        ? 'hsl(217 91% 60%)' // Blue for in progress
        : 'hsl(215 20% 65%)' // Gray for not started

  const finalColor = warehouseCode ? strokeColor : progressColor

  return (
    <div
      className={cn('inline-flex items-center justify-center', className)}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel || `Progreso: ${clampedProgress}%`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
          opacity={0.3}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={finalColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-[var(--transition-normal)] ease-out"
          style={{
            filter: `drop-shadow(0 0 4px ${finalColor} / 0.3)`,
          }}
        />
      </svg>

      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'font-mono text-xs font-semibold tabular-nums',
              clampedProgress >= 100
                ? 'text-green-400'
                : clampedProgress > 0
                  ? 'text-blue-400'
                  : 'text-slate-400'
            )}
          >
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
    </div>
  )
}
