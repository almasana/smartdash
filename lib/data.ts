// lib/data.ts

import { db } from "@/lib/db";
import { RiskSignal } from "@/lib/domain/risk";

/**
 * Obtiene las señales de riesgo desde el ÚLTIMO snapshot
 * de un cliente.
 *
 * Fuente de verdad: risk_snapshots.signals (JSONB)
 */
export async function getRiskSignalsForClient(
  clientId: string
): Promise<RiskSignal[]> {
  const rows = await db.query(
    `
    SELECT
      signals
    FROM risk_snapshots
    WHERE client_id = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [clientId]
  );

  if (!rows || rows.length === 0) {
    return [];
  }

  const signals = rows[0].signals as any[];

  if (!Array.isArray(signals)) {
    return [];
  }

  // 🔁 ADAPTADOR: JSONB → RiskSignal[]
  return signals.map((signal) => ({
    axis: String(signal.code || signal.label || "unknown"),
    score: Number(signal.value),
    // impact todavía no está normalizado → se deja para v2
  }));
}
