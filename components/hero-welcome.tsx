"use client";

import Link from "next/link";
import { ArrowRight, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroWelcome() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Rejilla intacta */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        {/* Orbes de luz actualizados a Azul/Indigo */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-800/50 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Columna Izquierda: Propuesta de Valor + CTA + Barra de Confianza */}
            <div className="text-left animate-in fade-in slide-in-from-left-4 duration-700">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
                Tu empresa está perdiendo dinero y no sabes dónde.
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed max-w-xl mb-8">
                Detecta riesgos operativos y legales a tiempo con nuestro motor de inteligencia predictiva.
              </p>
              <div className="mb-8">
                <Link
                  href="/dashboard#clientes-section"
                  className={cn(
                    "inline-flex items-center gap-3 px-8 py-5 rounded-2xl",
                    "bg-gradient-to-r from-[#1e3a8a] to-[#4f46e5]",
                    "text-white text-lg font-black uppercase tracking-wider",
                    "shadow-2xl shadow-indigo-500/50",
                    "hover:shadow-indigo-500/70 hover:scale-105",
                    "transition-all duration-300 group"
                  )}
                >
                  Detectar Riesgos Ahora
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <p className="text-sm text-slate-400 mt-3">Sin tarjeta requerida</p>
              </div>
              {/* Barra de Confianza */}
              <div className="flex items-center gap-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-indigo-400" />
                  <span className="text-sm font-bold text-white">+500</span>
                  <span className="text-sm text-slate-400">Empresas monitoreadas</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Elemento Visual Potente con Glassmorphism Inclinado */}
            <div className="relative perspective-1000 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
              <div className="transform rotate-y-[-15deg] rotate-x-[10deg] origin-center">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl shadow-indigo-500/30">
                  {/* Simulación de Captura de Dashboard */}
                  <div className="bg-slate-900/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Alerta Crítica Resuelta</h3>
                      <CheckCircle size={24} className="text-emerald-400" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle size={16} />
                        <span>Riesgo Detectado: Fraude en Transacciones</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle size={16} />
                        <span>Acción Tomada: Bloqueo Automático</span>
                      </div>
                      <div className="text-slate-400 text-sm">
                        Pérdidas Evitadas: $45,000
                      </div>
                    </div>
                    {/* Bloque Azul con Leyenda */}
                    <div className="mt-4 h-24 bg-gradient-to-r from-[#1e3a8a] to-[#4f46e5] rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/5" />
                      <p className="font-black text-white/90 text-sm tracking-widest uppercase z-10 text-center px-4">
                        SmartDash FV • Fuente de la Verdad
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full py-6 px-8 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              SmartDash FV &bull; Fuente de la Verdad
            </p>
            <p className="text-xs text-slate-600">
              Protocolo de Auditoría v1.0
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default HeroWelcome;