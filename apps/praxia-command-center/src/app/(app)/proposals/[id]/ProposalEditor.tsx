"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge, Button, Card, Field, Input, SectionTitle, Select, Stat, Textarea } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/Modal";
import { acceptProposalAction, markProposalSentAction, proposalOutcomeAction, saveProposalAction, submitProposalAction } from "@/app/actions/commercial";
import { formatMoney, formatPct, parseMoneyInput } from "@/domain/money";
import { proposalTotals } from "@/domain/finance";
import { toast } from "@/lib/ui-store";
import type { Currency, ProposalStatus } from "@/server/db/schema";

type Line = { serviceId: string | null; description: string; milestone: string | null; quantity: number; unitPrice: number; estimatedCost: number };
type Props = {
  proposal: { id: string; status: ProposalStatus; title: string; summary: string; currency: Currency; taxRate: number; validUntil: string | null; sentAt: string | null; acceptanceEvidence: string | null };
  lines: Line[];
  totals: ReturnType<typeof proposalTotals>;
  marginTarget: number;
  services: { id: string; label: string; priceMin: number | null; priceMax: number | null; currency: Currency }[];
  today: string;
  approvals: { id: string; status: string; createdAt: string; decidedAt: string | null; decisionNote: string | null }[];
  contractId: string | null;
};

const toInput = (minor: number) => (minor / 100).toFixed(2);

