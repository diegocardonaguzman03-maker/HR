"use server";
import { backfillApprovals, getEngineStatus, planWork, runEngine, setEngineConfig } from "@/server/engine/engine";
import { getEngineProvider } from "@/server/engine/provider";
import { decideApproval } from "@/server/services/commercial";
import { clearContactForPilot, markOutreachSent } from "@/server/services/funnel";
import { importFounderDecisions } from "@/server/seed/decisions";
import { run } from "./run";

const PAGES = ["/", "/analytics", "/approvals", "/tasks", "/world", "/agents"];

export async function engineStatusAction() {
  return run((db) => getEngineStatus(db, getEngineProvider()), []);
}
export async function runEngineAction(max: number) {
  return run((db, actor) => runEngine(db, getEngineProvider(), { max, trigger: "founder" }, actor), PAGES);
}
export async function planWorkAction() {
  return run((db, actor) => planWork(db, actor), PAGES);
}
export async function setEngineConfigAction(cfg: { enabled: boolean; maxTasksPerRun: number; dailyBudgetUsdMicros: number }) {
  return run((db, actor) => setEngineConfig(db, cfg, actor), PAGES);
}
export async function decideAction(approvalId: string, decision: "approved" | "rejected", note: string | null, choice: string | null = null) {
  return run((db, actor) => decideApproval(db, approvalId, decision, note, actor, choice), PAGES);
}
export async function markOutreachSentAction(approvalId: string, sentOn: string, channel: "linkedin" | "email" | "call") {
  return run((db, actor) => markOutreachSent(db, approvalId, { sentOn, channel }, actor), PAGES);
}
export async function clearForPilotAction(contactId: string, residenceCountry: string) {
  return run((db, actor) => clearContactForPilot(db, contactId, actor, residenceCountry), PAGES);
}
export async function loadDecisionsAction() {
  return run(async (db, actor) => ({ ...(await importFounderDecisions(db, actor)), backfilled: await backfillApprovals(db, actor) }), PAGES);
}
