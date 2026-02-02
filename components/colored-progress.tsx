'use client'

import { cn } from '@/lib/utils'

interface ColoredProgressProps {
  value: number
  color: string
  className?: string
}

export function ColoredProgress({
  value,
  color,
  className,
}: ColoredProgressProps) {
  return (
    <div
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full',
        className
      )}
      style={{ backgroundColor: `${color}20` }}
    >
      <div
        className="h-full transition-all duration-500 rounded-full"
        style={{
          width: `${value}%`,
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}60`,
        }}
      />
    </div>
  )
}
