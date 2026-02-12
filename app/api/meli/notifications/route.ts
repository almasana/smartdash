import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint para recibir webhooks de Mercado Libre.
 * Requisito Directiva Prime: Siempre responder 200 OK en < 500ms.
 */
export async function POST(request: NextRequest) {
    try {
        // Intentamos leer el body, pero no bloqueamos si falla
        await request.json().catch(() => ({}));

        // Devolvemos 200 inmediatamente para cumplir con el SLA de ML
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        // Incluso en error estructural, respondemos 200
        return NextResponse.json({ ok: true }, { status: 200 });
    }
}

/**
 * GET para verificación de disponibilidad del endpoint.
 */
export async function GET() {
    return NextResponse.json({ ok: true }, { status: 200 });
}
