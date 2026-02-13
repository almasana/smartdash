import { NextRequest, NextResponse } from "next/server";
import { getValidMeliAccessToken } from "@/lib/meli-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

// Configuración Vercel Serverless para Streaming
export const dynamic = "force-dynamic"; // Deshabilitar caché estático
export const maxDuration = 60; // Aumentar timeout (máximo permitido en plan Pro/Hobby)


// URL base del MCP de Mercado Libre
const MCP_UPSTREAM_URL = "https://mcp.mercadolibre.com/mcp";

/**
 * Obtiene el ID del usuario más reciente (o activo) desde la DB.
 * Asume entorno single-tenant o usa el último token actualizado como "default".
 */
async function getDefaultMeliUserId(): Promise<string> {
    const { data, error } = await supabaseAdmin
        .from("meli_oauth_tokens")
        .select("user_id")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

    if (error || !data) {
        throw new Error("No authenticated Mercado Libre users found in DB. Please authenticate first via /api/meli/oauth/start");
    }

    return data.user_id;
}

// Handler para todas las requests (GET, POST)
async function handleProxy(req: NextRequest) {
    try {
        // 1. Obtener Token Válido
        const userId = await getDefaultMeliUserId();
        const accessToken = await getValidMeliAccessToken(userId);

        // 2. Preparar Request al Upstream
        const url = new URL(req.url); // URL original (ruta local)
        // Construir URL destino preservando query params
        const targetUrl = new URL(MCP_UPSTREAM_URL);
        url.searchParams.forEach((value, key) => targetUrl.searchParams.set(key, value));

        const headers = new Headers();

        // ALLOWLIST ESTRICTA para evitar 431 Request Header Fields Too Large
        // Solo permitimos headers esenciales para el protocolo MCP y HTTP básico
        const allowedHeaders = ["content-type", "accept", "user-agent"];

        req.headers.forEach((value, key) => {
            const lower = key.toLowerCase();
            if (allowedHeaders.includes(lower) || lower.startsWith("x-mcp-")) {
                headers.set(key, value);
            }
        });

        // REGLA CRÍTICA: Si es un inicio de conexión MCP (GET) o se espera streaming,
        // Mercado Libre EXIGE explícitamente este header.
        if (req.method === "GET") {
            headers.set("Accept", "text/event-stream");
        } else if (!headers.has("Accept")) {
            headers.set("Accept", "application/json, text/event-stream");
        }

        headers.set("Cache-Control", "no-cache");
        headers.set("Connection", "keep-alive");

        // Inyectar Auth Token
        headers.set("Authorization", `Bearer ${accessToken}`);

        // Evitar host clash
        headers.delete("host");

        // 3. Ejecutar Fetch al Upstream
        const upstreamRes = await fetch(targetUrl.toString(), {
            method: req.method,
            headers: headers,
            body: req.method === "POST" ? req.body : undefined,
            // @ts-ignore - duplex is needed for streaming bodies in Node environments (supported in Next.js recent versions)
            duplex: req.body ? "half" : undefined,
        });

        // 4. Devolver Respuesta (Streaming)
        // Copiar headers de respuesta
        const resHeaders = new Headers();
        upstreamRes.headers.forEach((value, key) => resHeaders.set(key, value));

        // Forzar CORS por si acaso
        resHeaders.set("Access-Control-Allow-Origin", "*");

        return new Response(upstreamRes.body, {
            status: upstreamRes.status,
            statusText: upstreamRes.statusText,
            headers: resHeaders,
        });

    } catch (error: any) {
        console.error("[MCP Proxy] Error:", error);
        return NextResponse.json(
            { error: "MCP Proxy Error", details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    return handleProxy(req);
}

export async function POST(req: NextRequest) {
    return handleProxy(req);
}

export async function OPTIONS(req: NextRequest) {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
        },
    });
}

// Curl de ejemplo para Smoke Test:
// curl -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"list_tools","id":1}' https://mismartdash.vercel.app/api/mcp/mercadolibre
