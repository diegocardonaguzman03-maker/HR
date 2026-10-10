import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getContext } from "@/server/context";
import { invoices, organizations, payments } from "@/server/db/schema";
import { invoiceState } from "@/domain/finance";
import { formatMoney } from "@/domain/money";
import { Badge, Card, PageHeader, SectionTitle, Stat } from "@/components/ui/primitives";
import { InvoiceActions } from "./InvoiceActions";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, today } = await getContext();
  const [i] = await db.select().from(invoices).where(eq(invoices.id, id));
  if (!i) notFound();
  const [org] = await db.select().from(organizations).where(eq(organizations.id, i.organizationId));
  const pays = await db.select().from(payments).where(eq(payments.invoiceId, id)).orderBy(desc(payments.receivedOn));
  const st = invoiceState(i, pays, today);
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader label="Finance · Invoice" title={i.number}
        description={<>{org?.name} {i.contractId && <>· <Link href={`/finance/contracts/${i.contractId}`} className="text-indigo-soft hover:underline">contract</Link></>} · <Badge tone={st.derivedStatus === "paid" ? "ok" : st.derivedStatus === "overdue" ? "bad" : "neutral"}>{st.derivedStatus.replace("_", " ")}</Badge> {i.isDemo && <Badge tone="clay">Demo</Badge>}</>} />
      <Card className="mb-6 grid grid-cols-2 gap-5 p-5 md:grid-cols-5">
        <Stat label="Subtotal" value={formatMoney(i.subtotal, i.currency)} />
        <Stat label={`Tax ${Math.round(i.taxRate * 100)}%`} value={formatMoney(i.tax, i.currency)} />
        <Stat label="Total" value={formatMoney(i.total, i.currency)} />
        <Stat label="Paid" value={formatMoney(st.paid, i.currency)} />
        <Stat label="Balance" value={<span className={st.derivedStatus === "overdue" ? "text-bad" : ""}>{formatMoney(st.balance, i.currency)}</span>} sub={`due ${i.dueDate}`} />
      </Card>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-5">
          <SectionTitle label="Collections" title="Payments received" />
          {pays.length ? <table className="px-table"><thead><tr><th>Date</th><th>Method</th><th>Reference</th><th className="text-right">Amount</th></tr></thead><tbody>{pays.map((p) => <tr key={p.id}><td className="font-mono text-[12px]">{p.receivedOn}</td><td>{p.method}</td><td>{p.reference}</td><td className="text-right font-mono">{formatMoney(p.amount, p.currency)}</td></tr>)}</tbody></table> : <p className="text-[13px] text-mute">No payments recorded.</p>}
          {i.notes && <p className="mt-4 whitespace-pre-wrap text-[12.5px] text-niebla">{i.notes}</p>}
          {i.fxRate && i.reportingCurrency && i.currency !== i.reportingCurrency && <p className="mt-3 text-[12px] text-mute">FX snapshot at issue: 1 {i.currency} = {i.fxRate.toFixed(6)} {i.reportingCurrency} · {i.fxSource} · {i.fxRateDate}</p>}
        </Card>
        <Card className="h-fit p-5"><InvoiceActions invoice={{ id: i.id, status: i.status, currency: i.currency, balance: st.balance }} today={today} /></Card>
      </div>
    </div>
  );
}
