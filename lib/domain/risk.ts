/**
 * SEVERIDAD TÉCNICA DE SEÑALES
 * Coincide 1:1 con JSONB risk_snapshots.signals[].severity
 */
export type RiskSeverity = "low" | "medium" | "high" | "critical";

/**
 * NIVEL DE RIESGO DE NEGOCIO (CANÓNICO)
 * Usado por Engine, Services, IA y Flutter
 */
export type RiskLevel =
  | "critico"
  | "alto"
  | "moderado"
  | "bajo"
  | "estable";

/**
 * ESTADO DE ACCIÓN
 * Coincide con risk_snapshots.action_status
 */
export type ActionStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "dismissed";

/**
 * CONTRATO EXACTO DE SEÑAL DE RIESGO
 * Mapea directamente risk_snapshots.signals (JSONB)
 */
export interface RiskSignal {
  code: string;
  label: string;
  value: number;               // 0–100
  severity: RiskSeverity;
  impact_description: string;
  context: string;
}

/**
 * SNAPSHOT NORMALIZADO DE RIESGO
 * Representación tipada de risk_snapshots
 */
export interface RiskSnapshot {
  id: string;
  clientId: string;
  globalScore: number;
  signals: RiskSignal[];
  financialContext: Record<string, any>;
  scenarioDescription: string;
  recommendationText: string;
  actionStatus: ActionStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SALIDA OFICIAL DEL RISK ENGINE (AI-Ready)
 */
export interface RiskEvaluation {
  score: number;
  level: RiskLevel;
  color: string;
  summary: string;
  recommendations: string[];
}
