import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardLayoutProps {
  leftColumn: React.ReactNode;
  centerColumn: React.ReactNode;
  rightColumn: React.ReactNode;
}

export function DashboardLayout({ leftColumn, centerColumn, rightColumn }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-[#09090b] text-slate-200 overflow-hidden font-sans">
      {/* IZQUIERDA: Score y Resumen */}
      <aside className="w-[280px] border-r border-white/5 flex flex-col bg-[#09090b]">
        <div className="p-6 border-b border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">SmartDash AI</span>
        </div>
        <ScrollArea className="flex-1 px-4 py-6">{leftColumn}</ScrollArea>
      </aside>

      {/* CENTRAL: Evidencia */}
      <main className="flex-1 flex flex-col bg-[#0c0c0e]">
        <header className="h-14 border-b border-white/5 flex items-center px-8 bg-[#09090b]/50 backdrop-blur-md z-10">
          <h1 className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Consola de Decisión Operativa</h1>
        </header>
        <ScrollArea className="flex-1 p-8">{centerColumn}</ScrollArea>
      </main>

      {/* DERECHA: Acción */}
      <aside className="w-[360px] border-l border-white/5 flex flex-col bg-[#09090b]">
        <header className="p-4 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Centro de Mitigación</h2>
        </header>
        <div className="flex-1 flex flex-col overflow-hidden">
          {rightColumn}
        </div>
      </aside>
    </div>
  );
}