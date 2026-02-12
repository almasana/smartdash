import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-server";

function verifyState(state: string, secret: string) {
    const [b64, sig] = state.split(".");
    if (!b64 || !sig) return null;

    const expected = crypto.createHmac("sha256", secret).update(b64).digest("base64url");
    if (sig !== expected) return null;

    try {
        const json = Buffer.from(b64, "base64url").toString("utf8");
        return JSON.parse(json) as { next?: string; nonce?: string; ts?: number };
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");

    const appId = process.env.MELI_APP_ID;
    const clientSecret = process.env.MELI_CLIENT_SECRET;
    const redirectUrl = process.env.MELI_REDIRECT_URL;
    const stateSecret = process.env.MELI_OAUTH_STATE_SECRET;

    if (!code || !state) {
        return NextResponse.json({ error: "Missing code/state" }, { status: 400 });
    }
    if (!appId || !clientSecret || !redirectUrl || !stateSecret) {
        return NextResponse.json(
            { error: "Missing MELI_APP_ID / MELI_CLIENT_SECRET / MELI_REDIRECT_URL / MELI_OAUTH_STATE_SECRET" },
            { status: 500 }
        );
    }

    const decoded = verifyState(state, stateSecret);
    if (!decoded) {
        return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }

    // Token exchange: x-www-form-urlencoded
    const body = new URLSearchParams();
    body.set("grant_type", "authorization_code");
    body.set("client_id", appId);
    body.set("client_secret", clientSecret);
    body.set("code", code);
    body.set("redirect_uri", redirectUrl);

    const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
        method: "POST",
        headers: {
            accept: "application/json",
            "content-type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
        cache: "no-store",
    });

    const tokenJson = await tokenRes.json().catch(() => null);

    if (!tokenRes.ok) {
        return NextResponse.json(
            { error: "Token exchange failed", status: tokenRes.status, details: tokenJson },
            { status: 500 }
        );
    }

    // tokenJson típico: { access_token, refresh_token, user_id, expires_in, scope, token_type }
    // Guardado mínimo (ajustá a tu modelo). Requiere tabla meli_oauth_tokens (abajo).
    const expiresAt = tokenJson?.expires_in
        ? new Date(Date.now() + Number(tokenJson.expires_in) * 1000).toISOString()
        : null;

    const { error: upsertError } = await supabaseAdmin
        .from("meli_oauth_tokens")
        .upsert(
            {
                user_id: String(tokenJson.user_id ?? "unknown"),
                access_token: tokenJson.access_token,
                refresh_token: tokenJson.refresh_token,
                expires_at: expiresAt,
                raw: tokenJson,
            },
            { onConflict: "user_id" }
        );

    if (upsertError) {
        return NextResponse.json({ error: "Failed to persist tokens", details: upsertError }, { status: 500 });
    }

    // Redirigir de vuelta
    const next = decoded.next || "/";
    return NextResponse.redirect(new URL(next, req.url));
}
