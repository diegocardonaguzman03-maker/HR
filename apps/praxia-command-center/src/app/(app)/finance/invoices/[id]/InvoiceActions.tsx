"use client";
import { useRouter } from "next/navigation";
import { useTransition, type FormEvent } from "react";
import { Button, Field, Input, Select } from "@/components/ui/primitives";
import { issueInvoiceAction, recordPaymentAction, voidInvoiceAction } from "@/app/actions/finance";
import { formatMoney, parseMoneyInput } from "@/domain/money";
import { toast } from "@/lib/ui-store";
import type { Currency } from "@/server/db/schema";

export function InvoiceActions({ invoice: i, today }: { invoice: { id: string; status: string; currency: Currency; balance: number }; today: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const call = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string, form?: HTMLFormElement) => start(async () => { const r = await fn(); if (r.ok) { toast.ok(ok); form?.reset(); router.refresh(); } else toast.bad(r.error ?? "Failed"); });
  const onPay = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; const f = new FormData(form);
    const amount = parseMoneyInput(String(f.get("amount")));
    if (!amount) { toast.bad("Enter a valid amount."); return; }
    call(() => recordPaymentAction(i.id, { receivedOn: String(f.get("date")), amount, currency: i.currency, method: String(f.get("method")), reference: String(f.get("reference")) }), "Payment recorded.", form);
  };
  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>{i.status === "draft" ? "Draft — not yet issued" : i.status === "void" ? "Void" : "Issued"}</SectionLabel>
      {i.status === "draft" && <Button variant="primary" disabled={pending} onClick={() => call(() => issueInvoiceAction(i.id), "Invoice issued.")}>Issue invoice</Button>}
      {i.status === "issued" && i.balance > 0 && (
        <form onSubmit={onPay} className="flex flex-col gap-3 rounded-lg border border-hair p-3">
          <div className="px-label">Record payment received · balance {formatMoney(i.balance, i.currency)}</div>
          <Field label="Received on"><Input type="date" name="date" defaultValue={today} max={today} required /></Field>
          <Field label={`Amount (${i.currency})`}><Input name="amount" inputMode="decimal" defaultValue={(i.balance / 100).toFixed(2)} required /></Field>
          <Field label="Method"><Select name="method"><option value="transfer">Bank transfer</option><option value="card">Card</option><option value="check">Check</option><option value="other">Other</option></Select></Field>
          <Field label="Reference"><Input name="reference" placeholder="e.g. SPEI tracking key" /></Field>
          <Button variant="human" type="submit" disabled={pending}>Record payment</Button>
        </form>
      )}
      {i.status !== "void" && <Button variant="danger" size="sm" disabled={pending} onClick={() => { const r = prompt("Reason for voiding (recorded):"); if (r) call(() => voidInvoiceAction(i.id, r), "Invoice voided."); }}>Void invoice</Button>}
      <p className="text-[11.5px] text-mute">Only record cash you can see in the bank. Payments can't exceed the balance or differ from the invoice currency.</p>
    </div>
  );
}
function SectionLabel({ children }: { children: React.ReactNode }) { return <div className="px-label">{children}</div>; }
