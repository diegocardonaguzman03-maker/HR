import Link from "next/link";
import { eq, inArray } from "drizzle-orm";
import { getContext } from "@/server/context";
import { contracts, expenses, organizations, revenueEntries } from "@/server/db/schema";
import { demoFilter, getSettings } from "@/server/services/common";
import { formatMoney, formatPct } from "@/domain/money";
import { Badge, EmptyState, PageHeader } from "@/components/ui/primitives";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const { db, includeDemo } = await getContext();
  const s = await getSettings(db);
  const rows = await db.select({ c: contracts, org: organizations.name }).from(contracts).leftJoin(organizations, eq(contracts.organizationId, organizations.id))
    .where(demoFilter(contracts.isDemo, includeDemo));
  const delivered = rows.filter(({ c }) => ["signed", "active", "completed"].includes(c.status));
  const ids = delivered.map(({ c }) => c.id);
  const revs = ids.length ? await db.select().from(revenueEntries).where(inArray(revenueEntries.contractId, ids)) : [];
  const costs = ids.length ? await db.select().from(expenses).where(inArray(expenses.contractId, ids)) : [];
  return (
    <div className="mx-auto max-w-[1300px]">
      <PageHeader label="Client delivery" title="Projects" description="Phase 1 tracks delivery economics per signed contract: recognized revenue, direct costs and margin. Milestones, tasks, risks and client workspaces arrive in Phase 2." />
      {!delivered.length ? <EmptyState title="No projects in delivery">A project appears here when a contract signature is recorded.</EmptyState> : (
        <div className="px-card overflow-x-auto">
          <table className="px-table">
            <thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Period</th><th className="text-right">Value</th><th className="text-right">Recognized</th><th className="text-right">Direct cost ({s.reportingCurrency})</th><th className="text-right">Margin</th></tr></thead>
            <tbody>
              {delivered.map(({ c, org }) => {
                const rec = revs.filter((r) => r.contractId === c.id);
                const recR = rec.reduce((a, r) => a + (r.currency === s.reportingCurrency ? r.amount : (r.reportingAmount ?? 0)), 0);
                const missing = rec.some((r) => r.currency !== s.reportingCurrency && r.reportingAmount === null) || costs.some((e) => e.contractId === c.id && e.currency !== s.reportingCurrency && e.reportingAmount === null);
                const cost = costs.filter((e) => e.contractId === c.id && e.status === "actual").reduce((a, e) => a + (e.currency === s.reportingCurrency ? e.amount : (e.reportingAmount ?? 0)), 0);
                return (
                  <tr key={c.id}>
                    <td><Link href={`/finance/contracts/${c.id}`} className="hover:underline">{c.title}</Link> {c.isDemo && <Badge tone="clay">Demo</Badge>}<div className="text-[12px] text-mute">{c.kind}</div></td>
                    <td>{org}</td><td><Badge tone={c.status === "completed" ? "ok" : "indigo"}>{c.status}</Badge></td>
                    <td className="font-mono text-[12px]">{c.startDate ?? "?"} → {c.endDate ?? "?"}</td>
                    <td className="text-right font-mono">{formatMoney(c.totalAmount, c.currency)}</td>
                    <td className="text-right font-mono">{formatMoney(rec.reduce((a, r) => a + r.amount, 0), c.currency)}</td>
                    <td className="text-right font-mono">{formatMoney(cost, s.reportingCurrency)}</td>
                    <td className="text-right font-mono">{missing ? <span className="text-warn" title="Some records have no FX rate">n/a</span> : formatPct(recR ? (recR - cost) / recR : null)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
