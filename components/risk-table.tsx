import { RiskSignal } from "@/lib/domain/risk";
import { Badge } from "@/components/ui/badge";

export function RiskTable({ signals }: { signals: RiskSignal[] }) {
  const severityMap = {
    critical: "border-red-500/50 text-red-500 bg-red-500/10",
    high: "border-orange-500/50 text-orange-500 bg-orange-500/10",
    medium: "border-yellow-500/50 text-yellow-500 bg-yellow-500/10",
    low: "border-emerald-500/50 text-emerald-500 bg-emerald-500/10",
  };

  return (
    <div className="rounded-xl border border-white/5 bg-[#121214] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-white/[0.02] border-b border-white/5">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Nivel</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Indicador</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Valor</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Análisis de Impacto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {signals.map((s, i) => (
            <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
              <td className="px-6 py-4">
                <Badge variant="outline" className={`${severityMap[s.severity]} h-5 px-2 text-[10px] uppercase font-bold`}>
                  {s.severity}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-semibold text-slate-200">{s.label}</div>
                <div className="text-[10px] font-mono text-slate-600 uppercase">{s.code}</div>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-sm font-bold font-mono text-white">{s.value}{s.unit}</span>
              </td>
              <td className="px-6 py-4">
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">{s.impact_description}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}