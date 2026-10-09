import "server-only";
import { cookies } from "next/headers";
import { authConfig, devOpenMode, SESSION_COOKIE, verifySessionToken } from "./auth";
import { BusinessRuleError } from "./services/common";

/** Defense in depth: every server action re-checks the founder session (middleware is not the only gate). */
export async function requireFounder() {
  if (devOpenMode()) return "founder" as const;
  const cfg = authConfig();
  if (!cfg.configured) throw new BusinessRuleError("Authentication is not configured.");
  const ok = await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value, cfg.secret);
  if (!ok) throw new BusinessRuleError("Session expired. Please sign in again.");
  return "founder" as const;
}
