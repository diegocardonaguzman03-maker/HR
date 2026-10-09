import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getContext } from "@/server/context";
import { approvals } from "@/server/db/schema";
import { demoFilter } from "@/server/services/common";
import { Badge, Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { ApprovalButtons } from "./ApprovalButtons";

export const metadata = { title: "Approvals" };

export default async function ApprovalsPage() {
  const { db, includeDemo } = await getContext();
  const all = await db.select().from(approvals).where(demoFilter(approvals.isDemo, includeDemo)).orderBy(desc(approvals.createdAt));
  const pending = all.filter((a) => a.status === "pending");
  const href = (a: (typeof all)[number]) => (a.entityType === "proposal" ? `/proposals/${a.entityId}` : "#");
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader label="Governance" title="Approvals" description="Only the founder decides. Pricing, outbound messages, contracts and agent outputs that leave the company wait here. Every decision is written to the audit log." />
      <Card className="mb-6 p-5">
        <SectionTitle label="Pending" title={`${pending.length} waiting for you`} />
        {!pending.length ? <EmptyState title="Nothing pending">Submit a proposal's pricing for approval from the proposal editor.</EmptyState> : (
          <ul className="flex flex-col gap-3">
            {pending.map((a) => (
              <li key={a.id} className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-hair p-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex gap-2"><Badge tone="warn">{a.kind.replace("_", " ")}</Badge>{a.isDemo && <Badge tone="clay">Demo</Badge>}<span className="font-mono text-[11px] text-mute">requested by {a.requestedBy} · {a.createdAt.slice(0, 10)}</span></div>
                  <Link href={href(a)} className="font-medium hover:underline">{a.title}</Link>
                  <p className="mt-1 text-[13px] text-niebla">{a.detail}</p>
                </div>
                <ApprovalButtons id={a.id} />
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="p-5">
        <SectionTitle label="History" title="Decided" />
        <table className="px-table"><thead><tr><th>Decided</th><th>Item</th><th>Decision</th><th>Note</th></tr></thead>
          <tbody>{all.filter((a) => a.status !== "pending").map((a) => <tr key={a.id}><td className="font-mono text-[12px]">{a.decidedAt?.slice(0, 10)}</td><td><Link className="hover:underline" href={href(a)}>{a.title}</Link></td><td><Badge tone={a.status === "approved" ? "ok" : "bad"}>{a.status}</Badge></td><td className="text-niebla">{a.decisionNote}</td></tr>)}</tbody>
        </table>
      </Card>
    </div>
  );
}
