// page.tsx
import { ClientesGrid } from "@/components/clientes-grid";
import { getClientesFromDB } from "@/lib/actions";
import { HeroWelcome } from "@/components/hero-welcome";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Obtener clientes desde servidor
  const clientesRaw = await getClientesFromDB();

  // Filtrar clientes válidos con id y preparar href directamente
  const clientes = (clientesRaw || [])
    .filter((c) => c.id)
    .map((c) => ({
      ...c,
      href: `/dashboard/casos/${c.id}`, // Actualizado a la nueva ruta
    }));

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      {/* Componente Header / Hero */}
      <HeroWelcome />

      {/* Contenido Principal - SE AÑADIÓ EL ID AQUÍ */}
      <div
        id="clientes-section"
        className="px-8 py-12 max-w-7xl mx-auto scroll-mt-20 bg-white/50 border border-indigo-100 rounded-2xl shadow-sm"
      >
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          Centro de Comando: Monitorea Tus Clientes Ahora
        </h1>

        <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-3xl">
          Haz clic en un cliente para revelar riesgos ocultos y actúa antes de que impacten tu negocio.
          <span className="font-semibold bg-gradient-to-r from-[#1e3a8a] to-[#4f46e5] bg-clip-text text-transparent">
            SmartDash
          </span>{" "}
          te da el control total.
        </p>

        {/* Grid de clientes */}
        <ClientesGrid
          clientes={clientes}
          loading={!clientes || clientes.length === 0}
        />
      </div>
    </div>
  );
}