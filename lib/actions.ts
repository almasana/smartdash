"use server"

import { getRiskDashboardBySegment } from "@/lib/services/risk.service";
import { generateMitigationPlan } from "@/lib/services/ai.service";
import { revalidatePath } from "next/cache";

export async function filterByRubro(rubro: string) {
  try {
    const data = await getRiskDashboardBySegment(rubro);
    if (!data) return null;

    // Generamos el plan de IA basado en el snapshot real de Neon
    // En producción, esto podría ser asíncrono o cacheado
    const aiPlan = await generateMitigationPlan({
      id: data.clientContext.clientId,
      clientId: data.clientContext.clientId,
      globalScore: data.evaluation.score,
      signals: data.signals,
      financialContext: data.metrics,
      scenarioDescription: data.evaluation.summary,
      recommendationText: data.evaluation.recommendations[0] || "",
      actionStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return {
      globalScore: data.evaluation,
      signals: data.signals,
      capitalMetrics: data.metrics,
      messages: data.notifications.map(n => ({
        id: n.id,
        type: 'incoming',
        content: n.message,
        timestamp: n.createdAt,
        priority: n.priority,
        status: n.status
      })),
      aiPlan, // Inyectamos el cerebro de Fase 3
      alertsPending: data.stats.pending,
      context: data.clientContext
    };
  } catch (error) {
    console.error("ACTION_AI_FAILURE:", error);
    throw error;
  }
}