export function ProposalEditor({ proposal: p, lines: initial, marginTarget, services, today, approvals, contractId }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const editable = p.status === "draft" || p.status === "internal_review";
  const [rows, setRows] = useState(initial.map((l) => ({ ...l, price: toInput(l.unitPrice), cost: toInput(l.estimatedCost) })));
  const [meta, setMeta] = useState({ title: p.title, summary: p.summary, currency: p.currency, taxRate: String(Math.round(p.taxRate * 100)), validUntil: p.validUntil ?? "" });
  const [acceptOpen, setAcceptOpen] = useState(false);

  const parsed = rows.map((r) => ({ ...r, unitPrice: parseMoneyInput(r.price), estimatedCost: parseMoneyInput(r.cost || "0") }));
  const invalid = parsed.some((r) => r.unitPrice === null || r.estimatedCost === null || !r.description.trim() || !(r.quantity > 0));
  const totals = useMemo(() => proposalTotals(parsed.filter((r) => r.unitPrice !== null).map((r) => ({ quantity: r.quantity, unitPrice: r.unitPrice!, estimatedCost: r.estimatedCost ?? 0 })), Number(meta.taxRate) / 100, marginTarget), [parsed, meta.taxRate, marginTarget]);
  const cur = meta.currency;

  const call = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) =>
    start(async () => { const r = await fn(); if (r.ok) { toast.ok(ok); router.refresh(); } else toast.bad(r.error ?? "Failed"); });

  const save = () => {
    if (invalid) { toast.bad("Each line needs a description, quantity > 0 and valid amounts."); return; }
    call(() => saveProposalAction(p.id, {
      patch: { title: meta.title, summary: meta.summary, currency: meta.currency, taxRate: Number(meta.taxRate) / 100, validUntil: meta.validUntil || null },
      lines: parsed.map((r) => ({ serviceId: r.serviceId, description: r.description, milestone: r.milestone, quantity: r.quantity, unitPrice: r.unitPrice!, estimatedCost: r.estimatedCost ?? 0 })),
    }), p.status === "internal_review" ? "Saved. Proposal returned to draft — resubmit for approval." : "Proposal saved.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-6">
        <Card className="p-5">
          <SectionTitle label="Scope & pricing" title="Deliverables and milestones" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2"><Input value={meta.title} disabled={!editable} onChange={(e) => setMeta({ ...meta, title: e.target.value })} /></Field>
            <Field label="Executive summary (problem → value → approach)" className="sm:col-span-2"><Textarea value={meta.summary} disabled={!editable} onChange={(e) => setMeta({ ...meta, summary: e.target.value })} className="min-h-28" /></Field>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="px-table min-w-[720px]">
              <thead><tr><th>Deliverable</th><th>Milestone</th><th className="w-16">Qty</th><th className="w-32">Unit price</th><th className="w-32">Est. cost</th><th className="w-28 text-right">Line</th><th /></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <Input value={r.description} disabled={!editable} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
                      <Select className="mt-1 text-[12px]" value={r.serviceId ?? ""} disabled={!editable} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, serviceId: e.target.value || null } : x)))}>
                        <option value="">— service —</option>{services.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </Select>
                    </td>
                    <td><Input value={r.milestone ?? ""} disabled={!editable} placeholder="e.g. Kickoff" onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, milestone: e.target.value || null } : x)))} /></td>
                    <td><Input type="number" min={0} step="0.5" value={r.quantity} disabled={!editable} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, quantity: Number(e.target.value) } : x)))} /></td>
                    <td><Input inputMode="decimal" value={r.price} disabled={!editable} aria-invalid={parseMoneyInput(r.price) === null} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} /></td>
                    <td><Input inputMode="decimal" value={r.cost} disabled={!editable} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, cost: e.target.value } : x)))} /></td>
                    <td className="text-right font-mono tabular-nums">{parseMoneyInput(r.price) !== null ? formatMoney(Math.round(parseMoneyInput(r.price)! * r.quantity), cur) : "—"}</td>
                    <td>{editable && <button aria-label="Remove line" className="p-1 text-mute hover:text-bad" onClick={() => setRows(rows.filter((_, j) => j !== i))}><Trash2 size={14} /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {editable && <Button className="mt-3" size="sm" onClick={() => setRows([...rows, { serviceId: null, description: "", milestone: null, quantity: 1, unitPrice: 0, estimatedCost: 0, price: "0.00", cost: "0.00" }])}><Plus size={13} />Add line</Button>}
          <p className="mt-3 text-[11.5px] text-mute">Estimated cost = direct delivery cost for the line (associates, tools, travel). Service price ranges are exploratory: {services.filter((s) => s.priceMin).map((s) => `${s.label} ${formatMoney(s.priceMin, s.currency, { compact: true })}–${formatMoney(s.priceMax, s.currency, { compact: true })}`).join("; ") || "none set"}.</p>
        </Card>
        <Card className="p-5">
          <SectionTitle label="Terms" title="Commercial terms" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Currency"><Select value={meta.currency} disabled={!editable} onChange={(e) => setMeta({ ...meta, currency: e.target.value as Currency })}><option>USD</option><option>MXN</option></Select></Field>
            <Field label="Tax rate %" hint="e.g. 16% IVA in Mexico"><Input type="number" min={0} max={50} value={meta.taxRate} disabled={!editable} onChange={(e) => setMeta({ ...meta, taxRate: e.target.value })} /></Field>
            <Field label="Valid until"><Input type="date" value={meta.validUntil} disabled={!editable} onChange={(e) => setMeta({ ...meta, validUntil: e.target.value })} /></Field>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="p-5">
          <SectionTitle label="Economics" title="Price & margin" />
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Subtotal" value={formatMoney(totals.subtotal, cur)} />
            <Stat label="Total incl. tax" value={formatMoney(totals.total, cur)} />
            <Stat label="Est. direct cost" value={formatMoney(totals.cost, cur)} />
            <Stat label="Gross margin" value={<span className={totals.meetsMarginTarget ? "text-ok" : "text-clay"}>{formatPct(totals.grossMargin)}</span>} sub={`target ≥ ${formatPct(marginTarget)}`} />
          </div>
          <div className="mt-4 rounded-lg border border-hair p-3 text-[12.5px] text-niebla">
            Price floor at target margin: <span className="font-mono text-ivory">{totals.priceFloor !== null ? formatMoney(totals.priceFloor, cur) : "—"}</span>.
            {!totals.meetsMarginTarget && totals.subtotal > 0 && <span className="text-clay"> Below the margin target — the approval request will say so.</span>}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle label="Workflow" title="Status & approvals" />
          <ol className="mb-4 flex flex-wrap gap-1 font-mono text-[10px] uppercase">
            {["draft", "internal_review", "approved", "sent", "negotiation", "accepted"].map((s) => <li key={s} className={`rounded border px-1.5 py-0.5 ${p.status === s ? "border-indigo text-ivory" : "border-hair text-mute"}`}>{s.replace("_", " ")}</li>)}
          </ol>
          <div className="flex flex-col gap-2">
            {editable && <Button onClick={save} disabled={pending}>Save changes</Button>}
            {p.status === "draft" && <Button variant="primary" disabled={pending} onClick={() => call(() => submitProposalAction(p.id), "Submitted for founder approval (see Approvals).")}>Submit pricing for approval</Button>}
            {p.status === "internal_review" && <Link href="/approvals" className="rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-center text-[13px] text-warn">Waiting for your approval → Approvals</Link>}
            {p.status === "approved" && <Button variant="primary" disabled={pending} onClick={() => { const d = prompt("Date you sent it to the client (YYYY-MM-DD):", today); if (d) call(() => markProposalSentAction(p.id, d), "Recorded as sent."); }}>Record as sent (I sent it)</Button>}
            {p.status === "sent" && <Button disabled={pending} onClick={() => call(() => proposalOutcomeAction(p.id, "negotiation"), "Moved to negotiation.")}>Client is negotiating</Button>}
            {(p.status === "sent" || p.status === "negotiation") && <Button variant="human" disabled={pending} onClick={() => setAcceptOpen(true)}>Client accepted…</Button>}
            {(p.status === "sent" || p.status === "negotiation") && <Button variant="danger" disabled={pending} onClick={() => confirm("Mark this proposal as rejected by the client?") && call(() => proposalOutcomeAction(p.id, "rejected"), "Marked as rejected.")}>Client rejected</Button>}
            {["sent", "negotiation", "approved"].includes(p.status) && <Button variant="ghost" disabled={pending} onClick={() => call(() => proposalOutcomeAction(p.id, "expired"), "Marked as expired.")}>Mark expired</Button>}
            {contractId && <Link href={`/finance/contracts/${contractId}`} className="rounded-lg border border-ok/40 bg-ok/10 px-3 py-2 text-center text-[13px] text-ok">Contract created → record signature</Link>}
          </div>
          {p.acceptanceEvidence && <p className="mt-3 text-[12px] text-niebla">Acceptance evidence: {p.acceptanceEvidence}</p>}
          {approvals.length > 0 && (
            <div className="mt-4 border-t border-hair pt-3 text-[12px]">
              <div className="px-label mb-2">Approval history</div>
              {approvals.map((a) => <div key={a.id} className="mb-1"><Badge tone={a.status === "approved" ? "ok" : a.status === "rejected" ? "bad" : "warn"}>{a.status}</Badge> <span className="font-mono text-mute">{(a.decidedAt ?? a.createdAt).slice(0, 10)}</span> {a.decisionNote}</div>)}
            </div>
          )}
          <p className="mt-4 text-[11.5px] text-mute">The system never sends proposals or claims a deal is signed. You record what happened; acceptance needs evidence and creates a contract that is only booked once its signature is recorded.</p>
        </Card>
      </div>

      <Modal open={acceptOpen} onOpenChange={setAcceptOpen} title="Record client acceptance" description="Evidence is required: signed proposal reference, e-signature envelope id, purchase order number…">
        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); call(() => acceptProposalAction(p.id, String(f.get("date")), String(f.get("evidence"))), "Acceptance recorded. A contract awaiting signature was created."); setAcceptOpen(false); }}>
          <Field label="Accepted on"><Input type="date" name="date" defaultValue={today} required /></Field>
          <Field label="Evidence *"><Input name="evidence" required minLength={4} /></Field>
          <div className="flex justify-end"><Button variant="human" type="submit">Record acceptance</Button></div>
        </form>
      </Modal>
    </div>
  );
}
