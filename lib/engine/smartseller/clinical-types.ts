/**
 * Tipos fundamentales para el Motor Clínico SmartSeller v1
 */

/** Row shape from public.clinical_scenarios registry */
export interface ScenarioConfig {
    key: string;
    default_entity_type: string;
    severity_model: string;
    max_score: number;
    is_active: boolean;
    version: number;
}

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type ScenarioKey = 'sla_question' | 'shipping_deadline' | 'stockout_risk' | 'reputation_premortem';
export type EntityType = 'order' | 'listing' | 'question' | 'seller';
export type ClinicalEventStatus = 'active' | 'resolved' | 'ignored';

export interface ClinicalEventInput {
    seller_id: string;
    entity_type: EntityType;
    entity_id: string;
    scenario_key: ScenarioKey;
    severity: Severity;
    score_impact: number;
    probability?: number | null;
    magnitude?: number | null;
    evidence: Record<string, any>;
    explanation: string;
    rule_version: number;
    status: ClinicalEventStatus;
}

export interface ClinicalEventRow extends ClinicalEventInput {
    id: string;
    detected_at: string;
    resolved_at?: string | null;
}

/**
 * Genera una llave única para deduplicación de eventos activos
 */
export function eventKey(scenario: ScenarioKey, entityType: EntityType, entityId: string): string {
    return `${scenario}:${entityType}:${entityId}`;
}
