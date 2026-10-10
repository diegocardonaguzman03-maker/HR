/**
 * Account-level conversion funnel: from the researched universe of accounts to won clients.
 *
 * Every account is placed at the furthest stage it has reached (a won client also counts as contacted, met, etc.),
 * so each stage's count is "accounts that reached at least this stage" and conversions are monotonic.
 * Only recorded facts move an account: imports, founder-approved drafts, logged interactions, opportunities,
 * proposals. Nothing is inferred or simulated here.
 */

export const FUNNEL_STAGES = [
  { key: "accounts", label: "Accounts researched", hint: "Imported or created in the CRM" },
  { key: "qualified", label: "ICP fit ≥ 4", hint: "Fit score 4–5 out of 5" },
  { key: "reachable", label: "Decision-maker identified", hint: "At least one named contact not on the do-not-contact list" },
  { key: "cleared", label: "Cleared to contact", hint: "Lawful basis assessed and D-P07 allows contact" },
  { key: "approved", label: "Message approved", hint: "Founder approved a 1:1 draft" },
  { key: "contacted", label: "Contacted", hint: "Outbound interaction logged" },
  { key: "engaged", label: "Replied", hint: "Inbound interaction logged" },
  { key: "meeting", label: "Meeting held", hint: "Meeting logged" },
  { key: "opportunity", label: "Opportunity", hint: "Opportunity created in the pipeline" },
  { key: "proposal", label: "Proposal sent", hint: "Approved proposal sent" },
  { key: "won", label: "Won", hint: "Opportunity closed won" },
] as const;
export type FunnelStageKey = (typeof FUNNEL_STAGES)[number]["key"];

export type FunnelOrg = { id: string; name: string; fitScore: number | null; lifecycle: string };
export type FunnelContact = { id: string; organizationId: string | null; lawfulBasis: string; doNotContact: boolean; leadStatus: string };
export type FunnelActivity = { organizationId: string | null; contactId: string | null; type: string; direction: string };
export type FunnelOpportunity = { organizationId: string; stageKind: "open" | "won" | "lost" };
export type FunnelProposal = { organizationId: string; status: string };
export type FunnelApproval = { kind: string; status: string; organizationId: string | null };
export type OutreachGate = { open: boolean; reason: string; cap: number | null; used: number };

export type FunnelInput = {
  orgs: FunnelOrg[];
  contacts: FunnelContact[];
  activities: FunnelActivity[];
  opportunities: FunnelOpportunity[];
  proposals: FunnelProposal[];
  approvals: FunnelApproval[];
  gate: OutreachGate;
};

export type FunnelStage = { key: FunnelStageKey; label: string; hint: string; reached: number; conversionFromPrev: number | null; blocker: string | null };
export type FunnelAccount = { id: string; name: string; fitScore: number | null; stage: FunnelStageKey; stageIndex: number; contacts: number; cleared: number; next: string };
export type FunnelResult = { stages: FunnelStage[]; accounts: FunnelAccount[]; bottleneck: FunnelStage | null };

const SENT_PROPOSAL = new Set(["sent", "negotiation", "accepted"]);
const OUTBOUND_TYPES = new Set(["email", "linkedin", "call"]);

export const isCleared = (c: FunnelContact, gate: OutreachGate) => gate.open && !c.doNotContact && c.lawfulBasis !== "not_assessed";

