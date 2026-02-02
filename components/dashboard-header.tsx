'use client'

import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RUBROS, type Rubro } from '@/lib/data'

interface DashboardHeaderProps {
  selectedRubro: Rubro | 'all'
  onRubroChange: (rubro: Rubro | 'all') => void
}

export function DashboardHeader({
  selectedRubro,
  onRubroChange,
}: DashboardHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground">
          Panel de Riesgos
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Rubro Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtrar por:</span>
          <Select
            value={selectedRubro}
            onValueChange={(value) => onRubroChange(value as Rubro | 'all')}
          >
            <SelectTrigger className="w-40 bg-background/50">
              <SelectValue placeholder="Seleccionar rubro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los rubros</SelectItem>
              {RUBROS.map((rubro) => (
                <SelectItem key={rubro.value} value={rubro.value}>
                  <span className="flex items-center gap-2">
                    <span>{rubro.icon}</span>
                    <span>{rubro.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            3
          </span>
        </Button>

        {/* User Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          JD
        </div>
      </div>
    </header>
  )
}
