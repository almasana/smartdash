"use client"

import React from "react"
import { AIActionPlan } from "@/lib/domain/risk"

interface MitigationWizardProps {
  plan: AIActionPlan
  onSendMessage: (content: string) => void
  disabled?: boolean
}

export function MitigationWizard({ plan, onSendMessage, disabled }: MitigationWizardProps) {
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-xl bg-card">
      <h3 className="font-bold text-sm">Plan de Mitigación AI</h3>
      <p className="text-xs italic">{plan.rationale}</p>

      <ul className="list-disc list-inside text-sm space-y-1">
        {plan.immediate_steps.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </ul>

      <button
        onClick={() => onSendMessage(plan.suggested_message || "")}
        disabled={disabled}
        className={`mt-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
          ${disabled ? 'bg-muted/30 text-muted-foreground cursor-not-allowed' 
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
      >
        Generar Plan AI
      </button>

      {disabled && (
        <p className="text-red-500 text-xs italic mt-1">
          ⚠️ Bloqueado: la Fuente de la Verdad presenta inconsistencias. Revisar alertas de Admin.
        </p>
      )}
    </div>
  )
}
