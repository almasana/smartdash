"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Store, ShoppingCart, Video, Rocket } from "lucide-react";

type RubroConfig = {
  id: string;
  label: string;
  description: string;
  icon: any;
  iconClass: string;
  hoverClass: string;
};

const RUBROS: RubroConfig[] = [
  {
    id: "Pyme",
    label: "PYME / Local",
    description: "Logística, RRHH y flujo de caja minorista.",
    icon: Store,
    iconClass: "text-primary",
    hoverClass: "hover:border-primary/40 hover:bg-primary/5",
  },
  {
    id: "E-commerce",
    label: "E-commerce",
    description: "Stock, pasarelas de pago y experiencia de usuario.",
    icon: ShoppingCart,
    iconClass: "text-accent-foreground",
    hoverClass: "hover:border-accent/40 hover:bg-accent/10",
  },
  {
    id: "Creadores",
    label: "Creadores",
    description: "Reputación, algoritmos y gestión de contratos.",
    icon: Video,
    iconClass: "text-secondary-foreground",
    hoverClass: "hover:border-secondary/40 hover:bg-secondary/40",
  },
  {
    id: "Startups",
    label: "Startups",
    description: "Runway, métricas SaaS y crecimiento acelerado.",
    icon: Rocket,
    iconClass: "text-primary",
    hoverClass: "hover:border-primary/40 hover:bg-primary/10",
  },
];

export function RubroSelector() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-5xl font-black tracking-tight text-foreground">
          SmartDash <span className="text-primary">FV</span>
        </h1>
        <p className="mx-auto max-w-2xl text-xl font-medium text-muted-foreground">
          Selecciona un rubro para verificar los riesgos activos detectados por la
          Fuente de la Verdad.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {RUBROS.map((rubro) => {
          const Icon = rubro.icon;

          return (
            <Link
              key={rubro.id}
              href={`/?rubro=${rubro.id}`}
              className="group block"
            >
              <Card
                className={`h-full border border-border bg-card transition-all duration-300
                shadow-sm hover:-translate-y-1 hover:shadow-lg ${rubro.hoverClass}`}
              >
                <CardHeader className="flex flex-row items-center gap-5 pb-2">
                  <div
                    className={`rounded-2xl border border-border bg-background p-4 shadow-sm transition-transform group-hover:scale-110 ${rubro.iconClass}`}
                  >
                    <Icon size={32} />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {rubro.label}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-base font-medium text-muted-foreground">
                    {rubro.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
