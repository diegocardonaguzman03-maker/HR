import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { getContext } from "@/server/context";
import { contracts, expenses, invoices, organizations, payments, revenueEntries } from "@/server/db/schema";
import { invoiceState } from "@/domain/finance";
import { formatMoney, formatPct } from "@/domain/money";
import { getSettings } from "@/server/services/common";
import { Badge, ButtonLink, Card, PageHeader, SectionTitle, Stat } from "@/components/ui/primitives";
import { ContractActions } from "./ContractActions";

export default async function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, today } = await getContext();
  const [c] = await db.select().from(contracts).where(eq(contracts.id, id));
  if (!c) notFound();
  const [[org], revs, invs, costs, settings] = await Promise.all([
    db.select().from(organizations).where(eq(organizations.id, c.organizationId)),
    db.select().from(revenueEntries).where(eq(revenueEntries.contractId, id)).orderBy(desc(revenueEntries.recognizedOn)),
    db.select().from(invoices).where(eq(invoices.contractId, id)).orderBy(desc(invoices.issueDate)),
    db.select().from(expenses).where(and(eq(expenses.contractId, id), eq(expenses.status, "actual"))),
    getSettings(db),
  ]);
  const pays = invs.length ? await db.select().from(payments) : [];
  const recognized = revs.reduce((s, r) => s + r.amount, 0);
  const invoiced = invs.filter((i) => i.status !== "void").reduce((s, i) => s + i.subtotal, 0);
  const sameCcyCost = costs.filter((e) => e.currency === c.currency).reduce((s, e) => s + e.amount, 0);
  const otherCcy = costs.filter((e) => e.currency !== c.currency).length;
  const margin = recognized ? (recognized - sameCcyCost) / recognized : null;
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader label={`Contract · ${c.kind}`} title={c.title}
        description={<><Link href={`/crm/organizations/${c.organizationId}`} className="text-indigo-soft hover:underline">{org?.name}</Link> · <Badge tone={c.signedAt ? "ok" : "warn"}>{c.status.replace("_", " ")}</Badge> {c.isDemo && <Badge tone="clay">Demo</Badge>}</>}
        actions={c.signedAt && ["signed", "active"].includes(c.status) ? <ButtonLink variant="primary" href={`/finance/invoices/new?contractId=${c.id}`}>New invoice</ButtonLink> : undefined} />
      <Card className="mb-6 grid grid-cols-2 gap-5 p-5 md:grid-cols-5">
        <Stat label="Contract value" value={formatMoney(c.totalAmount, c.currency)} sub={c.kind === "retainer" && c.monthlyAmount ? `${formatMoney(c.monthlyAmount, c.currency)} / month` : undefined} />
        <Stat label="Recognized" value={formatMoney(recognized, c.currency)} sub={`${formatPct(c.totalAmount ? recognized / c.totalAmount : null)} of value`} />
        <Stat label="Invoiced" value={formatMoney(invoiced, c.currency)} />
        <Stat label="Direct costs" value={formatMoney(sameCcyCost, c.currency)} sub={otherCcy ? `+${otherCcy} in other currency` : undefined} />
        <Stat label="Project margin" value={formatPct(margin)} sub="recognized − direct costs" />
      </Card>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <SectionTitle label="Revenue" title="Recognition schedule" />
            {revs.length ? <table className="px-table"><thead><tr><th>Date</th><th>Basis</th><th>Description</th><th className="text-right">Amount</th></tr></thead><tbody>{revs.map((r) => <tr key={r.id}><td className="font-mono text-[12px]">{r.recognizedOn}</td><td>{r.basis.replace("_", " ")}</td><td>{r.description}</td><td className="text-right font-mono">{formatMoney(r.amount, r.currency)}</td></tr>)}</tbody></table> : <p className="text-[13px] text-mute">No revenue recognized yet. Recognize revenue when a milestone is delivered or a retainer month is served.</p>}
          </Card>
          <Card className="p-5">
            <SectionTitle label="Billing" title="Invoices" />
            {invs.length ? (
              <table className="px-table"><thead><tr><th>Number</th><th>Issued</th><th>Due</th><th>Status</th><th className="text-right">Total</th><th className="text-right">Balance</th></tr></thead><tbody>
                {invs.map((i) => { const st = invoiceState(i, pays, today); return <tr key={i.id}><td><Link href={`/finance/invoices/${i.id}`} className="hover:underline">{i.number}</Link></td><td className="font-mono text-[12px]">{i.issueDate}</td><td className="font-mono text-[12px]">{i.dueDate}</td><td><Badge tone={st.derivedStatus === "paid" ? "ok" : st.derivedStatus === "overdue" ? "bad" : "neutral"}>{st.derivedStatus.replace("_", " ")}</Badge></td><td className="text-right font-mono">{formatMoney(i.total, i.currency)}</td><td className="text-right font-mono">{formatMoney(st.balance, i.currency)}</td></tr>; })}
              </tbody></table>
            ) : <p className="text-[13px] text-mute">No invoices yet.</p>}
          </Card>
        </div>
        <Card className="h-fit p-5">
          <SectionTitle label="Lifecycle" title="Signature & status" />
          <ContractActions contract={{ id: c.id, status: c.status, kind: c.kind, currency: c.currency, totalAmount: c.totalAmount, monthlyAmount: c.monthlyAmount, signedAt: c.signedAt }} remaining={c.totalAmount - recognized} today={today} />
          {c.signatureEvidence && <p className="mt-4 text-[12px] text-niebla">Signature evidence: {c.signatureEvidence} · signed {c.signedAt}</p>}
          {c.fxRate && c.currency !== settings.reportingCurrency && <p className="mt-2 text-[12px] text-mute">FX snapshot: 1 {c.currency} = {c.fxRate.toFixed(6)} {c.reportingCurrency} ({c.fxSource}, {c.fxRateDate})</p>}
        </Card>
      </div>
    </div>
  );
}
