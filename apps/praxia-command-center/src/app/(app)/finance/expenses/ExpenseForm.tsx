"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button, Field, Input, Select } from "@/components/ui/primitives";
import { createExpenseAction } from "@/app/actions/finance";
import { parseMoneyInput } from "@/domain/money";
import { toast } from "@/lib/ui-store";
import { useCloseModal } from "@/components/crm/NewButton";

const CATS = [["contractors", "Contractors / associates"], ["ai_api", "AI / API usage"], ["saas", "SaaS subscriptions"], ["hosting", "Hosting"], ["marketing", "Marketing"], ["travel", "Travel"], ["legal_accounting", "Legal & accounting"], ["office", "Office"], ["other", "Other"]];

export function ExpenseForm({ contracts, today, currency, onDone }: { contracts: { id: string; label: string }[]; today: string; currency: string; onDone?: () => void }) {
  const router = useRouter();
  const closeModal = useCloseModal();
  const [pending, start] = useTransition();
  const [costType, setCostType] = useState("overhead");
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const amount = parseMoneyInput(String(f.get("amount")));
    if (!amount) { toast.bad("Enter a valid amount."); return; }
    start(async () => {
      const r = await createExpenseAction({
        incurredOn: String(f.get("date")), vendor: String(f.get("vendor")), category: String(f.get("category")) as "other", description: String(f.get("description")),
        amount, currency: String(f.get("currency")) as "USD", costType: costType as "overhead", contractId: costType === "direct" ? String(f.get("contractId") || "") || null : null,
        recurrence: String(f.get("recurrence")) as "none", status: String(f.get("status")) as "actual",
      });
      if (r.ok) { toast.ok("Expense recorded."); (onDone ?? closeModal)?.(); router.refresh(); } else toast.bad(r.error);
    });
  };
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Date"><Input type="date" name="date" defaultValue={today} required /></Field>
      <Field label="Status"><Select name="status"><option value="actual">Actual (spent)</option><option value="planned">Planned (forecast only)</option></Select></Field>
      <Field label="Vendor *" className="sm:col-span-2"><Input name="vendor" required /></Field>
      <Field label="Category"><Select name="category">{CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field>
      <Field label="Recurrence"><Select name="recurrence"><option value="none">One-off</option><option value="monthly">Monthly</option><option value="annual">Annual</option></Select></Field>
      <Field label="Amount *"><Input name="amount" inputMode="decimal" required /></Field>
      <Field label="Currency"><Select name="currency" defaultValue={currency}><option>USD</option><option>MXN</option></Select></Field>
      <Field label="Cost type"><Select value={costType} onChange={(e) => setCostType(e.target.value)}><option value="overhead">Overhead (operating expense)</option><option value="direct">Direct delivery cost</option></Select></Field>
      {costType === "direct" ? <Field label="Contract *"><Select name="contractId" required><option value="">Select…</option>{contracts.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</Select></Field> : <div />}
      <Field label="Description" className="sm:col-span-2"><Input name="description" /></Field>
      <div className="flex justify-end sm:col-span-2"><Button variant="primary" type="submit" disabled={pending}>Record expense</Button></div>
    </form>
  );
}
