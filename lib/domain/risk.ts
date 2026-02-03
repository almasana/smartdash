/**
 * Fuente de la Verdad del dominio de Riesgo.
 * Auto-generado a partir de smartdash_schema.sql
 */

// -------------------------------------------------------------------
// SEGMENTOS (RUBROS)
// -------------------------------------------------------------------

export const RUBROS_FV = [
  "Pyme",
  "Creator",
  "MercadoLibre Seller",
  "E-commerce",
  "Enterprise",
  "Freelancer",
] as const;

export type Segment = (typeof RUBROS_FV)[number];

export const ALL_SEGMENTS = "Todos los rubros" as const;
export type AllSegments = typeof ALL_SEGMENTS;
export type SegmentFilter = Segment | AllSegments;

export function isValidSegment(value: unknown): value is Segment {
  return RUBROS_FV.includes(value as Segment);
}

// -------------------------------------------------------------------
// RIESGO
// -------------------------------------------------------------------

export type RiskLevel =
  | "critico"
  | "alto"
  | "moderado"
  | "bajo"
  | "estable";

/**
 * Severidades técnicas (usadas en RiskEngine y UI)
 * Valores: critical, high, medium, low
 */
export type RiskSeverity = "critical" | "high" | "medium" | "low";

export interface RiskSignal {
  code: string;
  label: string;
  value: number;
  unit: string;
  severity: RiskSeverity;
  impact_description: string;
  context: string;
}

export interface RiskEvaluation {
  score: number; // 0–100
  level: RiskLevel;
  summary: string;
  recommendations: string[];
  color: string;
}

// -------------------------------------------------------------------
// PLAN DE ACCIÓN (IA)
// -------------------------------------------------------------------

export interface AIActionPlan {
  rationale: string;
  immediate_steps: string[];
  expected_impact: string;
  risk_reduction_estimate: number;
  suggested_message: string;
}

// -------------------------------------------------------------------
// SNAPSHOT DE RIESGO (DB)
// -------------------------------------------------------------------

export interface RiskSnapshot {
  id: string;
  client_id: string;
  scenario_id: string;
  scenario_description: string;
  vertical:
    | "Fiscal"
    | "Legal"
    | "RRHH"
    | "Reputación"
    | "Supply Chain"
    | "Operaciones"
    | "Financiero";
  global_score: number;
  risk_level: RiskLevel;
  financial_context: {
    estimated_cost?: number;
    productivity_loss?: number;
    replacement_risk?: number;
    currency?: string;
    [key: string]: number | string | undefined;
  };
  signals: RiskSignal[];
  recommendation_type?: "preventive" | "corrective" | "monitor";
  recommendation_text: string;
  action_deadline?: string;
  action_status?: "pending" | "in_progress" | "completed" | "dismissed";
  score_version?: string;
  created_at: string;
  updated_at: string;
}
