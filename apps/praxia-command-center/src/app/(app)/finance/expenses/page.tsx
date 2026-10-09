import { Suspense } from "react";
import { desc, inArray } from "drizzle-orm";
import { getContext } from "@/server/context";
import { contracts, expenses } from "@/server/db/schema";
import { demoFilter, getSettings } from "@/server/services/common";
import { formatMoney } from "@/domain/money";
import { Badge, EmptyState, PageHeader } from "@/components/ui/primitives";
import { NewButton } from "@/components/crm/NewButton";
import { FinanceDisclaimer, FinanceTabs } from "@/components/finance/FinanceTabs";
import { ExpenseForm } from "./ExpenseForm";

export const metadata = { title: "Expenses" };

export default async function ExpensesPage() {
  const { db, includeDemo, today } = await getContext();
  const rows = await db.select().from(expenses).where(demoFilter(expenses.isDemo, includeDemo)).orderBy(desc(expenses.incurredOn));
  const cs = await db.select({ id: contracts.id, title: contracts.title }).from(contracts).where(inArray(contracts.status, ["signed", "active", "completed"]));
  const s = await getSettings(db);
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader label="Finance" title="Expenses" description="Actual expenses reduce cash and profit. Planned expenses only feed forecasts. Direct costs are linked to a contract; overhead is not."
        actions={<Suspense><NewButton label="Record expense" title="Record expense"><ExpenseForm contracts={cs.map((c) => ({ id: c.id, label: c.title }))} today={today} currency={s.reportingCurrency} /></NewButton></Suspense>} />
      <FinanceTabs active="expenses" />
      {!rows.length ? <EmptyState title="No expenses recorded">Record SaaS, AI/API usage, contractors, hosting, marketing and travel. Each keeps its original currency.</EmptyState> : (
        <div className="px-card overflow-x-auto">
          <table className="px-table">
            <thead><tr><th>Date</th><th>Vendor</th><th>Category</th><th>Type</th><th>Status</th><th className="text-right">Amount</th><th className="text-right">In {s.reportingCurrency}</th></tr></thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td className="font-mono text-[12px]">{e.incurredOn}</td>
                  <td>{e.vendor} {e.isDemo && <Badge tone="clay">Demo</Badge>}<div className="text-[12px] text-mute">{e.description}{e.recurrence !== "none" ? ` · ${e.recurrence}` : ""}</div></td>
                  <td>{e.category.replace("_", " ")}</td>
                  <td><Badge tone={e.costType === "direct" ? "indigo" : "neutral"}>{e.costType}</Badge></td>
                  <td><Badge tone={e.status === "planned" ? "violet" : "neutral"}>{e.status}</Badge></td>
                  <td className="text-right font-mono">{formatMoney(e.amount, e.currency)}</td>
                  <td className="text-right font-mono">{e.currency === s.reportingCurrency ? "—" : e.reportingAmount !== null ? formatMoney(e.reportingAmount, s.reportingCurrency) : <span className="text-warn">no FX rate</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <FinanceDisclaimer />
    </div>
  );
}
