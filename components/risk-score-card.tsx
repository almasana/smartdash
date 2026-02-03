"use client";

import React from "react";
import { RiskEvaluation } from "@/lib/domain/risk";
import { RadialGauge } from "@/components/radial-gauge";

interface RiskScoreCardProps {
  evaluation: RiskEvaluation;
  metrics?: Record<string, unknown>;
}

export function RiskScoreCard({ evaluation }: RiskScoreCardProps) {
  const { score, level } = evaluation;

  // Mapeo visual corporativo
  const isCritical = score >= 80;
  const statusColor = isCritical ? "text-red-600" : score >= 50 ? "text-orange-500" : "text-emerald-600";
  const barColor = isCritical ? "bg-red-600" : score >= 50 ? "bg-orange-500" : "bg-emerald-600";

  return (
    // Panel estilo "Papel Corporativo" o "Tarjeta High-End"
    <div className="w-full bg-[#f8fafc] dark:bg-[#1e293b] rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
      
      {/* Decoración de fondo sutil (circuitería o grid) */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] pointer-events-none" />

      {/* COLUMNA 1: GAUGE (El Velocímetro) */}
      <div className="shrink-0 relative z-10">
        <RadialGauge value={score} size={140} strokeWidth={12} label="SCORE" />
      </div>

      {/* COLUMNA 2: INFO TEXTUAL MASIVA */}
      <div className="flex-1 w-full relative z-10 flex flex-col justify-center">
        
        {/* Título Principal */}
        <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-4 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-700 dark:text-slate-200 tracking-tight">
            ÍNDICE DE RIESGO GLOBAL:
          </h2>
          <span className={`text-4xl md:text-5xl font-black ${statusColor} drop-shadow-sm`}>
            {score.toFixed(1)} ({level?.toUpperCase()})
          </span>
        </div>

        {/* Barra de Salud Organizacional */}
        <div className="w-full space-y-2">
           <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Salud Organizacional
              </span>
              <span className={`text-xs font-bold uppercase ${statusColor}`}>
                {level}
              </span>
           </div>
           
           {/* Progress Bar Container */}
           <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner relative">
              {/* Progress Bar Fill */}
              <div 
                className={`h-full ${barColor} transition-all duration-1000 ease-out relative`}
                style={{ width: `${score}%` }}
              >
                  {/* Efecto de brillo en la barra */}
                  <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-r from-transparent to-white/30" />
              </div>
           </div>
           
           <p className="text-right text-[10px] text-slate-400 italic mt-1">
             Actualizado en tiempo real • Fuente: SmartDash Engine
           </p>
        </div>
      </div>
    </div>
  );
}