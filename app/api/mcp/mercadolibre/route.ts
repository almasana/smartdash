import { NextRequest, NextResponse } from "next/server";
import { getValidMeliAccessToken } from "@/lib/meli-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import crypto from "crypto";

// Configuración Vercel Serverless para Streaming
// Usamos "nodejs" runtime para mejor compatibilidad con streams de larga duración y crypto
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60; // Timeout máximo permitido

const MCP_UPSTREAM_URL = "https://mcp.mercadolibre.com/mcp";
const LOCK_TTL_SECONDS = 90;

// Utilidad para hashear token
function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Intenta adquirir un lock para el SSE connection.
 * Retorna true si adquiere el lock, false si ya está ocupado.
 */
async function acquireLock(tokenHash: string): Promise<boolean> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + LOCK_TTL_SECONDS * 1000);

    // Limpieza de locks expirados
    await supabaseAdmin.from('meli_sse_locks').delete().lt('expires_at', now.toISOString());

    // Intento de inserción del nuevo lock
    const { error } = await supabaseAdmin.from('meli_sse_locks').insert({
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        client_id: 'mcp-proxy'
    });

    if (error) {
        // Si hay conflicto (PK), verificamos si podemos robar el lock (si expiró justo ahora)
        // Pero como ya limpiamos antes, el error indica lock ACTIVO.
        return false;
    }
    return true;
}

/**
 * Libera el lock al terminar la conexión
 */
async function releaseLock(tokenHash: string) {
    await supabaseAdmin.from('meli_sse_locks').delete().eq('token_hash', tokenHash);
}

// Handler Principal
async function handleProxy(req: NextRequest) {
    // 0. Anti-Prefetch Check
    if (req.headers.get("next-router-prefetch") || req.headers.get("purpose") === "prefetch") {
        return new Response(null, { status: 204 });
    }

    let tokenHash = "";

    try {
        // 1. Obtener ID de usuario y Token
        const { data: userData, error: userError } = await supabaseAdmin
            .from("meli_oauth_tokens")
            .select("user_id")
            .order("updated_at", { ascending: false })
            .limit(1)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: "Authentication required via /api/meli/oauth/start" }, { status: 401 });
        }

        const accessToken = await getValidMeliAccessToken(userData.user_id);
        tokenHash = hashToken(accessToken);

        // 2. Control de Concurrencia (SSE Lock) para GET requests (SSE init)
        if (req.method === "GET") {
            const acquired = await acquireLock(tokenHash);
            if (!acquired) {
                console.warn(`[MCP Proxy] SSE Lock active for token ${tokenHash.substring(0, 8)}...`);
                return new Response(JSON.stringify({ error: "SSE stream already active for this token." }), {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        "Retry-After": "90"
                    }
                });
            }
        }

        // 3. Preparar Request al Upstream
        const url = new URL(req.url);
        const targetUrl = new URL(MCP_UPSTREAM_URL);
        url.searchParams.forEach((value, key) => targetUrl.searchParams.set(key, value));

        const headers = new Headers();
        const allowedHeaders = ["content-type", "accept", "user-agent"];

        req.headers.forEach((value, key) => {
            const lower = key.toLowerCase();
            if (allowedHeaders.includes(lower) || lower.startsWith("x-mcp-")) {
                headers.set(key, value);
            }
        });

        // Forzar headers mandatorios para SSE/MCP
        if (req.method === "GET") {
            headers.set("Accept", "text/event-stream");
            headers.set("Cache-Control", "no-cache");
            headers.set("Connection", "keep-alive");
        } else if (!headers.has("Accept")) {
            headers.set("Accept", "application/json");
        }

        headers.set("Authorization", `Bearer ${accessToken}`);

        // 4. Fetch al Upstream
        const upstreamRes = await fetch(targetUrl.toString(), {
            method: req.method,
            headers: headers,
            body: req.method === "POST" ? req.body : undefined,
            // @ts-ignore
            duplex: req.body ? "half" : undefined,
        });

        // 5. Manejo de Errores del Upstream
        if (upstreamRes.status === 409) {
            // Conflicto de SSE en Upstream -> Convertir a 429 para que el cliente espere
            if (req.method === "GET") await releaseLock(tokenHash); // Liberar nuestro lock local si falló upstream

            return new Response(JSON.stringify({ error: "Conflict: Upstream SSE session active." }), {
                status: 429,
                headers: {
                    "Content-Type": "application/json",
                    "Retry-After": "90"
                }
            });
        }

        // 6. Streaming de Respuesta
        const resHeaders = new Headers();
        upstreamRes.headers.forEach((value, key) => resHeaders.set(key, value));

        // Headers Endurecidos para Evitar Buffering
        if (req.method === "GET" && upstreamRes.headers.get("content-type")?.includes("text/event-stream")) {
            resHeaders.set("Content-Type", "text/event-stream; charset=utf-8");
            resHeaders.set("Cache-Control", "no-cache, no-transform");
            resHeaders.set("Connection", "keep-alive");
            resHeaders.set("X-Accel-Buffering", "no"); // Nginx/Vercel buffering disable
        }

        resHeaders.set("Access-Control-Allow-Origin", "*");

        // Si es SSE, envolvemos el stream para liberar el lock al cierre
        let finalStream = upstreamRes.body;
        if (req.method === "GET" && upstreamRes.ok && upstreamRes.body) {
            const reader = upstreamRes.body.getReader();
            finalStream = new ReadableStream({
                async start(controller) {
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            controller.enqueue(value);
                        }
                    } catch (e) {
                        controller.error(e);
                    } finally {
                        controller.close();
                        await releaseLock(tokenHash); // Liberar lock al cerrar stream
                    }
                },
                cancel() {
                    releaseLock(tokenHash);
                }
            });
        }

        return new Response(finalStream, {
            status: upstreamRes.status,
            statusText: upstreamRes.statusText,
            headers: resHeaders,
        });

    } catch (error: any) {
        console.error("[MCP Proxy] Error:", error);
        if (req.method === "GET" && tokenHash) await releaseLock(tokenHash);

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
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-MCP-Version",
        },
    });
}
