'use client'

import { useEffect, useState } from 'react'
import { RISK_COLORS, type RiskLevel } from '@/lib/data'

interface RadialGaugeProps {
  value: number
  maxValue: number
  level: RiskLevel
  size?: number
  strokeWidth?: number
  label?: string
  showValue?: boolean
}

export function RadialGauge({
  value,
  maxValue,
  level,
  size = 200,
  strokeWidth = 20,
  label,
  showValue = true,
}: RadialGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  const radius = (size - strokeWidth) / 2
  const circumference = radius * Math.PI // Semi-circle
  const center = size / 2

  useEffect(() => {
    const duration = 1500
    const startTime = Date.now()
    const startValue = animatedValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out-cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (value - startValue) * easeOut

      setAnimatedValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  const percentage = animatedValue / maxValue
  const strokeDashoffset = circumference * (1 - percentage)

  const color = RISK_COLORS[level]

  // Create gradient stops based on risk level
  const gradientId = `gauge-gradient-${label?.replace(/\s/g, '-')}`

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
          strokeLinecap="round"
        />

        {/* Animated foreground arc */}
        <path
          d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-100"
          style={{
            filter: `drop-shadow(0 0 6px ${color}40)`,
          }}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = Math.PI * (1 - tick / 100)
          const innerRadius = radius - strokeWidth / 2 - 8
          const outerRadius = radius - strokeWidth / 2 - 4
          const x1 = center + innerRadius * Math.cos(angle)
          const y1 = center - innerRadius * Math.sin(angle)
          const x2 = center + outerRadius * Math.cos(angle)
          const y2 = center - outerRadius * Math.sin(angle)

          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={2}
              className="text-muted-foreground/50"
            />
          )
        })}
      </svg>

      {showValue && (
        <div className="absolute bottom-0 flex flex-col items-center">
          <span
            className="text-4xl font-bold tabular-nums"
            style={{ color }}
          >
            {Math.round(animatedValue)}
          </span>
          {label && (
            <span className="text-sm text-muted-foreground">{label}</span>
          )}
        </div>
      )}
    </div>
  )
}

// Mini gauge for alerts counters
export function MiniGauge({
  value,
  maxValue,
  color,
  label,
}: {
  value: number
  maxValue: number
  color: string
  label: string
}) {
  const [animatedValue, setAnimatedValue] = useState(0)

  const size = 100
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * Math.PI

  useEffect(() => {
    const duration = 1000
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setAnimatedValue(value * easeOut)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  const percentage = animatedValue / maxValue
  const strokeDashoffset = circumference * (1 - percentage)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg width={size} height={size / 2 + 10}>
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
            strokeLinecap="round"
          />
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
          />
        </svg>
        <span
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-2xl font-bold tabular-nums"
          style={{ color }}
        >
          {Math.round(animatedValue)}
        </span>
      </div>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  )
}
