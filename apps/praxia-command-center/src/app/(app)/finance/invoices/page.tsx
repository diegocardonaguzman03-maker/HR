import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getContext } from "@/server/context";
import { invoices, organizations, payments } from "@/server/db/schema";
import { demoFilter } from "@/server/services/common";
import { invoiceState } from "@/domain/finance";
import { formatMoney } from "@/domain/money";
import { Badge, ButtonLink, EmptyState, PageHeader } from "@/components/ui/primitives";
import { FinanceDisclaimer, FinanceTabs } from "@/components/finance/FinanceTabs";

export const metadata = { title: "Invoices" };
const TONE = { paid: "ok", overdue: "bad", partially_paid: "warn", issued: "indigo", draft: "neutral", void: "neutral" } as const;

export default async function InvoicesPage() {
  const { db, includeDemo, today } = await getContext();
  const rows = await db.select({ i: invoices, org: organizations.name }).from(invoices).leftJoin(organizations, eq(invoices.organizationId, organizations.id)).where(demoFilter(invoices.isDemo, includeDemo)).orderBy(desc(invoices.issueDate));
  const pays = await db.select().from(payments);
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader label="Finance" title="Invoices & collections" description="Draft → issued → paid. Payment state is derived from recorded payments; overdue is computed against the due date." actions={<ButtonLink variant="primary" href="/finance/invoices/new">New invoice</ButtonLink>} />
      <FinanceTabs active="invoices" />
      {!rows.length ? <EmptyState title="No invoices yet">Create an invoice against a signed contract (or a standalone one for a client).</EmptyState> : (
        <div className="px-card overflow-x-auto">
          <table className="px-table">
            <thead><tr><th>Number</th><th>Client</th><th>Issued</th><th>Due</th><th>Status</th><th className="text-right">Total</th><th className="text-right">Paid</th><th className="text-right">Balance</th></tr></thead>
            <tbody>
              {rows.map(({ i, org }) => { const st = invoiceState(i, pays, today); return (
                <tr key={i.id}>
                  <td><Link className="font-mono hover:underline" href={`/finance/invoices/${i.id}`}>{i.number}</Link> {i.isDemo && <Badge tone="clay">Demo</Badge>}</td>
                  <td>{org}</td><td className="font-mono text-[12px]">{i.issueDate}</td><td className="font-mono text-[12px]">{i.dueDate}</td>
                  <td><Badge tone={TONE[st.derivedStatus]}>{st.derivedStatus.replace("_", " ")}{st.daysOverdue ? ` · ${st.daysOverdue}d` : ""}</Badge></td>
                  <td className="text-right font-mono">{formatMoney(i.total, i.currency)}</td><td className="text-right font-mono">{formatMoney(st.paid, i.currency)}</td><td className="text-right font-mono">{formatMoney(st.balance, i.currency)}</td>
                </tr>); })}
            </tbody>
          </table>
        </div>
      )}
      <FinanceDisclaimer />
    </div>
  );
}
