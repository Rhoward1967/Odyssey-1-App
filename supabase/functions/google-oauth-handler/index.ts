// supabase/functions/google-oauth-handler/index.ts

// Guidelines followed:
// - Uses Deno.serve (no std server imports)
// - Uses Web APIs only (no external deps)
// - Reads runtime secrets from env (available in Supabase functions)
// - Handles multiple routes within one function
// - Conservative cookie/security defaults

// Endpoints:
// - GET /google-oauth-handler/start?redirect_to=<url>
//   Redirects user to Supabase Google OAuth with CSRF state.
// - GET /google-oauth-handler/callback?code=...&state=...
//   Exchanges code for a session using service role; sets session cookie; redirects.
// - POST /google-oauth-handler/signout
//   Clears session cookie.

type Json = Record<string, unknown>;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DEFAULT_REDIRECT = Deno.env.get("GOOGLE_OAUTH_REDIRECT_SUCCESS") ?? "/";
const COOKIE_NAME = Deno.env.get("SESSION_COOKIE_NAME") ?? "sb-access-token";
const COOKIE_DOMAIN = Deno.env.get("SESSION_COOKIE_DOMAIN") ?? undefined; // e.g., ".example.com"
const COOKIE_SECURE = (Deno.env.get("SESSION_COOKIE_SECURE") ?? "true") === "true";
const COOKIE_SAME_SITE = (Deno.env.get("SESSION_COOKIE_SAMESITE") ?? "Lax") as
  | "Lax"
  | "Strict"
  | "None";
const COOKIE_PATH = Deno.env.get("SESSION_COOKIE_PATH") ?? "/";

const STATE_SECRET = Deno.env.get("OAUTH_STATE_SECRET") ?? cryptoRandomBase64(24);

function cryptoRandomBase64(length: number) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  // Base64url
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(input: string, key: string) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(input));
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  // base64url
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function toJSON(data: Json, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Connection": "keep-alive" },
  });
}

function redirect(url: string, headers: HeadersInit = {}) {
  return new Response(null, { status: 302, headers: { Location: url, ...headers } });
}

function buildCookie(name: string, value: string, maxAgeSeconds?: number) {
  const parts = [`${name}=${value}`];
  if (maxAgeSeconds !== undefined) parts.push(`Max-Age=${Math.max(0, maxAgeSeconds)}`);
  parts.push(`Path=${COOKIE_PATH}`);
  if (COOKIE_DOMAIN) parts.push(`Domain=${COOKIE_DOMAIN}`);
  parts.push(`SameSite=${COOKIE_SAME_SITE}`);
  if (COOKIE_SECURE) parts.push("Secure");
  parts.push("HttpOnly"); // prevent JS access to the token
  return parts.join("; ");
}

function clearCookie(name: string) {
  return buildCookie(name, "", 0);
}

// Builds the Supabase OAuth URL.
function buildSupabaseOAuthURL(redirectTo: string, state: string) {
  const url = new URL(`${SUPABASE_URL}/auth/v1/authorize`);
  url.searchParams.set("provider", "google");
  url.searchParams.set("redirect_to", redirectTo);
  url.searchParams.set("state", state);

  // *** FIX: Added Google Calendar scope to request the correct permissions ***
  const scopes = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/calendar.events" // Allows reading and writing events
  ].join(" ");

  url.searchParams.set("scopes", scopes);
  url.searchParams.set("access_type", "offline"); // Required to get a refresh token for long-term access
  url.searchParams.set("prompt", "consent"); // Ensures the user is re-prompted for the new scope

  return url.toString();
}

interface VerifyStatePayload {
  redirect_to: string;
  issued_at: number;
}

async function makeState(redirect_to: string) {
  const payload: VerifyStatePayload = {
    redirect_to,
    issued_at: Date.now(),
  };
  const json = JSON.stringify(payload);
  const sig = await hmac(json, STATE_SECRET);
  return `${sig}.${btoa(json)}`;
}

async function verifyState(state: string): Promise<VerifyStatePayload | null> {
  const [sig, b64] = state.split(".");
  if (!sig || !b64) return null;

  let json: string;
  try {
    json = atob(b64);
  } catch {
    return null;
  }

  const expected = await hmac(json, STATE_SECRET);
  if (expected !== sig) return null;

  try {
    const payload = JSON.parse(json) as VerifyStatePayload;
    // Optional expiry: 10 minutes
    if (Date.now() - payload.issued_at > 10 * 60 * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

async function exchangeCodeForSession(code: string, redirectUri: string) {
  // Use service role to exchange code on server side
  const url = new URL(`${SUPABASE_URL}/auth/v1/token`);
  url.searchParams.set("grant_type", "authorization_code");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Auth code exchange failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    user?: unknown;
  };
}

function getBaseUrl(req: Request) {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

console.info("google-oauth-handler started");

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const base = getBaseUrl(req);

  // Route: /google-oauth-handler/start
  if (url.pathname.endsWith("/google-oauth-handler/start")) {
    const redirect_to = url.searchParams.get("redirect_to") || DEFAULT_REDIRECT;
    const state = await makeState(redirect_to);
    const callback = `${base}/functions/v1/google-oauth-handler/callback`;
    const supabaseOAuthUrl = buildSupabaseOAuthURL(callback, state);
    return redirect(supabaseOAuthUrl);
  }

  // Route: /google-oauth-handler/callback
  if (url.pathname.endsWith("/google-oauth-handler/callback")) {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return toJSON({ error: "missing_code_or_state" }, 400);
    }

    const payload = await verifyState(state);
    if (!payload) {
      return toJSON({ error: "invalid_state" }, 400);
    }

    const redirectUri = `${base}/functions/v1/google-oauth-handler/callback`;

    try {
      const auth = await exchangeCodeForSession(code, redirectUri);
      const headers = new Headers();
      headers.append(
        "Set-Cookie",
        buildCookie(COOKIE_NAME, auth.access_token, auth.expires_in),
      );

      if (auth.refresh_token) {
        headers.append(
          "Set-Cookie",
          buildCookie(`${COOKIE_NAME}-refresh`, auth.refresh_token, 60 * 60 * 24 * 30), // 30d
        );
      }

      return redirect(payload.redirect_to || DEFAULT_REDIRECT, headers);
    } catch (e) {
      console.error(e);
      return toJSON({ error: "exchange_failed", details: String(e) }, 500);
    }
  }

  // Route: /google-oauth-handler/signout
  if (url.pathname.endsWith("/google-oauth-handler/signout")) {
    if (req.method !== "POST") {
      return toJSON({ error: "method_not_allowed" }, 405);
    }
    const headers = new Headers();
    headers.append("Set-Cookie", clearCookie(COOKIE_NAME));
    headers.append("Set-Cookie", clearCookie(`${COOKIE_NAME}-refresh`));
    return toJSON({ ok: true }, 200);
  }

  if (url.pathname.endsWith("/google-oauth-handler") || url.pathname.endsWith("/google-oauth-handler/")) {
    return toJSON({
      endpoints: {
        start: "/functions/v1/google-oauth-handler/start?redirect_to=/",
        callback: "/functions/v1/google-oauth-handler/callback",
        signout: { path: "/functions/v1/google-oauth-handler/signout", method: "POST" },
      },
    });
  }

  return toJSON({ error: "not_found" }, 404);
});
