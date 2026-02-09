"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getRiskToken } from "@/lib/ui/risk-tokens";
import { AlertCircle, CheckCircle, AlertTriangle, DollarSign, ShieldAlert, Briefcase, Activity, Layers, FileText } from "lucide-react";

/**
 * Campos requeridos por FV para render de Caso Testigo.
 * - cliente_nombre_comercial: clientes.nombre_comercial
 * - logo_url: clientes.img_clientes
 * - escenario: escenarios_riesgo.titulo
 * - vertical: verticales_negocio.nombre (mapeado desde escenario.vertical_id)
 * - nivel_riesgo: capturas_riesgo.nivel_riesgo_actual
 * - puntaje_global: capturas_riesgo.puntaje_global
 * - descripcion_base: escenarios_riesgo.descripcion_base
 * - monto_en_riesgo: capturas_riesgo.monto_en_riesgo (si aplica)
 * - captura_id: capturas_riesgo.id
 * - moneda: capturas_riesgo.contexto_financiero?.moneda (si aplica)
 * - segmento: clientes.segmento (agregado para ficha de escenario)
 */
export interface CasoTestigoCardUI {
  captura_id: string;
  cliente_nombre_comercial: string;
  logo_url: string | null;
  escenario: string;
  vertical: string;
  nivel_riesgo: "Bajo" | "Medio" | "Alto" | "Crítico";
  puntaje_global?: number | null;
  monto_en_riesgo?: number | null;
  descripcion_base: string | null;
  moneda?: string | null;
  segmento?: string; // Campo opcional para Tipo de Negocio
}

interface CasoTestigoCardProps {
  caso: CasoTestigoCardUI;
  onClick?: () => void;
  href?: string;
}

export function CasoTestigoCardSkeleton() {
  return (
    <Card className="rounded-3xl border-2 border-slate-100 overflow-hidden h-full">
      <Skeleton className="h-1.5 w-full" />
      <div className="p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3 mb-2">
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl mt-4" />
      </div>
    </Card>
  );
}

/**
 * Card individual de caso testigo con estructura de Ficha Técnica
 */
