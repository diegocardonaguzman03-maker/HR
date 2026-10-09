"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { createInvoiceAction } from "@/app/actions/finance";
import { formatMoney, parseMoneyInput } from "@/domain/money";
import { toast } from "@/lib/ui-store";
import type { Currency } from "@/server/db/schema";

type Opt = { id: string; label: string };
export function InvoiceForm({ organizations, contracts, defaults }: { organizations: Opt[]; contracts: (Opt & { organizationId: string; currency: Currency })[]; defaults: { contractId: string; organizationId: string; currency: Currency; taxRate: number; today: string } }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [org, setOrg] = useState(defaults.organizationId);
  const [contract, setContract] = useState(defaults.contractId);
  const [currency, setCurrency] = useState<Currency>(defaults.currency);
  const [subtotal, setSubtotal] = useState("");
  const [tax, setTax] = useState(String(Math.round(defaults.taxRate * 100)));
  const due = new Date(Date.parse(defaults.today) + 30 * 86_400_000).toISOString().slice(0, 10);
  const sub = parseMoneyInput(subtotal);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!sub) { toast.bad("Enter a valid subtotal."); return; }
    start(async () => {
      const r = await createInvoiceAction({ organizationId: org, contractId: contract || null, issueDate: String(f.get("issueDate")), dueDate: String(f.get("dueDate")), currency, subtotal: sub, taxRate: Number(tax) / 100, notes: String(f.get("notes")) });
      if (r.ok) { toast.ok(`Draft ${r.value.number} created.`); router.push(`/finance/invoices/${r.value.id}`); } else toast.bad(r.error);
    });
  };
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Client *"><Select value={org} onChange={(e) => { setOrg(e.target.value); setContract(""); }} required><option value="">Select…</option>{organizations.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}</Select></Field>
      <Field label="Contract" hint="Recommended — keeps billing within the contract value"><Select value={contract} onChange={(e) => { setContract(e.target.value); const c = contracts.find((x) => x.id === e.target.value); if (c) setCurrency(c.currency); }}><option value="">— standalone —</option>{contracts.filter((c) => !org || c.organizationId === org).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</Select></Field>
      <Field label="Issue date"><Input type="date" name="issueDate" defaultValue={defaults.today} required /></Field>
      <Field label="Due date"><Input type="date" name="dueDate" defaultValue={due} required /></Field>
      <Field label="Currency"><Select value={currency} disabled={!!contract} onChange={(e) => setCurrency(e.target.value as Currency)}><option>USD</option><option>MXN</option></Select></Field>
      <Field label="Tax rate %"><Input type="number" min={0} max={50} value={tax} onChange={(e) => setTax(e.target.value)} /></Field>
      <Field label="Subtotal (pre-tax) *" className="sm:col-span-2"><Input value={subtotal} onChange={(e) => setSubtotal(e.target.value)} inputMode="decimal" required placeholder="6,000.00" /></Field>
      <div className="font-mono text-[12.5px] text-niebla sm:col-span-2">{sub ? `Tax ${formatMoney(Math.round(sub * Number(tax) / 100), currency)} · Total ${formatMoney(sub + Math.round(sub * Number(tax) / 100), currency)}` : "—"}</div>
      <Field label="Notes / concept" className="sm:col-span-2"><Textarea name="notes" placeholder="e.g. Milestone 1 — kickoff (50%)" /></Field>
      <div className="flex justify-end sm:col-span-2"><Button variant="primary" type="submit" disabled={pending}>Create draft invoice</Button></div>
    </form>
  );
}
