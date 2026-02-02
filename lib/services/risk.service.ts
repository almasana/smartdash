import { sql } from "@/lib/db";
import { evaluateRisk } from "@/lib/engine/risk-engine";
import { RiskSignal, Notification } from "@/lib/domain/risk";

/**
 * SERVICIO DE RIESGO
 * Orquestación de snapshots de riesgo y notificaciones de WhatsApp.
 */
export async function getRiskDashboardBySegment(segment: string) {
  try {
    // 1. Obtener el último snapshot mediante el segmento del cliente
    const snapshots = await sql`
      SELECT 
        rs.global_score,
        rs.signals,
        rs.financial_context,
        rs.scenario_description,
        rs.action_status,
        rs.client_id,
        c.segment
      FROM risk_snapshots rs
      JOIN clients c ON rs.client_id = c.id
      WHERE c.segment = ${segment} OR ${segment} = 'Todos los rubros'
      ORDER BY rs.created_at DESC
      LIMIT 1
    `;

    const snapshot = snapshots[0];
    if (!snapshot) return null;

    // 2. Obtener historial de notificaciones (Canal WhatsApp)
    const notificationsRaw = await sql`
      SELECT id, priority, title, message, status, created_at
      FROM notifications
      WHERE client_id = ${snapshot.client_id}
      AND type = 'whatsapp'
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const notifications: Notification[] = notificationsRaw.map(n => ({
      id: n.id,
      type: 'whatsapp',
      priority: n.priority as any,
      title: n.title,
      message: n.message,
      status: n.status,
      createdAt: n.created_at
    }));

    // 3. Mapeo de señales al dominio
    const domainSignals: RiskSignal[] = (snapshot.signals || []).map((s: any) => ({
      code: s.code,
      label: s.label,
      value: Number(s.value || 0),
      severity: s.severity,
      impact_description: s.impact_description,
      context: s.context
    }));

    // 4. Evaluación vía Risk Engine
    const evaluation = evaluateRisk(domainSignals);

    return {
      evaluation,
      signals: domainSignals,
      metrics: snapshot.financial_context || {},
      notifications,
      stats: {
        resolved: 0, 
        pending: notifications.filter(n => n.status !== 'read').length
      },
      clientContext: {
        segment: snapshot.segment,
        clientId: snapshot.client_id
      }
    };
  } catch (error) {
    console.error("RISK_SERVICE_ERROR:", error);
    throw new Error("Error al procesar los datos desde Neon.");
  }
}

/**
 * Persistencia: Actualiza el estado de lectura en la DB
 */
export async function updateNotificationStatus(id: string, status: 'read' | 'delivered') {
  try {
    await sql`
      UPDATE notifications
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("SERVICE_PERSISTENCE_ERROR:", error);
    throw error;
  }
}