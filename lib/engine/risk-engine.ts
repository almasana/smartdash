import { RiskLevel, RiskSignal, RiskEvaluation } from "@/lib/domain/risk";

/**
 * CONFIGURACIÓN DE PESOS POR SEVERIDAD TÉCNICA
 * Define el impacto de cada señal en el cálculo del score global.
 */
const SEVERITY_WEIGHTS = {
  critical: 1.5,
  high: 1.2,
  medium: 1.0,
  low: 0.7,
};

/**
 * UMBRALES DE NEGOCIO
 */
const THRESHOLDS = {
  CRITICO: 90,
  ALTO: 75,
  MODERADO: 60,
  BAJO: 40,
};

/**
 * ENGINE DE EVALUACIÓN DE RIESGO
 * Única responsabilidad: Transformar señales técnicas en una evaluación de negocio.
 */
export function evaluateRisk(signals: RiskSignal[]): RiskEvaluation {
  // 1. Caso base: Sin señales
  if (!signals || signals.length === 0) {
    return {
      score: 0,
      level: "estable",
      color: "text-green-500",
      summary: "No se han detectado señales de riesgo activas.",
      recommendations: ["Continuar con el monitoreo preventivo habitual."],
    };
  }

  // 2. Cálculo de Score (Promedio Ponderado por Severidad)
  let totalWeightedScore = 0;
  let totalWeights = 0;

  signals.forEach((signal) => {
    const weight = SEVERITY_WEIGHTS[signal.severity] || 1.0;
    totalWeightedScore += signal.value * weight;
    totalWeights += weight;
  });

  const calculatedScore =
    totalWeights > 0 ? totalWeightedScore / totalWeights : 0;
  const score = Math.max(0, Math.min(100, Math.round(calculatedScore)));

  // 3. Determinación de Nivel y Semántica de UI
  let level: RiskLevel = "estable";
  let color = "text-green-500";

  if (score >= THRESHOLDS.CRITICO) {
    level = "critico";
    color = "text-red-600";
  } else if (score >= THRESHOLDS.ALTO) {
    level = "alto";
    color = "text-orange-500";
  } else if (score >= THRESHOLDS.MODERADO) {
    level = "moderado";
    color = "text-yellow-500";
  } else if (score >= THRESHOLDS.BAJO) {
    level = "bajo";
    color = "text-blue-500";
  }

  // 4. Generación de Narrativa
  const criticalCount = signals.filter((s) => s.severity === "critical").length;
  let summary = `Análisis de riesgo consolidado en ${score}/100. `;

  if (level === "critico" || level === "alto") {
    summary += `Alerta prioritaria: se han identificado ${criticalCount} señales críticas que comprometen la estabilidad.`;
  } else if (level === "moderado") {
    summary += `Riesgo latente. Se requiere revisión de las señales de severidad media detectadas.`;
  } else {
    summary += `Operación dentro de parámetros normales.`;
  }

  // 5. Consolidación de Recomendaciones
  const recommendations = signals
    .filter((s) => s.severity === "critical" || s.severity === "high")
    .map((s) => s.impact_description)
    .slice(0, 3);

  return {
    score,
    level,
    color,
    summary,
    recommendations:
      recommendations.length > 0
        ? recommendations
        : ["Mantener vigilancia sobre los indicadores preventivos."],
  };
}
