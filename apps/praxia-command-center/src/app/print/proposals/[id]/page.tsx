import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getContext } from "@/server/context";
import { opportunities, organizations } from "@/server/db/schema";
import { getProposalWithLines } from "@/server/services/commercial";
import { formatMoney } from "@/domain/money";
import { AxisSymbol } from "@/components/shell/Logo";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

/** Print-ready proposal (browser "Save as PDF"). Ivory editorial layout per brand guidelines. */
export default async function PrintProposal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db } = await getContext();
  let data;
  try { data = await getProposalWithLines(db, id); } catch { notFound(); }
  const { proposal: p, lines, totals } = data;
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, p.opportunityId));
  const [org] = await db.select().from(organizations).where(eq(organizations.id, opp!.organizationId));
  const draft = !["approved", "sent", "negotiation", "accepted"].includes(p.status);
  return (
    <div className="min-h-dvh bg-[#e9e6df] py-10 print:bg-white print:py-0">
      <style>{`@page { size: letter; margin: 18mm; } @media print { .no-print { display: none } body { background: #fff } }`}</style>
      <div className="no-print mx-auto mb-4 flex max-w-[816px] items-center justify-between gap-4">
        <p className="text-[12px] text-graphite/70">Internal note (not printed): the payment and validity terms below are PROPOSED defaults from the PRAXIA skill §7.3 — validate with your accountant and lawyer before sending.</p>
        <PrintButton />
      </div>
      <article className="relative mx-auto max-w-[816px] bg-ivory px-16 py-14 text-graphite shadow-xl print:shadow-none">
        {(draft || p.isDemo) && <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[110px] font-bold tracking-widest text-graphite/5 -rotate-12">{p.isDemo ? "DEMO" : "DRAFT"}</div>}
        {p.isDemo && <div className="mb-6 rounded border border-clay px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-clay uppercase">Demonstration document — fictional client, not a real proposal</div>}
        <header className="mb-14 flex items-start justify-between">
          <div className="flex items-center gap-3"><AxisSymbol size={40} /><div><div className="font-display text-[22px] font-bold tracking-[-0.03em]">Praxia</div><div className="font-mono text-[8px] tracking-[0.22em] text-mute uppercase">Human &amp; AI Transformation Advisory</div></div></div>
          <div className="text-right font-mono text-[10px] tracking-[0.18em] text-mute uppercase">Prepared for · {org?.name}<br />Confidential · v{p.version}</div>
        </header>
        <div className="mb-2 font-mono text-[10px] tracking-[0.2em] text-indigo uppercase">Proposal</div>
        <h1 className="mb-6 font-display text-[34px] leading-tight font-semibold tracking-[-0.02em]">{p.title}</h1>
        {p.summary && <p className="mb-10 text-[14px] leading-relaxed whitespace-pre-wrap">{p.summary}</p>}
        <h2 className="mb-3 font-display text-[16px] font-semibold">Scope, deliverables and investment</h2>
        <table className="mb-6 w-full text-[13px]">
          <thead><tr className="bg-graphite text-ivory"><th className="px-3 py-2 text-left font-normal">Deliverable</th><th className="px-3 py-2 text-left font-normal">Milestone</th><th className="px-3 py-2 text-right font-normal">Qty</th><th className="px-3 py-2 text-right font-normal">Amount</th></tr></thead>
          <tbody>{lines.map((l) => <tr key={l.id} className="border-b border-[#E2DED6]"><td className="px-3 py-2">{l.description}</td><td className="px-3 py-2">{l.milestone ?? "—"}</td><td className="px-3 py-2 text-right">{l.quantity}</td><td className="px-3 py-2 text-right font-mono">{formatMoney(Math.round(l.quantity * l.unitPrice), p.currency)}</td></tr>)}</tbody>
          <tfoot className="font-mono">
            <tr><td colSpan={3} className="px-3 pt-3 text-right">Subtotal</td><td className="px-3 pt-3 text-right">{formatMoney(totals.subtotal, p.currency)}</td></tr>
            <tr><td colSpan={3} className="px-3 text-right">Tax ({Math.round(p.taxRate * 100)}%)</td><td className="px-3 text-right">{formatMoney(totals.tax, p.currency)}</td></tr>
            <tr className="font-bold"><td colSpan={3} className="px-3 pt-1 text-right">Total</td><td className="px-3 pt-1 text-right">{formatMoney(totals.total, p.currency)}</td></tr>
          </tfoot>
        </table>
        <p className="text-[12px] text-mute">Validity: {p.validUntil ? `until ${p.validUntil}` : "30 days from issue"}. Fees are tied to milestones (gates), not the calendar. Taxes as applicable. Change requests by signed agreement. This proposal is not a contract; terms are subject to a signed services agreement.</p>
        <footer className="mt-16 flex justify-between border-t border-[#E2DED6] pt-3 font-mono text-[9px] tracking-[0.2em] text-mute uppercase"><span>Praxia · Proposal · Confidential</span><span>Turn strategy into adoption.</span></footer>
      </article>
    </div>
  );
}
