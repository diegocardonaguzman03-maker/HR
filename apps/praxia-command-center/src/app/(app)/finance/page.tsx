import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { getContext } from "@/server/context";
import { contracts, invoices, organizations, revenueEntries, expenses } from "@/server/db/schema";
import { demoFilter } from "@/server/services/common";
import { loadFinanceInput } from "@/server/services/dashboard";
import { computeFinanceMetrics } from "@/domain/finance";
import { formatMoney } from "@/domain/money";
import type { PeriodKey } from "@/domain/period";
import { Badge, Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { KpiCard } from "@/components/dashboard/Kpi";
import { FinanceDisclaimer, FinanceTabs } from "@/components/finance/FinanceTabs";

export const metadata = { title: "Finance" };

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const { db, includeDemo, today } = await getContext();
  const sp = await searchParams;
  const periodKey = (["mtd", "qtd", "ytd", "all"].includes(sp.period ?? "") ? sp.period : "ytd") as PeriodKey;
  const input = await loadFinanceInput(db, includeDemo, periodKey, today);
  const m = computeFinanceMetrics(input);
  const R = input.settings.reportingCurrency;
  const rows = await db.select({ c: contracts, org: organizations.name }).from(contracts).leftJoin(organizations, eq(contracts.organizationId, organizations.id)).where(demoFilter(contracts.isDemo, includeDemo)).orderBy(desc(contracts.createdAt));
  const recognized = new Map((await db.select({ id: revenueEntries.contractId, s: sql<number>`sum(${revenueEntries.amount})` }).from(revenueEntries).groupBy(revenueEntries.contractId)).map((r) => [r.id, r.s]));
  const invoiced = new Map((await db.select({ id: invoices.contractId, s: sql<number>`sum(${invoices.subtotal})` }).from(invoices).where(sql`${invoices.status} != 'void'`).groupBy(invoices.contractId)).map((r) => [r.id, r.s]));
  const direct = new Map((await db.select({ id: expenses.contractId, s: sql<number>`sum(${expenses.reportingAmount})` }).from(expenses).where(sql`${expenses.costType} = 'direct' and ${expenses.status} = 'actual'`).groupBy(expenses.contractId)).map((r) => [r.id, r.s]));

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader label={`Finance · ${input.period.label}`} title="Financial command center" description={`Bookings, recognized revenue, invoices and cash are tracked separately. Reporting currency ${R}; originals are kept in their own currency.`}
        actions={<nav className="flex rounded-lg border border-hair p-0.5">{(["mtd", "qtd", "ytd", "all"] as const).map((k) => <Link key={k} href={`/finance?period=${k}`} className={`rounded-md px-3 py-1 font-mono text-[11px] ${k === periodKey ? "bg-graphite-3 text-ivory" : "text-niebla"}`}>{k.toUpperCase()}</Link>)}</nav>} />
      <FinanceTabs active="overview" />
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Bookings" metric={m.bookings} currency={R} emphasis="indigo" />
        <KpiCard label="Recognized revenue" metric={m.recognizedRevenue} currency={R} />
        <KpiCard label="Invoiced (pre-tax)" metric={m.invoicedSubtotal} currency={R} />
        <KpiCard label="Collected" metric={m.collected} currency={R} emphasis="clay" />
        <KpiCard label="Receivables" metric={m.accountsReceivable} currency={R} />
        <KpiCard label="Overdue" metric={m.overdueReceivables} currency={R} />
        <KpiCard label="Direct costs" metric={m.directCosts} currency={R} />
        <KpiCard label="Gross profit" metric={m.grossProfit} currency={R} />
        <KpiCard label="Operating expenses" metric={m.operatingExpenses} currency={R} />
        <KpiCard label="Operating profit" metric={m.operatingProfit} currency={R} />
        <KpiCard label="Cash balance" metric={m.cashBalance} currency={R} />
        <KpiCard label="Planned expenses · 30d" metric={m.plannedExpenses30} currency={R} />
      </div>
      <Card className="p-5">
        <SectionTitle label="Contracts" title="Bookings ledger" />
        {!rows.length ? (
          <EmptyState title="No contracts yet">Contracts are created when a client accepts a proposal (with evidence). They count as bookings only after the signature is recorded.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="px-table">
              <thead><tr><th>Contract</th><th>Client</th><th>Status</th><th>Signed</th><th className="text-right">Value</th><th className="text-right">Recognized</th><th className="text-right">Invoiced</th><th className="text-right">Direct cost ({R})</th></tr></thead>
              <tbody>
                {rows.map(({ c, org }) => (
                  <tr key={c.id}>
                    <td><Link href={`/finance/contracts/${c.id}`} className="hover:underline">{c.title}</Link> {c.isDemo && <Badge tone="clay">Demo</Badge>}<div className="text-[11.5px] text-mute">{c.kind}</div></td>
                    <td>{org}</td>
                    <td><Badge tone={c.signedAt ? "ok" : "warn"}>{c.status.replace("_", " ")}</Badge></td>
                    <td className="font-mono text-[12px]">{c.signedAt ?? "—"}</td>
                    <td className="text-right font-mono">{formatMoney(c.totalAmount, c.currency)}</td>
                    <td className="text-right font-mono">{formatMoney(recognized.get(c.id) ?? 0, c.currency)}</td>
                    <td className="text-right font-mono">{formatMoney(invoiced.get(c.id) ?? 0, c.currency)}</td>
                    <td className="text-right font-mono">{formatMoney(direct.get(c.id) ?? 0, R)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <FinanceDisclaimer />
    </div>
  );
}
