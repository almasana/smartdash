import React from 'react'
import { RiskSignal } from '@/lib/domain/risk'
import { getSeverityUI } from '@/lib/ui/risk-ui.mapper'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface RiskTableProps {
  signals: RiskSignal[]
}

export function RiskTable({ signals }: RiskTableProps) {
  if (!signals || signals.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-muted-foreground">
        No se han detectado señales activas en este rubro.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[30%]">Señal / Alerta</TableHead>
            <TableHead className="w-[15%]">Severidad</TableHead>
            <TableHead>Descripción del Impacto</TableHead>
            <TableHead className="hidden md:table-cell">Contexto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signals.map((signal, index) => {
            const ui = getSeverityUI(signal.severity);
            
            return (
              <TableRow key={signal.code || index} className="hover:bg-muted/10 transition-colors">
                {/* Señal / Alerta */}
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{signal.label}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {signal.code}
                    </span>
                  </div>
                </TableCell>

                {/* Severidad - Badges dinámicos vía Mapper */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${ui.dot}`} aria-hidden="true" />
                    <span className={`text-xs font-semibold ${ui.color}`}>
                      {ui.label}
                    </span>
                  </div>
                </TableCell>

                {/* Descripción del Impacto */}
                <TableCell className="text-sm text-foreground/80">
                  {signal.impact_description}
                </TableCell>

                {/* Contexto - Solo visible en Desktop */}
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="font-mono text-[10px] font-normal">
                    {signal.context || 'N/A'}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}