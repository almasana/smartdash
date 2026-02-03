import { AIActionPlan } from "@/lib/domain/risk";

interface AIPlanInput {
  id: string;
  clientId: string;
  globalScore: number;
  signals: unknown[];
  financialContext: Record<string, unknown>;
  scenarioDescription: string;
  recommendationText: string;
  actionStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const OFFLINE_PLAN: AIActionPlan = {
  rationale:
    "El servicio de IA no está disponible momentáneamente. Se presenta un análisis basado en reglas estáticas de negocio.",
  immediate_steps: [
    "Revisar manualmente las señales críticas en el panel financiero.",
    "Validar costos y productividad según contexto financiero.",
    "Verificar alertas recientes.",
  ],
  expected_impact: "Mitigación manual temporal.",
  risk_reduction_estimate: 5,
  suggested_message: "Se recomienda revisión manual de los riesgos detectados.",
};

export async function generateMitigationPlan(
  input: AIPlanInput,
): Promise<AIActionPlan> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return OFFLINE_PLAN;
  }
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Modelo permitido
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Eres Chief Risk Officer. Devuelve SOLO un JSON válido y estricto con las siguientes claves, alineadas a risk_snapshots:
{
  "rationale": "Explicación breve del riesgo detectado",
  "immediate_steps": ["Paso 1", "Paso 2", "Paso 3"],
  "expected_impact": "Impacto esperado",
  "risk_reduction_estimate": número entre 1 y 100,
  "suggested_message": "Mensaje breve para el cliente"
}`,
          },
          {
            role: "user",
            content: JSON.stringify({
              global_score: input.globalScore,
              signals: input.signals,
              financial_context: input.financialContext,
              scenario_description: input.scenarioDescription,
              recommendation_text: input.recommendationText,
            }),
          },
        ],
        temperature: 0.5,
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) {
      return OFFLINE_PLAN;
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return OFFLINE_PLAN;
    return JSON.parse(content) as AIActionPlan;
  } catch {
    return OFFLINE_PLAN;
  }
}
