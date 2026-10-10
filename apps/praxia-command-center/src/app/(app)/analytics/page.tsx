import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { getContext } from "@/server/context";
import { contacts, organizations } from "@/server/db/schema";
import { loadFunnel, loadProgress } from "@/server/services/funnel";
import { loadDashboard } from "@/server/services/dashboard";
import { formatMoney, formatPct } from "@/domain/money";
import { Badge, Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { SimpleKpi } from "@/components/dashboard/Kpi";
import { ClearForPilotButton, EngineControls } from "./EngineControls";

export const metadata = { title: "Funnel & progress" };

const KIND: Record<string, string> = { founder_decision: "decisions", outbound_message: "1:1 drafts", agent_output: "agent outputs", proposal_pricing: "pricing" };

export default async function AnalyticsPage() {
  const { db, includeDemo, today } = await getContext();
  const { funnel, gate } = await loadFunnel(db, includeDemo);
  const prog = await loadProgress(db, includeDemo, today);
  const d = await loadDashboard(db, { includeDemo, periodKey: "ytd", today });
  const R = d.settings.reportingCurrency;
  const st = Object.fromEntries(funnel.stages.map((s) => [s.key, s]));
  const max = Math.max(1, funnel.stages[0]!.reached);
  const maxDay = Math.max(1, ...prog.completedByDay.map((x) => x.count));
  const pilot = await db.select({ c: contacts, o: organizations }).from(contacts).innerJoin(organizations, eq(contacts.organizationId, organizations.id))
    .where(and(eq(contacts.isDemo, false), eq(contacts.doNotContact, false))).orderBy(desc(organizations.fitScore)).limit(400);
  const candidates = pilot.filter((r) => r.c.lawfulBasis === "not_assessed").slice(0, 12);
  const cleared = pilot.filter((r) => r.c.lawfulBasis !== "not_assessed");

  return (
    <div className="mx-auto max-w-[1300px]">
      <PageHeader label="Revenue engine · live" title="Funnel & progress"
        description={<>From the researched universe to won clients. Each account sits at the furthest stage it has really reached — only recorded facts move it.{includeDemo ? " Demo data is included (toggle in the top bar)." : " Real data only."}</>} />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-6">
        <SimpleKpi label="Accounts" value={String(st.accounts!.reached)} sub={`${st.qualified!.reached} with ICP fit ≥ 4`} />
        <SimpleKpi label="Cleared to contact" value={String(st.cleared!.reached)} sub={gate.open ? gate.reason : "contact policy closed"} />
        <SimpleKpi label="Contacted" value={String(st.contacted!.reached)} sub={`${st.engaged!.reached} replied`} />
        <SimpleKpi label="Meetings → opps" value={`${st.meeting!.reached} → ${st.opportunity!.reached}`} />
        <SimpleKpi label="Won" value={String(st.won!.reached)} sub={`win rate ${formatPct(d.sales.winRate)}`} />
        <SimpleKpi label="Weighted pipeline" kind="forecast" value={formatMoney(d.sales.weightedPipeline.value, R)} />
      </div>

      {funnel.bottleneck && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-clay/40 bg-clay/5 px-5 py-4">
          <div><div className="font-mono text-[10px] tracking-[0.12em] text-clay uppercase">Bottleneck now</div>
            <div className="mt-0.5 font-medium">{funnel.bottleneck.label}{funnel.bottleneck.blocker ? ` — ${funnel.bottleneck.blocker}` : ` — ${formatPct(funnel.bottleneck.conversionFromPrev)} conversion from the previous stage`}</div></div>
          <Link href="/approvals" className="rounded-lg border border-clay/50 px-3 py-1.5 text-[13px] text-clay hover:bg-clay/10">Decide in Approvals →</Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <SectionTitle label="Conversion funnel" title="Accounts that reached each stage" />
          <ul className="flex flex-col gap-2">
            {funnel.stages.map((s) => (
              <li key={s.key} className="grid grid-cols-[170px_1fr_92px] items-center gap-3 text-[12.5px]" title={s.hint}>
                <span className="truncate text-niebla">{s.label}</span>
                <span className="relative h-5 rounded-sm bg-graphite-3">
                  <span className={`absolute inset-y-0 left-0 rounded-sm ${s.blocker ? "bg-clay/70" : "bg-indigo/80"}`} style={{ width: `${Math.max(s.reached ? 1.5 : 0, (s.reached / max) * 100)}%` }} />
                  {s.blocker && <span className="absolute inset-y-0 left-2 flex items-center truncate pr-2 text-[11px] text-ivory/90">⛔ {s.blocker}</span>}
                </span>
                <span className="text-right font-mono">{s.reached}{s.conversionFromPrev !== null ? <span className="text-mute"> · {formatPct(s.conversionFromPrev)}</span> : null}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11.5px] text-mute">Conversion = share of the previous stage that reached this one. Stage definitions on hover.</p>
        </Card>

        <Card className="p-5">
          <SectionTitle label="Autonomous engine · Phase 2" title="Make the agents move the funnel" />
          <EngineControls queued={prog.tasks.queued} />
          <p className="mt-3 text-[11.5px] text-mute">Plan creates account briefs for the best-fit accounts, 1:1 drafts for cleared contacts and next steps for open deals. Every output goes to your Approvals; nothing is sent or published.</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <SectionTitle label="Your inbox" title={`${prog.approvals.pending} waiting for you`} action={<Link href="/approvals" className="text-[12px] text-indigo-soft hover:underline">Open →</Link>} />
          <ul className="flex flex-col gap-1.5 text-[13px]">
            {Object.entries(prog.approvals.pendingByKind).map(([k, n]) => <li key={k} className="flex justify-between"><span className="text-niebla">{KIND[k] ?? k}</span><span className="font-mono">{n}</span></li>)}
          </ul>
          <div className="mt-3 border-t border-hair pt-3 text-[12px] text-mute">
            Oldest pending: {prog.approvals.oldestPending?.slice(0, 10) ?? "—"} · decided last 7 days: {prog.approvals.decidedLast7}{prog.approvals.medianHoursToDecide !== null ? ` · median ${prog.approvals.medianHoursToDecide.toFixed(1)} h to decide` : ""}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle label="Agent throughput" title="Tasks completed, last 14 days" />
          <div className="flex h-24 items-end gap-1">
            {prog.completedByDay.map((x) => <div key={x.day} className="flex-1" title={`${x.day}: ${x.count}`}><div className="rounded-t-sm bg-indigo/80" style={{ height: `${(x.count / maxDay) * 88}px`, minHeight: x.count ? 3 : 0 }} /></div>)}
          </div>
          <div className="mt-1 flex justify-between font-mono text-[10px] text-mute"><span>{prog.completedByDay[0]!.day.slice(5)}</span><span>{today.slice(5)}</span></div>
          <div className="mt-3 grid grid-cols-5 gap-1 text-center text-[11px]">
            {([["queued", prog.tasks.queued], ["working", prog.tasks.working], ["approval", prog.tasks.waitingApproval], ["error", prog.tasks.error], ["done", prog.tasks.completed]] as const).map(([l, n]) => <div key={l} className="rounded-md bg-graphite-3 py-1.5"><div className="font-mono text-[14px]">{n}</div><div className="text-mute">{l}</div></div>)}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle label="Engine" title="Runs and spend, last 14 days" />
          <div className="grid grid-cols-2 gap-3">
            <SimpleKpi label="Tasks run" value={String(prog.engine.tasksLast14)} />
            <SimpleKpi label="API spend" value={`USD ${(prog.engine.costLast14 / 1_000_000).toFixed(2)}`} sub="claude.ai runs bill your plan" />
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <SectionTitle label="Pilot · D-P07" title={gate.open ? "Clear contacts for the pilot (you decide who)" : "Pilot contacts — locked until D-P07 allows contact"} />
        <p className="mb-3 text-[12.5px] text-niebla">{gate.reason.replace(/\.$/, "")}. RISK-01's pilot conditions: people residing in Mexico, 1:1, sent by you; privacy notice and responsible party in place. Check the country before clearing.</p>
        {!candidates.length && !cleared.length ? <EmptyState title="No imported contacts" /> : (
          <div className="overflow-x-auto">
            <table className="px-table"><thead><tr><th>Contact</th><th>Role</th><th>Organization</th><th>HQ</th><th className="text-right">Fit</th><th>Status</th><th /></tr></thead>
              <tbody>
                {cleared.map(({ c, o }) => <tr key={c.id}><td><Link className="hover:underline" href={`/crm/contacts/${c.id}`}>{c.fullName}</Link></td><td className="text-niebla">{c.title}</td><td>{o.name}</td><td className="text-niebla">{o.country}</td><td className="text-right font-mono">{o.fitScore ?? "—"}</td><td><Badge tone="ok">cleared · {c.leadStatus}</Badge></td><td /></tr>)}
                {candidates.map(({ c, o }) => <tr key={c.id}><td><Link className="hover:underline" href={`/crm/contacts/${c.id}`}>{c.fullName}</Link></td><td className="text-niebla">{c.title}</td><td>{o.name}</td><td className="text-niebla">{o.country}</td><td className="text-right font-mono">{o.fitScore ?? "—"}</td><td><Badge>not assessed</Badge></td><td className="text-right"><ClearForPilotButton contactId={c.id} disabled={!gate.open} /></td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="mt-6 p-5">
        <SectionTitle label="Accounts" title="Where each account is, and its next step" />
        {!funnel.accounts.length ? <EmptyState title="No accounts yet" /> : (
          <div className="max-h-[560px] overflow-auto">
            <table className="px-table"><thead><tr><th>Account</th><th className="text-right">Fit</th><th>Stage</th><th className="text-right">Contacts</th><th>Next step</th></tr></thead>
              <tbody>{funnel.accounts.slice(0, 60).map((a) => <tr key={a.id}><td><Link className="hover:underline" href={`/crm/organizations/${a.id}`}>{a.name}</Link></td><td className="text-right font-mono">{a.fitScore ?? "—"}</td><td><Badge tone={a.stageIndex >= 5 ? "ok" : a.stageIndex >= 3 ? "indigo" : "neutral"}>{funnel.stages[a.stageIndex]!.label}</Badge></td><td className="text-right font-mono">{a.contacts}{a.cleared ? ` (${a.cleared} cleared)` : ""}</td><td className="text-[12.5px] text-niebla">{a.next}</td></tr>)}</tbody>
            </table>
            {funnel.accounts.length > 60 && <p className="mt-2 text-[11.5px] text-mute">Showing the 60 most advanced of {funnel.accounts.length} accounts.</p>}
          </div>
        )}
      </Card>
    </div>
  );
}
