"use client";

import React from "react";
import { DashboardSidebar } from "@/components/sidebar";
import { WhatsAppChat } from "@/components/whatsapp-chat";
import { RiskScoreCard } from "@/components/risk-score-card";
import { MitigationWizard } from "@/components/mitigation-wizard";
import { RiskDashboardData } from "@/lib/services/risk.service";

interface DashboardContentProps {
  initialData: RiskDashboardData;
  currentRubro: string;
}

export function DashboardContent({
  initialData,
  currentRubro,
}: DashboardContentProps) {
  /**
   * NORMALIZACIÓN CRÍTICA
   * Nunca renderizamos métricas sin validar tipo.
   * Esto evita crashes SSR / Hydration / Runtime.
   */
  const score: number | null =
    typeof initialData?.score === "number"
      ? initialData.score
      : null;

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-black text-white">
      {/* Sidebar anclada */}
      <DashboardSidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header / Scoring Top */}
        <div className="shrink-0 border-b border-white/5 bg-black/40 backdrop-blur px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm uppercase tracking-widest text-white/60">
                Cliente Maestro
              </h1>
              <p className="text-xs text-white/40">
                Rubro activo: {currentRubro}
              </p>
            </div>

            <div className="text-center">
              <span className="block text-[4rem] font-mono font-bold text-red-500 animate-pulse leading-none">
                {score !== null ? score.toFixed(1) : "—"}
              </span>
              <span className="text-sm text-white/70">
                Score Crítico del Cliente
              </span>
            </div>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-hidden flex">
          {/* Panel izquierdo: señales / métricas */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <RiskScoreCard
              evaluation={initialData.evaluation}
              metrics={initialData.metrics}
            />

            {initialData.mitigationPlan && (
              <MitigationWizard
                plan={initialData.mitigationPlan}
                onSendMessage={() => {}}
              />
            )}
          </div>

          {/* Panel derecho: Chat */}
          <div className="w-[420px] border-l border-white/5 overflow-hidden">
            <WhatsAppChat
              messages={initialData.notifications}
              onMarkAsRead={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
