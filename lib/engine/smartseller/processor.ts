import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * Procesa un evento de webhook de Mercado Libre y actualiza el estado normalizado y clínico.
 * Sigue el modelo de 3 capas (A -> B -> C) definido en la Constitución de SmartSeller.
 * 
 * Capa B: Hidrata el Estado Normalizado (order_snapshots).
 * Capa C: Genera Señales Clínicas (clinical_events).
 * 
 * @param event - El evento crudo recuperado de la tabla webhook_events.
 */
export async function processWebhookEvent(event: any): Promise<void> {
    // Validaciones iniciales: solo procesamos tópicos de órdenes con recursos válidos
    if (event?.topic !== 'orders' || typeof event?.resource !== 'string' || !event.resource.includes('/orders/')) {
        return;
    }

    // Extracción segura del orderId
    let orderId: string;
    if (event.resource.startsWith('/orders/')) {
        orderId = event.resource.slice('/orders/'.length);
    } else {
        const match = event.resource.match(/\/orders\/([^/?#]+)/);
        if (!match) return;
        orderId = match[1];
    }

    // 1. Capa B: Estado Normalizado - Upsert en order_snapshots
    // Se usa ON CONFLICT (order_id) para mantener la última versión del estado operativo.
    const { error: snapshotError } = await supabaseAdmin
        .from('order_snapshots')
        .upsert({
            order_id: orderId,
            user_id: event.user_id,
            application_id: event.application_id,
            status: 'from_webhook',
            total_amount: null,
            currency: null,
            raw_payload: {
                source: 'webhook_event',
                webhook_event_id: event.id,
                payload: event.payload
            }
        }, {
            onConflict: 'order_id'
        });

    if (snapshotError) {
        console.error(`[Processor] Error upserting order_snapshot for ${orderId}:`, snapshotError);
        throw snapshotError;
    }

    // 2. Capa C: Derivados & Señales - Insertar señal clínica placeholder
    // Esta señal sirve para alimentar la vista de 'Casos Testigo' en el SmartDash.
    const { error: clinicalError } = await supabaseAdmin
        .from('clinical_events')
        .insert({
            entity_type: 'order',
            entity_id: orderId,
            signal_key: 'sla_breach_risk',
            severity: 'low',
            score: 10,
            evidence: {
                webhook_event_id: event.id,
                topic: event.topic
            }
        });

    if (clinicalError) {
        console.error(`[Processor] Error inserting clinical_event for ${orderId}:`, clinicalError);
        throw clinicalError;
    }
}
