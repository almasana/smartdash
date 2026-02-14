import { ClinicalEventInput, ScenarioConfig } from "./clinical-types";
import * as scoring from "./clinical-scoring";

export interface EngineParams {
    sellerId: string;
    unansweredQuestions: Array<{ id: string; date_created: string }>;
    sellerAvgResponseHours?: number;
    paidOrdersNotShipped: Array<{
        id: string;
        remaining_time_ms: number;
        total_allowed_time_ms: number
    }>;
    items: Array<{
        id: string;
        available_quantity: number;
        sales_7d: number
    }>;
    reputationStats?: {
        total_orders_30d: number;
        late_orders_30d: number;
    };
    /** Scenario registry loaded from public.clinical_scenarios. */
    scenarioRegistry?: Map<string, ScenarioConfig>;
}

/** Helper: check if a scenario is active in the registry (defaults to active if registry not provided). */
function isActive(registry: Map<string, ScenarioConfig> | undefined, key: string): boolean {
    if (!registry) return true; // backward compat: no registry = all active
    const cfg = registry.get(key);
    return cfg ? cfg.is_active : false; // unknown key = disabled
}

/** Helper: get rule_version from registry (defaults to 1). */
function ruleVersion(registry: Map<string, ScenarioConfig> | undefined, key: string): number {
    if (!registry) return 1;
    return registry.get(key)?.version ?? 1;
}

/**
 * Motor determinístico que proyecta los eventos clínicos que deberían estar activos.
 * Respects scenario registry kill switch (is_active) and propagates rule_version.
 */
export async function computeNextClinicalEvents(params: EngineParams): Promise<ClinicalEventInput[]> {
    const events: ClinicalEventInput[] = [];
    const { sellerId, unansweredQuestions, paidOrdersNotShipped, items, scenarioRegistry } = params;
    const avgHours = params.sellerAvgResponseHours || 2;
    const now = Date.now();

    // 1. SLA Questions
    if (isActive(scenarioRegistry, 'sla_question')) {
        const slaThreshold = scoring.computeSlaThresholdHours(avgHours);
        for (const q of unansweredQuestions) {
            const elapsedHours = (now - new Date(q.date_created).getTime()) / (1000 * 60 * 60);
            if (elapsedHours > slaThreshold * 0.7) {
                const severity = scoring.computeSeveritySLA(elapsedHours, slaThreshold);
                const impact = scoring.impactFromSeveritySLA(severity);

                events.push({
                    seller_id: sellerId,
                    entity_type: 'question',
                    entity_id: q.id,
                    scenario_key: 'sla_question',
                    severity,
                    score_impact: impact,
                    rule_version: ruleVersion(scenarioRegistry, 'sla_question'),
                    status: 'active',
                    evidence: { hours: elapsedHours, threshold: slaThreshold },
                    explanation: scoring.buildExplanation('sla_question', { hours: elapsedHours, threshold: slaThreshold })
                });
            }
        }
    }

    // 2. Shipping Deadlines
    if (isActive(scenarioRegistry, 'shipping_deadline')) {
        for (const order of paidOrdersNotShipped) {
            const ratio = order.remaining_time_ms / order.total_allowed_time_ms;
            if (ratio < 0.25) {
                const severity = scoring.computeSeverityShipping(ratio);
                const impact = scoring.impactFromSeverityShipping(severity);

                events.push({
                    seller_id: sellerId,
                    entity_type: 'order',
                    entity_id: order.id,
                    scenario_key: 'shipping_deadline',
                    severity,
                    score_impact: impact,
                    rule_version: ruleVersion(scenarioRegistry, 'shipping_deadline'),
                    status: 'active',
                    evidence: { ratio, remaining_ms: order.remaining_time_ms },
                    explanation: scoring.buildExplanation('shipping_deadline', { ratio })
                });
            }
        }
    }

    // 3. Stockout Risk
    if (isActive(scenarioRegistry, 'stockout_risk')) {
        for (const item of items) {
            const velocity = item.sales_7d / 7;
            const daysOfStock = velocity > 0 ? item.available_quantity / velocity : 999;

            if (daysOfStock < 7) {
                const severity = scoring.computeSeverityStock(daysOfStock);
                const prob = scoring.computeStockoutProbability(daysOfStock);
                const impact = scoring.impactFromProbability(prob);

                events.push({
                    seller_id: sellerId,
                    entity_type: 'listing',
                    entity_id: item.id,
                    scenario_key: 'stockout_risk',
                    severity,
                    score_impact: impact,
                    probability: prob,
                    rule_version: ruleVersion(scenarioRegistry, 'stockout_risk'),
                    status: 'active',
                    evidence: { days: daysOfStock, velocity, quantity: item.available_quantity },
                    explanation: scoring.buildExplanation('stockout_risk', { days: daysOfStock, velocity })
                });
            }
        }
    }

    // 4. Reputation Pre-mortem
    if (isActive(scenarioRegistry, 'reputation_premortem')) {
        const repStats = params.reputationStats;
        if (repStats && repStats.total_orders_30d > 0) {
            const avgOrdersPerDay = repStats.total_orders_30d / 30;
            const avgLatePerDay = repStats.late_orders_30d / 30;

            const projectedLate = repStats.late_orders_30d + avgLatePerDay * 7;
            const projectedTotal = repStats.total_orders_30d + avgOrdersPerDay * 7;
            const projectedRatio = projectedTotal > 0 ? projectedLate / projectedTotal : 0;

            if (projectedRatio > 0.15) {
                const severity = scoring.computeSeverityReputation(projectedRatio);
                const impact = scoring.impactFromSeverityReputation(severity);

                events.push({
                    seller_id: sellerId,
                    entity_type: 'seller',
                    entity_id: sellerId,
                    scenario_key: 'reputation_premortem',
                    severity,
                    score_impact: impact,
                    probability: projectedRatio,
                    rule_version: ruleVersion(scenarioRegistry, 'reputation_premortem'),
                    status: 'active',
                    evidence: {
                        projected_ratio: projectedRatio,
                        late_orders_30d: repStats.late_orders_30d,
                        total_orders_30d: repStats.total_orders_30d,
                        avg_late_per_day: avgLatePerDay,
                        avg_orders_per_day: avgOrdersPerDay
                    },
                    explanation: scoring.buildExplanation('reputation_premortem', {
                        projected_ratio: projectedRatio,
                        late_orders_30d: repStats.late_orders_30d,
                        total_orders_30d: repStats.total_orders_30d
                    })
                });
            }
        }
    }

    return events;
}
