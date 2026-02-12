import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function signState(payload: object, secret: string) {
    const json = JSON.stringify(payload);
    const b64 = Buffer.from(json).toString("base64url");
    const sig = crypto.createHmac("sha256", secret).update(b64).digest("base64url");
    return `${b64}.${sig}`;
}

export async function GET(req: NextRequest) {
    const appId = process.env.MELI_APP_ID;
    const redirectUrl = process.env.MELI_REDIRECT_URL;
    const stateSecret = process.env.MELI_OAUTH_STATE_SECRET;

    if (!appId || !redirectUrl || !stateSecret) {
        return NextResponse.json(
            { error: "Missing MELI_APP_ID / MELI_REDIRECT_URL / MELI_OAUTH_STATE_SECRET" },
            { status: 500 }
        );
    }

    // opcional: a dónde volver después del callback
    const next = req.nextUrl.searchParams.get("next") || "/";

    const state = signState(
        {
            next,
            nonce: crypto.randomBytes(16).toString("hex"),
            ts: Date.now(),
        },
        stateSecret
    );

    const authorizeUrl =
        `https://auth.mercadolibre.com.ar/authorization` +
        `?response_type=code` +
        `&client_id=${encodeURIComponent(appId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
        `&state=${encodeURIComponent(state)}`;

    return NextResponse.redirect(authorizeUrl);
}
