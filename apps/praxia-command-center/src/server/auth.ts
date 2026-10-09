/**
 * Founder authentication: single privileged user, password from env, HMAC-signed session cookie.
 * Uses Web Crypto so it works in both the Edge middleware and Node server actions.
 */
export const SESSION_COOKIE = "praxia_session";
const SESSION_HOURS = 12;
const enc = new TextEncoder();

export type AuthConfig = { configured: true; password: string; secret: string } | { configured: false; reason: string };

/** Values published in .env.example or obviously weak — never accepted. */
const KNOWN_BAD = ["change-me", "changeme", "password", "generate-a-random-string-of-at-least-32-characters"];

export function authConfig(): AuthConfig {
  const password = process.env.PRAXIA_ADMIN_PASSWORD;
  const secret = process.env.PRAXIA_SESSION_SECRET;
  if (!password || !secret) return { configured: false, reason: "PRAXIA_ADMIN_PASSWORD and PRAXIA_SESSION_SECRET are not set." };
  if (KNOWN_BAD.includes(password.toLowerCase()) || KNOWN_BAD.includes(secret)) return { configured: false, reason: "Example credentials from .env.example are not accepted." };
  if (password.length < 12) return { configured: false, reason: "PRAXIA_ADMIN_PASSWORD must be at least 12 characters." };
  if (secret.length < 32) return { configured: false, reason: "PRAXIA_SESSION_SECRET must be at least 32 characters (use: openssl rand -base64 48)." };
  return { configured: true, password, secret };
}

/**
 * Login-free mode for local development ONLY: requires PRAXIA_DEV_OPEN=1, a non-production build and no credentials.
 * `npm run dev` binds to 127.0.0.1 so the open app is not reachable from the network.
 */
export const devOpenMode = () => !authConfig().configured && process.env.NODE_ENV !== "production" && process.env.PRAXIA_DEV_OPEN === "1";

const b64url = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf instanceof Uint8Array ? buf : new Uint8Array(buf)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function createSessionToken(secret: string, now = Date.now()) {
  const payload = b64url(enc.encode(JSON.stringify({ sub: "founder", exp: now + SESSION_HOURS * 3_600_000 })));
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function verifySessionToken(token: string | undefined, secret: string, now = Date.now()) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (!constantTimeEqual(sig, await hmac(secret, payload))) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as { sub: string; exp: number };
    return data.sub === "founder" && data.exp > now;
  } catch {
    return false;
  }
}

export async function passwordMatches(input: string, expected: string, secret: string) {
  // Compare HMACs so length differences don't leak through timing.
  return constantTimeEqual(await hmac(secret, input), await hmac(secret, expected));
}

export const sessionMaxAge = SESSION_HOURS * 3600;

/** Only same-origin relative paths are allowed as post-login destinations. */
export function safeNext(next: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || /[\\\s\u0000-\u001f]/.test(next)) return "/";
  try {
    const u = new URL(next, "http://praxia.local");
    return u.origin === "http://praxia.local" ? u.pathname + u.search : "/";
  } catch {
    return "/";
  }
}
