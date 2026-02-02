'use client'

import React from "react"

import { useState } from 'react'
import {
  LayoutDashboard,
  AlertTriangle,
  TrendingUp,
  Users,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { currentClient } from '@/lib/data'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  active?: boolean
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '#', active: true },
  { icon: AlertTriangle, label: 'Alertas', href: '#' },
  { icon: TrendingUp, label: 'Análisis', href: '#' },
  { icon: Users, label: 'Equipo', href: '#' },
]

const bottomItems: NavItem[] = [
  { icon: Settings, label: 'Configuración', href: '#' },
  { icon: HelpCircle, label: 'Ayuda', href: '#' },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border bg-card/50 backdrop-blur-sm transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          SD
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">SmartDash</span>
          </div>
        )}
      </div>

      {/* Client Info */}
      {!collapsed && (
        <div className="border-b border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">Cliente:</p>
          <p className="text-sm font-medium text-foreground truncate">
            {currentClient.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Segmento:{' '}
            <span className="capitalize text-foreground">
              {currentClient.segment}
            </span>
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              item.active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </a>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-border p-2">
        {bottomItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </a>
        ))}
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-card shadow-sm"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  )
}
