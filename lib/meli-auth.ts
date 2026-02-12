import { supabaseAdmin } from "@/lib/supabase-server";

interface MeliTokenRow {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string | null;
  raw: Record<string, unknown> | null;
}

interface MeliRefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  user_id: string;
  scope?: string;
  token_type?: string;
}

export async function getValidMeliAccessToken(meliUserId: string): Promise<string> {
  const appId = process.env.MELI_APP_ID;
  const clientSecret = process.env.MELI_CLIENT_SECRET;

  if (!appId || !clientSecret) {
    throw new Error("Missing required environment variables: MELI_APP_ID or MELI_CLIENT_SECRET");
  }

  const { data: row, error } = await supabaseAdmin
    .from("meli_oauth_tokens")
    .select("user_id, access_token, refresh_token, expires_at, raw")
    .eq("user_id", meliUserId)
    .single();

  if (error || !row) {
    throw new Error(`No Mercado Libre OAuth token found for user_id: ${meliUserId}`);
  }

  const tokenRow = row as unknown as MeliTokenRow;

  if (!tokenRow.access_token) {
    throw new Error(`Invalid token row for user_id ${meliUserId}: missing access_token`);
  }

  // Si no tenemos expires_at, asumimos válido (legacy) y devolvemos.
  if (!tokenRow.expires_at) {
    return tokenRow.access_token;
  }

  const expiresAtMs = new Date(tokenRow.expires_at).getTime();
  const nowMs = Date.now();
  const bufferMs = 60 * 1000;

  // Si expires_at es inválido, forzamos refresh (pero con error claro si falta refresh_token).
  const shouldRefresh =
    Number.isNaN(expiresAtMs) ? true : expiresAtMs <= nowMs + bufferMs;

  if (!shouldRefresh) {
    return tokenRow.access_token;
  }

  if (!tokenRow.refresh_token) {
    throw new Error(`Cannot refresh token for user_id ${meliUserId}: missing refresh_token`);
  }

  const body = new URLSearchParams();
  body.set("grant_type", "refresh_token");
  body.set("client_id", appId);
  body.set("client_secret", clientSecret);
  body.set("refresh_token", tokenRow.refresh_token);

  const refreshRes = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  const responseText = await refreshRes.text();

  let refreshJson: MeliRefreshResponse | null = null;
  try {
    refreshJson = JSON.parse(responseText) as MeliRefreshResponse;
  } catch {
    // ignore; handled below
  }

  if (!refreshRes.ok || !refreshJson?.access_token || !refreshJson?.expires_in) {
    throw new Error(`Token refresh failed: ${refreshRes.status} - ${responseText.slice(0, 200)}`);
  }

  const newExpiresAt = new Date(Date.now() + refreshJson.expires_in * 1000).toISOString();

  const { error: upsertError } = await supabaseAdmin
    .from("meli_oauth_tokens")
    .upsert(
      {
        user_id: meliUserId,
        access_token: refreshJson.access_token,
        refresh_token: refreshJson.refresh_token ?? tokenRow.refresh_token,
        expires_at: newExpiresAt,
        raw: refreshJson as Record<string, unknown>,
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    throw new Error(`Failed to persist refreshed token: ${upsertError.message}`);
  }

  return refreshJson.access_token;
}
