import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { getContext } from "@/server/context";
import { agentTasks, approvals, companySettings, type DecisionOption } from "@/server/db/schema";
import { demoFilter } from "@/server/services/common";
import { outreachGate } from "@/server/services/funnel";
import { Badge, Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { ApprovalButtons } from "./ApprovalButtons";
import { CopyButton, DecisionForm, LoadDecisionsButton, MarkSentButton, ReviewButtons } from "./Inbox";

export const metadata = { title: "Approvals" };

type Meta = { key?: string; question?: string; recommended?: string; risks?: string; cost?: string; deadline?: string; sources?: string[]; sourcePaths?: string[]; unlocks?: string; draft?: string; recipient?: string; role?: string; sentAt?: string; channel?: string; linkedinUrl?: string };
const meta = (a: { meta: unknown }) => (a.meta ?? {}) as Meta;
const KIND_LABEL: Record<string, string> = { founder_decision: "decision", outbound_message: "1:1 draft", agent_output: "agent output", proposal_pricing: "pricing", contract: "contract", expense: "expense" };

export default async function ApprovalsPage() {
  const { db, includeDemo, today } = await getContext();
  const all = await db.select().from(approvals).where(demoFilter(approvals.isDemo, includeDemo)).orderBy(desc(approvals.createdAt));
  const taskIds = all.filter((a) => a.entityType === "agent_task").map((a) => a.entityId);
  const tasks = taskIds.length ? await db.select({ id: agentTasks.id, agentId: agentTasks.agentId, output: agentTasks.output, title: agentTasks.title }).from(agentTasks).where(inArray(agentTasks.id, taskIds)) : [];
  const taskOf = new Map(tasks.map((t) => [t.id, t]));
  const gate = await outreachGate(db);
  const noticeVersion = (await db.select({ v: companySettings.privacyNoticeVersion }).from(companySettings))[0]?.v ?? null;
  const pending = all.filter((a) => a.status === "pending");
  const decisions = pending.filter((a) => a.kind === "founder_decision").sort((x, y) => Number(meta(y).key === "D-P07") - Number(meta(x).key === "D-P07") || (meta(x).deadline ?? "").localeCompare(meta(y).deadline ?? ""));
  const drafts = pending.filter((a) => a.kind === "outbound_message");
  const outputs = pending.filter((a) => a.kind === "agent_output");
  const other = pending.filter((a) => !["founder_decision", "outbound_message", "agent_output"].includes(a.kind));
  const toSend = all.filter((a) => a.kind === "outbound_message" && a.status === "approved" && !meta(a).sentAt);
  const anyDecisions = all.some((a) => a.kind === "founder_decision");
  const href = (a: (typeof all)[number]) => (a.entityType === "proposal" ? `/proposals/${a.entityId}` : a.entityType === "agent_task" ? "/tasks" : "/approvals");

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader label="Governance · founder inbox" title="Approvals"
        description="Only you decide. The agents' decisions, their outputs and every 1:1 draft wait here. Approving a draft never sends it: you send it yourself and record it, and the funnel moves."
        actions={!anyDecisions ? <LoadDecisionsButton /> : undefined} />

      <p className="mb-3 text-[15px] font-medium">{pending.length} waiting for you</p>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[["Decisions", decisions.length, "#decisions"], ["1:1 drafts", drafts.length, "#drafts"], ["Ready to send", toSend.length, "#send"], ["Agent outputs", outputs.length, "#outputs"], ["Other", other.length, "#other"]].map(([l, n, h]) => (
          <a key={l as string} href={h as string} className="rounded-xl border border-hair bg-graphite-2 p-4 hover:border-indigo/50">
            <div className="font-mono text-[10px] tracking-[0.12em] text-mute uppercase">{l}</div>
            <div className={`mt-1 text-2xl font-semibold ${(n as number) > 0 ? "text-ivory" : "text-mute"}`}>{n as number}</div>
          </a>
        ))}
      </div>

      <div className={`mb-6 rounded-lg border px-4 py-3 text-[13px] ${gate.open ? "border-ok/40 bg-ok/5" : "border-warn/40 bg-warn/5"}`}>
        <b>Contact policy:</b> {gate.open ? `open — ${gate.reason}. Clear pilot contacts on the Funnel page; the engine drafts only for them.` : `closed — ${gate.reason}`} <Link href="/analytics" className="ml-1 text-indigo-soft hover:underline">Open the funnel →</Link>
      </div>

      <Card id="decisions" className="mb-6 p-5">
        <SectionTitle label="Decisions" title={`${decisions.length} decision${decisions.length === 1 ? "" : "s"} raised by the agents`} />
        {!decisions.length ? <EmptyState title={anyDecisions ? "All decided" : "No decisions loaded"}>{anyDecisions ? "Every decision the agents raised has your answer." : "Load the decisions from the PRX-0013 deliverables."}</EmptyState> : (
          <ul className="flex flex-col gap-4">
            {decisions.map((a) => {
              const m = meta(a);
              const late = m.deadline && m.deadline < today;
              return (
                <li key={a.id} className="rounded-lg border border-hair p-4">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge tone="violet">{m.key}</Badge>
                    {m.deadline && <Badge tone={late ? "bad" : "warn"}>decide by {m.deadline}</Badge>}
                    <span className="font-mono text-[11px] text-mute">raised by {(m.sources ?? []).join(", ")}</span>
                  </div>
                  <div className="font-medium">{a.title.replace(`${m.key} · `, "")}</div>
                  <p className="mt-1 text-[13px] text-niebla">{m.question ?? a.detail}</p>
                  <DecisionForm id={a.id} options={(a.options ?? []) as DecisionOption[]} recommended={m.recommended ?? null} />
                  <dl className="mt-3 grid gap-x-4 gap-y-1 text-[12px] text-niebla md:grid-cols-[110px_1fr]">
                    {m.unlocks && <><dt className="text-mute">Unlocks</dt><dd>{m.unlocks}</dd></>}
                    {m.risks && <><dt className="text-mute">Risks</dt><dd>{m.risks}</dd></>}
                    {m.cost && <><dt className="text-mute">Cost</dt><dd>{m.cost}</dd></>}
                    {m.sourcePaths?.length ? <><dt className="text-mute">Sources</dt><dd className="font-mono text-[11px] break-all">{m.sourcePaths.join(" · ")}</dd></> : null}
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card id="drafts" className="mb-6 p-5">
        <SectionTitle label="Outreach" title="1:1 drafts waiting for you" />
        {!drafts.length ? <EmptyState title="No drafts">{gate.open ? "Clear pilot contacts on the Funnel page, plan work and run the engine." : "Drafts start once D-P07 allows contact."}</EmptyState> : (
          <ul className="flex flex-col gap-4">
            {drafts.map((a) => { const m = meta(a); const t = taskOf.get(a.entityId); return (
              <li key={a.id} className="rounded-lg border border-hair p-4">
                <div className="mb-1 flex flex-wrap items-center gap-2"><Badge tone="clay">1:1 draft</Badge><span className="font-mono text-[11px] text-mute">by {t?.agentId ?? a.requestedBy} · for {m.recipient} {m.role ? `(${m.role})` : ""}</span></div>
                <div className="font-medium">{a.title}</div>
                <pre className="mt-2 max-h-80 overflow-auto rounded-md bg-graphite-3 p-3 font-sans text-[13px] whitespace-pre-wrap">{m.draft ?? t?.output ?? a.detail}</pre>
                <div className="mt-3 flex flex-wrap gap-2"><ReviewButtons id={a.id} kind="outbound_message" /><CopyButton text={m.draft ?? ""} /></div>
              </li>
            ); })}
          </ul>
        )}
      </Card>

      {toSend.length > 0 && (
        <Card id="send" className="mb-6 p-5">
          <SectionTitle label="Your move" title="Approved — send them yourself, then mark as sent" />
          {!noticeVersion && <p className="mb-3 rounded-md border border-warn/40 bg-warn/5 px-3 py-2 text-[12.5px] text-warn">Record the privacy notice in Settings first — a message can&apos;t be marked as sent without it (RISK-01 C1), and it should be linked in the message.</p>}
          <ul className="flex flex-col gap-3">
            {toSend.map((a) => { const m = meta(a); return (
              <li key={a.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-hair p-4">
                <div className="min-w-0 flex-1"><div className="font-medium">{a.title}</div><p className="mt-1 line-clamp-3 text-[12.5px] whitespace-pre-wrap text-niebla">{m.draft}</p>{m.linkedinUrl && <a className="text-[12px] text-indigo-soft hover:underline" href={m.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn profile ↗</a>}</div>
                <div className="flex gap-2"><CopyButton text={m.draft ?? ""} /><MarkSentButton id={a.id} today={today} /></div>
              </li>
            ); })}
          </ul>
        </Card>
      )}

      <Card id="outputs" className="mb-6 p-5">
        <SectionTitle label="Agent work" title="Outputs waiting for your approval" />
        {!outputs.length ? <EmptyState title="Nothing waiting">When the engine finishes a task, its output lands here.</EmptyState> : (
          <ul className="flex flex-col gap-3">
            {outputs.map((a) => { const t = taskOf.get(a.entityId); const out = t?.output ?? a.detail; const isFile = /^[\w./-]+\.(md|csv|pptx|json)$/.test(out.trim()); return (
              <li key={a.id} className="rounded-lg border border-hair p-4">
                <div className="mb-1 flex flex-wrap items-center gap-2"><Badge tone="indigo">{t?.agentId ?? a.requestedBy}</Badge>{a.isDemo && <Badge tone="clay">Demo</Badge>}<span className="font-mono text-[11px] text-mute">{a.createdAt.slice(0, 16).replace("T", " ")}</span></div>
                <div className="font-medium">{t?.title ?? a.title}</div>
                {isFile ? <p className="mt-1 font-mono text-[12px] text-niebla">Deliverable: {out}</p> : (
                  <details className="mt-2"><summary className="cursor-pointer text-[12.5px] text-indigo-soft">Read the output ({out.length.toLocaleString()} characters)</summary><pre className="mt-2 max-h-[480px] overflow-auto rounded-md bg-graphite-3 p-3 font-sans text-[13px] whitespace-pre-wrap">{out}</pre></details>
                )}
                <div className="mt-3"><ReviewButtons id={a.id} kind="agent_output" /></div>
              </li>
            ); })}
          </ul>
        )}
      </Card>

      {other.length > 0 && (
        <Card id="other" className="mb-6 p-5">
          <SectionTitle label="Commercial" title="Pricing and other approvals" />
          <ul className="flex flex-col gap-3">
            {other.map((a) => (
              <li key={a.id} className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-hair p-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex gap-2"><Badge tone="warn">{KIND_LABEL[a.kind] ?? a.kind}</Badge>{a.isDemo && <Badge tone="clay">Demo</Badge>}<span className="font-mono text-[11px] text-mute">requested by {a.requestedBy} · {a.createdAt.slice(0, 10)}</span></div>
                  <Link href={href(a)} className="font-medium hover:underline">{a.title}</Link>
                  <p className="mt-1 text-[13px] text-niebla">{a.detail}</p>
                </div>
                <ApprovalButtons id={a.id} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-5">
        <SectionTitle label="History" title="Decided" />
        <div className="overflow-x-auto">
          <table className="px-table"><thead><tr><th>Decided</th><th>Kind</th><th>Item</th><th>Decision</th><th>Note</th></tr></thead>
            <tbody>{all.filter((a) => a.status !== "pending").map((a) => <tr key={a.id}><td className="font-mono text-[12px]">{a.decidedAt?.slice(0, 10)}</td><td><Badge>{KIND_LABEL[a.kind] ?? a.kind}</Badge></td><td><Link className="hover:underline" href={href(a)}>{a.title}</Link></td><td><Badge tone={a.status === "approved" ? "ok" : "bad"}>{a.kind === "founder_decision" ? (a.status === "approved" ? `option ${a.choice}` : "deferred") : a.kind === "outbound_message" && a.status === "approved" ? (meta(a).sentAt ? `sent ${meta(a).sentAt}` : "approved") : a.status === "rejected" && (a.kind === "agent_output" || a.kind === "outbound_message") ? "sent back" : a.status}</Badge></td><td className="text-niebla">{a.decisionNote}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