export function computeFunnel(input: FunnelInput): FunnelResult {
  const by = <T,>(rows: T[], key: (r: T) => string | null) => {
    const m = new Map<string, T[]>();
    for (const r of rows) { const k = key(r); if (k) m.set(k, [...(m.get(k) ?? []), r]); }
    return m;
  };
  const contactOrg = new Map(input.contacts.map((c) => [c.id, c.organizationId]));
  const orgOfActivity = (a: FunnelActivity) => a.organizationId ?? (a.contactId ? contactOrg.get(a.contactId) ?? null : null);
  const contacts = by(input.contacts, (c) => c.organizationId);
  const acts = by(input.activities, orgOfActivity);
  const opps = by(input.opportunities, (o) => o.organizationId);
  const props = by(input.proposals, (p) => p.organizationId);
  const appr = by(input.approvals, (a) => a.organizationId);

  const accounts: FunnelAccount[] = input.orgs.map((o) => {
    const cs = (contacts.get(o.id) ?? []).filter((c) => !c.doNotContact);
    const cleared = cs.filter((c) => isCleared(c, input.gate)).length;
    const a = acts.get(o.id) ?? [];
    const reached: boolean[] = [
      true,
      (o.fitScore ?? 0) >= 4,
      cs.length > 0,
      cleared > 0,
      (appr.get(o.id) ?? []).some((x) => x.kind === "outbound_message" && x.status === "approved"),
      a.some((x) => x.direction === "outbound" && OUTBOUND_TYPES.has(x.type)),
      a.some((x) => x.direction === "inbound"),
      a.some((x) => x.type === "meeting"),
      (opps.get(o.id) ?? []).length > 0,
      (props.get(o.id) ?? []).some((p) => SENT_PROPOSAL.has(p.status)),
      (opps.get(o.id) ?? []).some((p) => p.stageKind === "won") || o.lifecycle === "client",
    ];
    const idx = reached.lastIndexOf(true);
    return { id: o.id, name: o.name, fitScore: o.fitScore, stage: FUNNEL_STAGES[idx]!.key, stageIndex: idx, contacts: cs.length, cleared, next: nextStep(idx, input.gate) };
  });

  const stages: FunnelStage[] = FUNNEL_STAGES.map((s, i) => ({ ...s, reached: accounts.filter((a) => a.stageIndex >= i).length, conversionFromPrev: null, blocker: null }));
  for (let i = 1; i < stages.length; i++) {
    const prev = stages[i - 1]!.reached;
    stages[i]!.conversionFromPrev = prev ? stages[i]!.reached / prev : null;
  }
  const cleared = stages.find((s) => s.key === "cleared")!;
  if (!input.gate.open) cleared.blocker = input.gate.reason;
  else if (!cleared.reached) cleared.blocker = "No contact has an assessed lawful basis yet — clear pilot contacts.";
  const approved = stages.find((s) => s.key === "approved")!;
  if (input.gate.open && cleared.reached && !approved.reached) approved.blocker = "Drafts waiting for your approval (or not drafted yet — run the engine).";

  // The bottleneck is the first stage after "reachable" that holds accounts back (blocked or lowest conversion).
  const candidates = stages.slice(3).filter((s) => s.blocker || (s.conversionFromPrev !== null && s.conversionFromPrev < 1));
  const bottleneck = candidates.find((s) => s.blocker) ?? candidates.sort((a, b) => (a.conversionFromPrev ?? 1) - (b.conversionFromPrev ?? 1))[0] ?? null;
  accounts.sort((a, b) => b.stageIndex - a.stageIndex || (b.fitScore ?? 0) - (a.fitScore ?? 0) || a.name.localeCompare(b.name));
  return { stages, accounts, bottleneck };
}

function nextStep(idx: number, gate: OutreachGate): string {
  switch (FUNNEL_STAGES[idx]!.key) {
    case "accounts": return "Verify fit and trigger (RES-01 / STR-01)";
    case "qualified": return "Identify the decision-maker";
    case "reachable": return gate.open ? "Assess lawful basis and clear for pilot" : "Blocked: D-P07 (contact policy) undecided";
    case "cleared": return "Engine drafts a 1:1 message for your approval";
    case "approved": return "Send it yourself, then mark it sent";
    case "contacted": return "Follow up; log any reply";
    case "engaged": return "Propose a discovery meeting";
    case "meeting": return "Open an opportunity with the problem statement";
    case "opportunity": return "Prepare and approve the proposal";
    case "proposal": return "Negotiate and close";
    case "won": return "Kickoff and onboarding (DEL-01 / CX-01)";
  }
}
