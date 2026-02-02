import { RiskLevel, RiskSeverity } from "@/lib/domain/risk";

/**
 * CONFIGURACIÓN VISUAL DE NIVELES (Negocio)
 */
export const RISK_LEVEL_UI = {
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
} as const;

/**
 * CONFIGURACIÓN VISUAL DE SEVERIDADES (Técnico)
 */
export const SEVERITY_UI = {
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
} as const;

/**
 * MAPPERS DE UTILIDAD
 */
export const getRiskLevelUI = (level: RiskLevel) => RISK_LEVEL_UI[level];
export const getSeverityUI = (severity: RiskSeverity) => SEVERITY_UI[severity];