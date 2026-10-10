import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { agentTasks, approvals, contacts, engineRuns } from "@/server/db/schema";
import { freshDb } from "../helpers";
import { createTask, listAgentsWithStatus, updateTaskStatus } from "@/server/services/agents";
import { createContact, createOrganization, updateOrganization } from "@/server/services/crm";
import { decideApproval } from "@/server/services/commercial";
import { clearContactForPilot, loadFunnel, markOutreachSent, outreachGate } from "@/server/services/funnel";
import { setPrivacyNotice } from "@/server/services/privacy";
import { importFounderDecisions, type DecisionSeed } from "@/server/seed/decisions";
import { planWork, runEngine, setEngineConfig } from "@/server/engine/engine";
import type { EngineProvider } from "@/server/engine/types";
import DECISIONS from "@/server/seed/decisions-prx0013.json";

let db: DB;
beforeEach(async () => { db = await freshDb(); });

const prompts: string[] = [];
const fake = (fail = false): EngineProvider => ({
  name: "test", model: "test-model", available: true,
  async complete({ system, prompt }) {
    prompts.push(system + prompt);
    if (fail) throw new Error("provider down");
    return { text: `Borrador de prueba para: ${prompt.split("\n")[0]}`, costUsdMicros: 1500, model: "test-model" };
  },
});

async function prospect(name: string, fit: number, person: string) {
  const o = await createOrganization(db, { name, domain: `${name.toLowerCase().replace(/\W/g, "")}.mx`, country: "México", source: "research:test" });
  await updateOrganization(db, o.id, { fitScore: fit });
  const c = await createContact(db, { organizationId: o.id, fullName: person, title: "CHRO", source: "research:test", lawfulBasis: "not_assessed", leadStatus: "researched" });
  return { o, c };
}

async function decide(key: string, choice: string) {
  const [a] = (await db.select().from(approvals).where(eq(approvals.kind, "founder_decision"))).filter((x) => (x.meta as { key: string }).key === key);
  return decideApproval(db, a!.id, "approved", null, "founder", choice);
}

