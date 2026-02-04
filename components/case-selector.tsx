"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Activity,
  AlertTriangle,
  Zap,
  Users,
  DollarSign,
} from "lucide-react";
import { ScenarioCard } from "@/lib/actions";

/* Iconos por eje */
const AXIS_ICONS: Record<string, any> = {
  Financiero: DollarSign,
  Humano: Users,
  Operativo: Zap,
  Reputación: Activity,
  Legal: AlertTriangle,
  Fiscal: DollarSign,
};

/* Urgencia = semántica visual (permitido fuera de tokens) */
const URGENCY_STYLES: Record<string, string> = {
  critical: "border-l-red-500 bg-red-50/20 hover:border-red-400",
  high: "border-l-orange-500 bg-orange-50/20 hover:border-orange-400",
  medium: "border-l-yellow-500 bg-yellow-50/20 hover:border-yellow-400",
  low: "border-l-emerald-500 bg-emerald-50/20 hover:border-emerald-400",
};

export function CaseSelector({
  currentRubro,
  scenarios,
}: {
  currentRubro: string;
  scenarios: ScenarioCard[];
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-8 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider mb-4">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          Simulación en curso
        </div>

        <h2 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight mb-3">
          Selecciona un problema en{" "}
          <span className="text-orange-600 underline decoration-orange-200 decoration-4 underline-offset-4">
            {currentRubro}
          </span>
        </h2>

        <p className="text-muted-foreground text-lg max-w-2xl">
          Elige una de las situaciones detectadas por SmartDash para analizar,
          cuantificar y mitigar el riesgo en tiempo real.
        </p>
      </div>

      {/* Grid */}
      {scenarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => {
            const Icon = AXIS_ICONS[scenario.axis] || Activity;
            const urgencyClass =
              URGENCY_STYLES[scenario.urgency] || URGENCY_STYLES.low;

            return (
              <Link
                key={scenario.id}
                href={`/?rubro=${currentRubro}&scenario=${scenario.id}`}
                className="group block h-full"
              >
                <Card
                  className={`h-full border border-border border-l-[6px] bg-card text-card-foreground shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden ${urgencyClass}`}
                >
                  {/* Icono decorativo */}
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icon size={80} className="text-foreground" />
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-3">
                      <Badge
                        variant="outline"
                        className="bg-card/80 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-border"
                      >
                        {scenario.axis}
                      </Badge>

                      {scenario.urgency === "critical" && (
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                        </span>
                      )}
                    </div>

                    <CardTitle className="text-xl font-bold text-foreground group-hover:text-orange-600 transition-colors leading-tight">
                      {scenario.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <CardDescription className="text-muted-foreground font-medium leading-relaxed">
                      {scenario.description}
                    </CardDescription>
                  </CardContent>

                  <CardFooter className="mt-auto pt-4 flex items-center text-sm font-bold text-muted-foreground group-hover:text-orange-600 transition-colors">
                    Simular este caso
                    <ArrowRight
                      size={16}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="p-12 border-2 border-dashed border-border rounded-3xl text-center bg-muted">
          <Activity className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium text-foreground">
            No hay casos disponibles
          </h3>
          <p className="text-muted-foreground">
            Verifica que los seeds se hayan ejecutado para el rubro{" "}
            {currentRubro}.
          </p>
        </div>
      )}
    </div>
  );
}
