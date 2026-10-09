/**
 * Founder authentication: single privileged user, password from env, HMAC-signed session cookie.
 * Uses Web Crypto so it works in both the Edge middleware and Node server actions.
 */
export const SESSION_COOKIE = "praxia_session";
const SESSION_HOURS = 12;
const enc = new TextEncoder();

export type AuthConfig = { configured: true; password: string; secret: string } | { configured: false; reason: string };

export function authConfig(): AuthConfig {
  const password = process.env.PRAXIA_ADMIN_PASSWORD;
  const secret = process.env.PRAXIA_SESSION_SECRET;
  if (!password || !secret) return { configured: false, reason: "PRAXIA_ADMIN_PASSWORD and PRAXIA_SESSION_SECRET are not set." };
  if (secret.length < 32) return { configured: false, reason: "PRAXIA_SESSION_SECRET must be at least 32 characters." };
  return { configured: true, password, secret };
}

/** In development without configuration the app runs open (with a visible warning). Never in production. */
export const devOpenMode = () => !authConfig().configured && process.env.NODE_ENV !== "production";

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
