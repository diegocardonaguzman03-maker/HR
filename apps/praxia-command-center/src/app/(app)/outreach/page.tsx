import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getContext } from "@/server/context";
import { activities, approvals, companySettings, suppressions } from "@/server/db/schema";
import { demoFilter } from "@/server/services/common";
import { outreachGate } from "@/server/services/funnel";
import { formatPct } from "@/domain/money";
import { Badge, Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { SimpleKpi } from "@/components/dashboard/Kpi";

export const metadata = { title: "Outreach" };

type Meta = { contactId?: string; organizationId?: string; recipient?: string; role?: string; sentAt?: string; channel?: string; erased?: boolean };

/** 1:1 outreach, founder-led: drafts by the engine, approval and sending by the founder, replies from logged interactions. */
export default async function OutreachPage() {
  const { db, includeDemo } = await getContext();
  const gate = await outreachGate(db);
  const notice = (await db.select({ v: companySettings.privacyNoticeVersion }).from(companySettings))[0]?.v ?? null;
  const suppressed = (await db.select({ id: suppressions.id }).from(suppressions)).length;
  const msgs = await db.select().from(approvals).where(and(eq(approvals.kind, "outbound_message"), demoFilter(approvals.isDemo, includeDemo))).orderBy(desc(approvals.createdAt));
  const meta = (a: (typeof msgs)[number]) => (a.meta ?? {}) as Meta;
  const sent = msgs.filter((a) => meta(a).sentAt);
  const ids = sent.map((a) => meta(a).contactId).filter((x): x is string => !!x);
  const acts = ids.length ? await db.select({ contactId: activities.contactId, direction: activities.direction, type: activities.type, occurredAt: activities.occurredAt }).from(activities).where(inArray(activities.contactId, ids)) : [];
  const replied = new Set(acts.filter((a) => a.direction === "inbound").map((a) => a.contactId));
  const met = new Set(acts.filter((a) => a.type === "meeting").map((a) => a.contactId));
  const pending = msgs.filter((a) => a.status === "pending").length;
  const approvedUnsent = msgs.filter((a) => a.status === "approved" && !meta(a).sentAt).length;
  const sentBack = msgs.filter((a) => a.status === "rejected").length;
  const repliedN = sent.filter((a) => replied.has(meta(a).contactId!)).length;

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader label="Outbound · founder-led 1:1" title="Outreach"
        description="The engine drafts one message per cleared contact; you approve, send it yourself (LinkedIn or email) and record it. Replies come from interactions you log. Nothing is sent automatically, and opens/clicks are not tracked." />

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <div className={`rounded-xl border p-4 text-[13px] ${gate.open ? "border-ok/40 bg-ok/5" : "border-warn/40 bg-warn/5"}`}><div className="font-mono text-[10px] tracking-[0.12em] text-mute uppercase">Contact policy (D-P07)</div><div className="mt-1">{gate.open ? "Open" : "Closed"} — {gate.reason}</div></div>
        <div className={`rounded-xl border p-4 text-[13px] ${notice ? "border-ok/40 bg-ok/5" : "border-warn/40 bg-warn/5"}`}><div className="font-mono text-[10px] tracking-[0.12em] text-mute uppercase">Privacy notice</div><div className="mt-1">{notice ? `v${notice} in force` : <>None — <Link className="text-indigo-soft hover:underline" href="/settings">record it in Settings</Link> before sending</>}</div></div>
        <div className="rounded-xl border border-hair p-4 text-[13px]"><div className="font-mono text-[10px] tracking-[0.12em] text-mute uppercase">Suppression list</div><div className="mt-1">{suppressed} hashed entr{suppressed === 1 ? "y" : "ies"}</div></div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-6">
        <SimpleKpi label="Drafts waiting" value={String(pending)} />
        <SimpleKpi label="Sent back" value={String(sentBack)} />
        <SimpleKpi label="Approved, to send" value={String(approvedUnsent)} />
        <SimpleKpi label="Sent" value={String(sent.length)} />
        <SimpleKpi label="Replied" value={String(repliedN)} sub={sent.length ? `reply rate ${formatPct(repliedN / sent.length)}` : "—"} />
        <SimpleKpi label="Meetings" value={String(sent.filter((a) => met.has(meta(a).contactId!)).length)} />
      </div>

      <Card className="p-5">
        <SectionTitle label="Messages" title="Every 1:1 message and where it stands" action={<Link href="/approvals#drafts" className="text-[12px] text-indigo-soft hover:underline">Review drafts →</Link>} />
        {!msgs.length ? <EmptyState title="No messages yet">{gate.open ? "Clear pilot contacts on Funnel & progress, plan work and run the engine." : "Drafting starts once D-P07 allows contact."}</EmptyState> : (
          <div className="overflow-x-auto">
            <table className="px-table"><thead><tr><th>Drafted</th><th>Recipient</th><th>Status</th><th>Sent</th><th>Reply</th></tr></thead>
              <tbody>{msgs.map((a) => { const m = meta(a); return (
                <tr key={a.id}>
                  <td className="font-mono text-[12px]">{a.createdAt.slice(0, 10)}</td>
                  <td>{m.erased ? <span className="text-mute">[erased]</span> : m.contactId ? <Link className="hover:underline" href={`/crm/contacts/${m.contactId}`}>{m.recipient}</Link> : m.recipient}{m.role ? <span className="text-niebla"> · {m.role}</span> : null}</td>
                  <td><Badge tone={a.status === "pending" ? "warn" : a.status === "approved" ? "ok" : "bad"}>{a.status === "rejected" ? "sent back" : a.status}</Badge></td>
                  <td className="font-mono text-[12px]">{m.sentAt ? `${m.sentAt} · ${m.channel}` : "—"}</td>
                  <td>{m.contactId && replied.has(m.contactId) ? <Badge tone="ok">replied</Badge> : "—"}</td>
                </tr>
              ); })}</tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
