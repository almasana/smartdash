import { Severity } from "./clinical-types";

/**
 * Funciones puras de scoring y lógica clínica
 */

export function clampScore(score: number): number {
    return Math.max(0, Math.min(100, score));
}

export function bandFromScore(score: number): 'green' | 'yellow' | 'red' {
    if (score >= 80) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
}

/**
 * SLA de Preguntas
 */
export function computeSlaThresholdHours(avgResponseHours: number): number {
    // Mínimo 2 horas, o 1.5 veces el promedio histórico
    return Math.max(2, avgResponseHours * 1.5);
}

export function computeSeveritySLA(tHours: number, thresholdHours: number): Severity {
    if (tHours > thresholdHours * 2) return 'critical';
    if (tHours > thresholdHours) return 'high';
    if (tHours > thresholdHours * 0.7) return 'medium';
    return 'low';
}

export function impactFromSeveritySLA(sev: Severity): number {
    switch (sev) {
        case 'critical': return 25;
        case 'high': return 15;
        case 'medium': return 8;
        default: return 0;
    }
}

/**
 * Shipping Deadline
 */
export function computeSeverityShipping(ratio: number): Severity {
    // ratio = tiempo_restante / tiempo_total
    if (ratio <= 0) return 'critical';
    if (ratio < 0.1) return 'high';
    if (ratio < 0.25) return 'medium';
    return 'low';
}

export function impactFromSeverityShipping(sev: Severity): number {
    switch (sev) {
        case 'critical': return 35;
        case 'high': return 20;
        case 'medium': return 10;
        default: return 0;
    }
}

/**
 * Stockout Risk
 */
export function computeStockoutProbability(daysOfStock: number): number {
    if (daysOfStock >= 7) return 0;
    if (daysOfStock >= 3) return 0.4;
    if (daysOfStock >= 1) return 0.7;
    return 0.9;
}

export function computeSeverityStock(daysOfStock: number): Severity {
    if (daysOfStock < 1) return 'critical';
    if (daysOfStock < 3) return 'high';
    if (daysOfStock < 7) return 'medium';
    return 'low';
}

export function impactFromProbability(p: number): number {
    return Math.round(p * 20);
}

/**
 * Reputation Pre-mortem
 */
export function computeSeverityReputation(projectedRatio: number): Severity {
    if (projectedRatio > 0.25) return 'critical';
    if (projectedRatio > 0.20) return 'high';
    if (projectedRatio > 0.15) return 'medium';
    return 'low';
}

export function impactFromSeverityReputation(sev: Severity): number {
    switch (sev) {
        case 'critical': return 30;
        case 'high': return 20;
        case 'medium': return 12;
        default: return 0;
    }
}

/**
 * Generador de explicaciones accionables (Explicabilidad)
 */
export function buildExplanation(scenario: string, data: any): string {
    switch (scenario) {
        case 'sla_question':
            return `Pregunta sin responder por ${data.hours.toFixed(1)}h. Supera el umbral clínico de ${data.threshold.toFixed(1)}h.`;
        case 'shipping_deadline':
            return `Queda menos del ${(data.ratio * 100).toFixed(0)}% del tiempo para despachar. Riesgo inminente de demora.`;
        case 'stockout_risk':
            return `Stock crítico: ${data.days.toFixed(1)} días restantes a ritmo de ${data.velocity.toFixed(2)} u/día.`;
        case 'reputation_premortem':
            return `Ratio proyectado de envíos tardíos: ${(data.projected_ratio * 100).toFixed(1)}% (${data.late_orders_30d} tardíos / ${data.total_orders_30d} totales en 30d). Riesgo de pérdida de reputación en 7 días.`;
        default:
            return "Detección automática de deriva operativa.";
    }
}
