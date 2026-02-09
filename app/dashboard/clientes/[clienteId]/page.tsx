"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { CasosTestigoGrid } from "@/components/casos-testigo-grid";
import type { CasoTestigoCardUI } from "@/components/casos-testigo-grid";
import { cn } from "@/lib/utils";

export default function ClientePage() {
  const { clienteId } = useParams<{ clienteId: string }>();

  const [loading, setLoading] = useState(true);
  const [casos, setCasos] = useState<CasoTestigoCardUI[]>([]);
  const [clienteNombre, setClienteNombre] = useState<string>("");
  const [clienteLogo, setClienteLogo] = useState<string | null>(null);
  const [nacionalidad, setNacionalidad] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCasosCliente() {
      setLoading(true);

      try {
        const res = await fetch(`/api/clientes/${clienteId}/casos`);
        if (!res.ok) throw new Error("Error al obtener casos");

        const body = (await res.json()) as { casos?: CasoTestigoCardUI[] };
        const valid = (body.casos || []).filter((item) => item.captura_id);

        if (!cancelled) {
          setCasos(valid);
          if (valid.length > 0) {
            // Extraemos datos del cliente del primer caso
            const firstData = valid[0] as any;
            setClienteNombre(firstData.cliente_nombre_comercial || "");
            setClienteLogo(firstData.logo_url || null);
            setNacionalidad(firstData.nacionalidad || null);
          }
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setCasos([]);
          setLoading(false);
        }
      }
    }

    if (clienteId) {
      fetchCasosCliente();
    }

    return () => {
      cancelled = true;
    };
  }, [clienteId]);

  const puntajeGlobalCliente = useMemo(() => {
    if (casos.length === 0) return null;
    const puntajes = casos.map((c) => c.puntaje_global ?? 0).filter((p) => p > 0);
    if (puntajes.length === 0) return null;
    return Math.round(puntajes.reduce((a, b) => a + b, 0) / puntajes.length);
  }, [casos]);

  const riesgoGlobal = useMemo(() => {
    if (puntajeGlobalCliente === null) return "Medio";
    if (puntajeGlobalCliente >= 90) return "Crítico";
    if (puntajeGlobalCliente >= 70) return "Alto";
    if (puntajeGlobalCliente >= 50) return "Medio";
    return "Bajo";
  }, [puntajeGlobalCliente]);

  const progressColor =
    riesgoGlobal === "Crítico" || riesgoGlobal === "Alto"
      ? "text-red-500"
      : "text-[#4f46e5]";

  const segmento = useMemo(() => clienteNombre, [clienteNombre]);

  return (
    <div className="min-h-screen bg-[#FDFDFF] px-6 sm:px-8 py-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header de Expediente */}
        <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
              {clienteLogo ? (
                <Image
                  src={clienteLogo}
                  alt={clienteNombre}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="text-xl font-bold text-slate-500">
                  {clienteNombre?.[0] ?? "?"}
                </div>
              )}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Informe de Auditoría Forense
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex flex-wrap items-center gap-3">
                {segmento || "Cliente"}

                {/* Aquí incorporamos la Nacionalidad */}
                {nacionalidad && (
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 align-middle">
                    {nacionalidad}
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Anillo de Puntaje Global */}
          {puntajeGlobalCliente !== null && (
            <div className="flex flex-col items-center shrink-0">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-slate-200 stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                  ></circle>
                  <circle
                    className={cn(
                      "progress-ring__circle stroke-current transition-all duration-1000 ease-out",
                      progressColor
                    )}
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    strokeDasharray={`${(puntajeGlobalCliente / 100) * 283} 283`}
                    transform="rotate(-90 50 50)"
                  ></circle>
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-black text-slate-900">
                  {puntajeGlobalCliente}/100
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Puntaje Global de Riesgo
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-500 max-w-2xl">
            Revisión de escenarios críticos detectados para este cliente. Ordenados
            por criticidad. Actúa ahora para mitigar pérdidas.
          </p>
        </div>

        <CasosTestigoGrid
          segmento={segmento}
          casos={casos}
          loading={loading}
          getHref={(caso) => `/dashboard/casos/${caso.captura_id}`}
        />
      </div>
    </div>
  );
}