describe("Phase 2 engine, approvals and funnel", () => {
  it("loads the agents' decisions once, with D-P07 options mapped to a contact gate", async () => {
    const r = await importFounderDecisions(db);
    expect(r.created).toBe((DECISIONS as DecisionSeed[]).length);
    expect((await importFounderDecisions(db)).created).toBe(0);
    const [d] = (await db.select().from(approvals)).filter((x) => (x.meta as { key: string }).key === "D-P07");
    expect((d!.meta as { gate: Record<string, { cap: number | null }> }).gate).toEqual({ B: { cap: 10 }, C: { cap: null } });
    expect((await outreachGate(db)).open).toBe(false);
  });

  it("a decision needs one of its options and only the founder records it", async () => {
    await importFounderDecisions(db);
    const [d] = (await db.select().from(approvals)).filter((x) => (x.meta as { key: string }).key === "D-P07");
    await expect(decideApproval(db, d!.id, "approved", null, "founder")).rejects.toThrow(/Choose one of the options/);
    await expect(decideApproval(db, d!.id, "approved", null, "founder", "Z")).rejects.toThrow(/Choose one/);
    await expect(decideApproval(db, d!.id, "approved", null, "engine:test", "A")).rejects.toThrow(/Only the founder/);
    await decideApproval(db, d!.id, "approved", "freeze for now", "founder", "A");
    const gate = await outreachGate(db);
    expect(gate.open).toBe(false);
    expect(gate.reason).toMatch(/frozen/);
  });

  it("plans briefs for best-fit accounts, runs them and parks every output in the founder's inbox", async () => {
    await prospect("Acme Industrial", 5, "Ana Pérez");
    await prospect("Low Fit SA", 2, "Luis Gómez");
    const plan = await planWork(db);
    expect(plan.created.map((c) => c.title)).toEqual(["Account brief: Acme Industrial"]);
    expect(plan.blocked.join(" ")).toMatch(/D-P07/);
    expect((await planWork(db)).created).toHaveLength(0); // idempotent

    const run = await runEngine(db, fake(), { max: 3 });
    expect(run.results).toHaveLength(1);
    expect(run.results[0]!.status).toBe("waiting_approval");
    const [t] = await db.select().from(agentTasks);
    expect(t!.status).toBe("waiting_approval");
    expect(t!.costUsdMicros).toBe(1500);
    expect(prompts.at(-1)).toMatch(/Acme Industrial/);
    expect(prompts.at(-1)).toMatch(/cannot send, publish or contact anyone/);
    const inbox = await db.select().from(approvals).where(eq(approvals.entityId, t!.id));
    expect(inbox.map((a) => [a.kind, a.status])).toEqual([["agent_output", "pending"]]);
    const sal = (await listAgentsWithStatus(db)).find((a) => a.id === "SAL-02")!;
    expect(sal.statusSource).toBe("engine");
    const [r] = await db.select().from(engineRuns);
    expect(r).toMatchObject({ tasksRun: 1, tasksFailed: 0, costUsdMicros: 1500 });
  });

  it("F1: nobody but the founder closes work waiting for approval; send-back requeues with feedback", async () => {
    const t = await createTask(db, { agentId: "MKT-02", title: "Draft posts" });
    await updateTaskStatus(db, t.id, "working", {}, "engine:test");
    await updateTaskStatus(db, t.id, "waiting_approval", { output: "draft text" }, "engine:test");
    await expect(updateTaskStatus(db, t.id, "completed", {}, "engine:test")).rejects.toThrow(/Only the founder/);
    await expect(updateTaskStatus(db, t.id, "completed", {}, "orchestrator:claude-code")).rejects.toThrow(/Only the founder/);
    const [a] = await db.select().from(approvals).where(eq(approvals.entityId, t.id));
    await expect(decideApproval(db, a!.id, "rejected", "", "founder")).rejects.toThrow(/Say what to change/);
    await decideApproval(db, a!.id, "rejected", "Más corto y con fuente", "founder");
    const [after] = await db.select().from(agentTasks).where(eq(agentTasks.id, t.id));
    expect(after!.status).toBe("queued");
    expect(after!.instructions).toMatch(/Founder feedback .*Más corto y con fuente/);
  });

  it("D-P07 = B opens a capped pilot: clear → draft → approve → founder sends → funnel moves", async () => {
    await importFounderDecisions(db);
    const { o, c } = await prospect("Acme Industrial", 5, "Ana Pérez");
    await expect(clearContactForPilot(db, c.id)).rejects.toThrow(/D-P07/);
    await decide("D-P07", "B");
    const gate = await outreachGate(db);
    expect(gate).toMatchObject({ open: true, cap: 10, used: 0 });
    await expect(clearContactForPilot(db, c.id, "engine:test")).rejects.toThrow(/Only the founder/);
    await clearContactForPilot(db, c.id);

    const plan = await planWork(db);
    expect(plan.created.map((x) => x.title).sort()).toEqual(["Account brief: Acme Industrial", "Outreach draft: Ana Pérez (Acme Industrial)"]);
    await runEngine(db, fake(), { max: 3 });
    const drafts = await db.select().from(approvals).where(eq(approvals.kind, "outbound_message"));
    expect(drafts).toHaveLength(1);
    expect((drafts[0]!.meta as { contactId: string }).contactId).toBe(c.id);
    await expect(markOutreachSent(db, drafts[0]!.id, { sentOn: "2026-10-10", channel: "linkedin" })).rejects.toThrow(/Approve the draft/);
    await decideApproval(db, drafts[0]!.id, "approved", null, "founder");
    const [task] = await db.select().from(agentTasks).where(eq(agentTasks.id, drafts[0]!.entityId));
    expect(task!.status).toBe("completed");

    let f = (await loadFunnel(db, false)).funnel;
    expect(f.accounts.find((a) => a.id === o.id)!.stage).toBe("approved");
    // RISK-01 C1: nothing is recorded as sent without a privacy notice in force.
    await expect(markOutreachSent(db, drafts[0]!.id, { sentOn: "2026-10-10", channel: "linkedin" })).rejects.toThrow(/privacy notice/);
    await setPrivacyNotice(db, { version: "1.0", url: "https://praxia.example/privacidad" }, "founder");
    await expect(markOutreachSent(db, drafts[0]!.id, { sentOn: "2026-10-10", channel: "email" })).rejects.toThrow(/Email not verified/);
    await markOutreachSent(db, drafts[0]!.id, { sentOn: "2026-10-10", channel: "linkedin" });
    await expect(markOutreachSent(db, drafts[0]!.id, { sentOn: "2026-10-10", channel: "linkedin" })).rejects.toThrow(/Already recorded/);
    f = (await loadFunnel(db, false)).funnel;
    expect(f.accounts.find((a) => a.id === o.id)!.stage).toBe("contacted");
    expect(f.stages.find((s) => s.key === "contacted")!.reached).toBe(1);
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, c.id));
    expect(contact!.leadStatus).toBe("contacted");
    expect((await outreachGate(db)).used).toBe(1);
    expect(contact!.privacyNoticeVersion).toBe("1.0");
    expect(contact!.basisAssessedBy).toBe("founder");
    expect(contact!.residenceCountry).toBe("MX");
  });

  it("the pilot is limited to people residing in Mexico", async () => {
    await importFounderDecisions(db);
    const { c } = await prospect("Acme Industrial", 5, "Ana Pérez");
    await decide("D-P07", "B");
    await expect(clearContactForPilot(db, c.id, "founder", "CO")).rejects.toThrow(/residing in Mexico/);
    await expect(clearContactForPilot(db, c.id, "founder", "Mexico")).rejects.toThrow(/ISO/);
  });

  it("engine failures are recorded with their cause (F3) and the budget is a hard stop", async () => {
    await prospect("Acme Industrial", 5, "Ana Pérez");
    await planWork(db);
    const r = await runEngine(db, fake(true), { max: 1 });
    expect(r.results[0]).toMatchObject({ status: "error" });
    const [t] = await db.select().from(agentTasks);
    expect(t!.errorMessage).toBe("provider down");
    await setEngineConfig(db, { enabled: false, maxTasksPerRun: 3, dailyBudgetUsdMicros: 0 });
    await updateTaskStatus(db, t!.id, "queued");
    const stopped = await runEngine(db, fake(), { max: 1 });
    expect(stopped.results).toHaveLength(0);
    expect(stopped.stop).toMatch(/budget/);
    await expect(runEngine(db, fake(), { trigger: "schedule" }, "engine:cron")).rejects.toThrow(/turned off/);
    await expect(runEngine(db, { ...fake(), available: false, reason: "no key" }, {})).rejects.toThrow(/no key/);
  });
});
