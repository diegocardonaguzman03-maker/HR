/**
 * Scheduled engine run (Phase 2). Call it from a scheduler (cron, Vercel Cron, GitHub Actions) with
 *   Authorization: Bearer $PRAXIA_ENGINE_CRON_SECRET
 * It runs only when the founder turned scheduled runs on, within the daily budget, and every output still waits
 * for founder approval. Without the secret configured the endpoint is disabled.
 */
import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getDb } from "@/server/db/client";
import { attempt } from "@/server/services/common";
import { runEngine } from "@/server/engine/engine";
import { getEngineProvider } from "@/server/engine/provider";

export const dynamic = "force-dynamic";

function authorized(req: NextRequest, secret: string) {
  const got = Buffer.from(req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "");
  const want = Buffer.from(secret);
  return got.length === want.length && timingSafeEqual(got, want);
}

export async function POST(req: NextRequest) {
  const secret = process.env.PRAXIA_ENGINE_CRON_SECRET;
  if (!secret || secret.length < 32) return NextResponse.json({ error: "Scheduled runs are disabled (PRAXIA_ENGINE_CRON_SECRET not set)." }, { status: 503 });
  if (!authorized(req, secret)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const res = await attempt(async () => runEngine(await getDb(), getEngineProvider(), { trigger: "schedule" }, "engine:schedule"));
  return res.ok ? NextResponse.json(res.value) : NextResponse.json({ error: res.error }, { status: 409 });
}
