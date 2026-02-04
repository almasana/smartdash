"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Store, ShoppingCart, Video, Rocket } from "lucide-react";

export function RubroSelector() {
  const rubros = [
    {
      id: "Pyme",
      label: "PYME / Local",
      desc: "Logística, RRHH y flujo de caja minorista.",
      icon: Store,
      color: "text-blue-600",
      bg: "hover:border-blue-400 hover:bg-blue-50/50"
    },
    {
      id: "E-commerce",
      label: "E-commerce",
      desc: "Stock, pasarelas de pago y experiencia de usuario.",
      icon: ShoppingCart,
      color: "text-purple-600",
      bg: "hover:border-purple-400 hover:bg-purple-50/50"
    },
    {
      id: "Creator",
      label: "Creadores",
      desc: "Reputación, algoritmos y gestión de contratos.",
      icon: Video,
      color: "text-pink-600",
      bg: "hover:border-pink-400 hover:bg-pink-50/50"
    },
    {
      id: "Startups",
      label: "Startups",
      desc: "Runway, métricas SaaS y crecimiento acelerado.",
      icon: Rocket,
      color: "text-orange-600",
      bg: "hover:border-orange-400 hover:bg-orange-50/50"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">
          SmartDash <span className="text-orange-600">FV</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          Selecciona un rubro para verificar los riesgos activos detectados por la Fuente de la Verdad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {rubros.map((rubro) => {
          const Icon = rubro.icon;
          return (
            <Link key={rubro.id} href={`/?rubro=${rubro.id}`} className="group block">
              <Card className={`h-full border-2 border-slate-100 transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 ${rubro.bg}`}>
                <CardHeader className="flex flex-row items-center gap-5 pb-2">
                  <div className={`p-4 rounded-2xl bg-white shadow-sm border border-slate-50 ${rubro.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={32} />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    {rubro.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-slate-500 font-medium">
                    {rubro.desc}
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