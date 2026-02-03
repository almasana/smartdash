import { RiskSeverity } from "@/lib/domain/risk";

/**
 * ------------------------------------------------------------------
 * NIVELES DE RIESGO (UI / NEGOCIO)
 * No forman parte del dominio técnico.
 * ------------------------------------------------------------------
 */
export type RiskLevelUI =
  | "critico"
  | "alto"
  | "moderado"
  | "bajo"
  | "estable";

export const RISK_LEVEL_UI: Record<
  RiskLevelUI,
  {
    label: string;
    badge: string;
    icon: string;
    description: string;
  }
> = {
  critico: {
    label: "Crítico",
    badge: "bg-red-100 text-red-700 border-red-200",
    icon: "AlertOctagon",
    description: "Acción inmediata requerida",
  },
  alto: {
    label: "Alto",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    icon: "AlertTriangle",
    description: "Atención prioritaria",
  },
  moderado: {
    label: "Moderado",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: "Info",
    description: "Monitoreo activo",
  },
  bajo: {
    label: "Bajo",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "ShieldCheck",
    description: "Situación controlada",
  },
  estable: {
    label: "Estable",
    badge: "bg-green-100 text-green-700 border-green-200",
    icon: "CheckCircle",
    description: "Sin riesgos detectados",
  },
};

/**
 * ------------------------------------------------------------------
 * SEVERIDADES TÉCNICAS (DOMINIO)
 * ------------------------------------------------------------------
 */
export const SEVERITY_UI: Record<
  RiskSeverity,
  {
    label: string;
    color: string;
    dot: string;
  }
> = {
  critical: {
    label: "Severidad Crítica",
    color: "text-red-600",
    dot: "bg-red-600",
  },
  high: {
    label: "Severidad Alta",
    color: "text-orange-500",
    dot: "bg-orange-500",
  },
  medium: {
    label: "Severidad Media",
    color: "text-yellow-500",
    dot: "bg-yellow-500",
  },
  low: {
    label: "Severidad Baja",
    color: "text-blue-500",
    dot: "bg-blue-500",
  },
};

/**
 * ------------------------------------------------------------------
 * MAPPERS
 * ------------------------------------------------------------------
 */
export const getRiskLevelUI = (level: RiskLevelUI) =>
  RISK_LEVEL_UI[level] ?? RISK_LEVEL_UI.estable;

export const getSeverityUI = (severity: RiskSeverity) =>
  SEVERITY_UI[severity];