export function CasoTestigoCardUI({ caso, onClick, href }: CasoTestigoCardProps) {
  const riskToken = getRiskToken(caso.nivel_riesgo);
  const riskIcon = {
    "Crítico": ShieldAlert,
    "Alto": AlertTriangle,
    "Medio": AlertCircle,
    "Bajo": CheckCircle,
  }[caso.nivel_riesgo];

  const RiskIcon = riskIcon;

  const CardContent = (
    <Card
      className={cn(
        "relative overflow-hidden rounded-3xl border-2 transition-all duration-300 bg-white shadow-lg hover:shadow-2xl hover:border-[#4f46e5] cursor-pointer group flex flex-col h-full",
        riskToken.border
      )}
      onClick={onClick}
    >
      <div className={cn("h-1.5 w-full", riskToken.bg)} />

      <div className="p-7 flex flex-col gap-5 h-full">

        {/* Titulo General de Ficha */}
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            Ficha de Escenario
          </span>
          {caso.segmento && (
            <Badge variant="secondary" className="text-[9px] h-5 px-2 font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 border-0">
              {caso.segmento}
            </Badge>
          )}
        </div>

        {/* Contenido Principal Estructurado */}
        <div className="space-y-5 flex-1">

          {/* Tipo de Negocio (Texto explícito si se requiere además del badge) */}
          {caso.segmento && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tipo de Negocio:</span>
              <div className="flex items-center gap-2 text-slate-700">
                <Briefcase size={15} className="text-slate-400" />
                <span className="text-sm font-bold">{caso.segmento}</span>
              </div>
            </div>
          )}

          {/* Señal Detectada */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Señal detectada:</span>
            <div className="flex items-start gap-2">
              <Activity size={16} className="text-indigo-600 mt-0.5 shrink-0" />
              <span className="text-sm font-black text-slate-900 leading-tight">
                {caso.escenario?.replace(/\s*-\s*startup\s*$/i, "") || "Señal no identificada"}
              </span>
            </div>
          </div>

          {/* Nivel de Riesgo Actual */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nivel de Riesgo Actual:</span>
            <div className="flex items-center gap-2">
              <RiskIcon size={16} className={riskToken.text} />
              <span className={cn("text-sm font-bold", riskToken.text)}>
                {caso.nivel_riesgo}
                {typeof caso.puntaje_global === "number" && (
                  <span className="ml-1 opacity-80 text-xs font-semibold text-slate-500">
                    ({caso.puntaje_global}/100)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Tipo de Riesgo Asociado */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tipo de Riesgo Asociado:</span>
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-blue-600" />
              <span className="text-sm font-bold text-slate-700">{caso.vertical || "General"}</span>
            </div>
          </div>
        </div>

        {/* Monto (Extra visual punch) */}
        {typeof caso.monto_en_riesgo === "number" && (
          <div className="mt-2 pt-4 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Impacto Económico Estimado</p>
            <p className="text-2xl font-mono font-bold text-slate-900 tracking-tight">
              {caso.moneda ? `${caso.moneda} ` : "$ "}{caso.monto_en_riesgo.toLocaleString()}
            </p>
          </div>
        )}

        {/* Descripción corta si existe */}
        {caso.descripcion_base && !caso.monto_en_riesgo && (
          <div className="mt-2 pt-3 border-t border-slate-100 flex gap-2 items-start">
            <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
              {caso.descripcion_base}
            </p>
          </div>
        )}

      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}

/**
 * Props del grid de casos por cliente
 */
export interface CasosTestigoGridProps {
  casos: CasoTestigoCardUI[];
  segmento: string;
  loading?: boolean;
  onCasoClick?: (caso: CasoTestigoCardUI) => void;
  getHref?: (caso: CasoTestigoCardUI) => string;
}

/**
 * Grid de cards de casos testigo
 */
export function CasosTestigoGrid({
  casos,
  segmento,
  loading = false,
  onCasoClick,
  getHref
}: CasosTestigoGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <CasoTestigoCardSkeleton key={`${segmento}-sk-${i}`} />
        ))}
      </div>
    );
  }

  if (!casos.length) {
    return (
      <div className="flex items-center justify-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Activity className="text-slate-300" />
          </div>
          <p className="text-sm text-slate-500 font-medium">
            No hay casos testigo activos para este cliente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
      {casos.map((caso) => {
        const href = getHref ? getHref(caso) : undefined;
        return (
          <CasoTestigoCardUI
            key={caso.captura_id}
            caso={caso}
            onClick={onCasoClick ? () => onCasoClick(caso) : undefined}
            href={href}
          />
        );
      })}
    </div>
  );
}

/**
 * Props para el panel completo de casos por cliente
 */
interface CasosRiesgoPorClienteProps {
  casosByCliente: Record<string, CasoTestigoCardUI[]>;
  loading?: boolean;
  onCasoClick?: (caso: CasoTestigoCardUI) => void;
  getHref?: (caso: CasoTestigoCardUI) => string;
}

/**
 * Panel completo de casos por cliente
 * Reusa CasosTestigoGrid y CasoTestigoCardUI
 */
export default function CasosRiesgoPorCliente({
  casosByCliente,
  loading = false,
  onCasoClick,
  getHref
}: CasosRiesgoPorClienteProps) {
  const clientes = Object.keys(casosByCliente);

  return (
    <div className="space-y-12">
      {clientes.map((cliente) => {
        const casos = casosByCliente[cliente] || [];

        return (
          <div key={cliente} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-indigo-600 rounded-full" />
              <h2 className="text-lg font-black uppercase tracking-widest text-slate-800">
                {cliente}
              </h2>
            </div>

            {loading ? (
              <CasosTestigoGrid segmento={cliente} casos={[]} loading={true} />
            ) : casos.length === 0 ? (
              <div className="flex items-center justify-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-sm text-slate-400 font-medium">
                  No hay situaciones de riesgo para este cliente.
                </p>
              </div>
            ) : (
              <CasosTestigoGrid
                segmento={cliente}
                casos={casos}
                loading={false}
                onCasoClick={onCasoClick}
                getHref={getHref}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}