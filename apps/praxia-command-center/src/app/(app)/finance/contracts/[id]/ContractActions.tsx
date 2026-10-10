"use client";
import { useRouter } from "next/navigation";
import { useTransition, type FormEvent } from "react";
import { Button, Field, Input, Select } from "@/components/ui/primitives";
import { contractStatusAction, recognizeRevenueAction, signContractAction } from "@/app/actions/commercial";
import { formatMoney, parseMoneyInput } from "@/domain/money";
import { askConfirm, askText } from "@/lib/dialog";
import { toast } from "@/lib/ui-store";
import type { Currency } from "@/server/db/schema";

type C = { id: string; status: string; kind: string; currency: Currency; totalAmount: number; monthlyAmount: number | null; signedAt: string | null };

export function ContractActions({ contract: c, remaining, today }: { contract: C; remaining: number; today: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const call = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string, form?: HTMLFormElement) =>
    start(async () => { const r = await fn(); if (r.ok) { toast.ok(ok); form?.reset(); router.refresh(); } else toast.bad(r.error ?? "Failed"); });

  if (c.status === "pending_signature") {
    const onSign = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const monthly = String(f.get("monthly") ?? "");
      call(() => signContractAction(c.id, {
        signedAt: String(f.get("signedAt")), evidence: String(f.get("evidence")), startDate: String(f.get("startDate") || "") || null, endDate: String(f.get("endDate") || "") || null,
        monthlyAmount: monthly ? parseMoneyInput(monthly) : null,
      }), "Signature recorded. Contract booked and opportunity moved to Closed Won.");
    };
    return (
      <form onSubmit={onSign} className="flex flex-col gap-3">
        <p className="text-[12.5px] text-niebla">Not a booking yet. Record the signature only when you hold the countersigned contract or a verified e-signature.</p>
        <Field label="Signed on"><Input type="date" name="signedAt" defaultValue={today} max={today} required /></Field>
        <Field label="Signature evidence *" hint="File reference, e-signature envelope id…"><Input name="evidence" required minLength={4} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Start"><Input type="date" name="startDate" /></Field>
          <Field label="End"><Input type="date" name="endDate" /></Field>
        </div>
        {c.kind === "retainer" && <Field label={`Monthly amount (${c.currency}) *`} hint={`Contract value ${(c.totalAmount / 100).toFixed(2)} must equal monthly × committed months. Start date required.`}><Input name="monthly" required defaultValue={c.monthlyAmount ? (c.monthlyAmount / 100).toFixed(2) : ""} /></Field>}
        <Button variant="human" type="submit" disabled={pending}>Record signature</Button>
      </form>
    );
  }

  const onRecognize = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const amount = parseMoneyInput(String(f.get("amount")));
    if (!amount) { toast.bad("Enter a valid amount."); return; }
    call(() => recognizeRevenueAction(c.id, { recognizedOn: String(f.get("date")), amount, basis: String(f.get("basis")) as "milestone", description: String(f.get("description")) }), "Revenue recognized.", form);
  };
  return (
    <div className="flex flex-col gap-5">
      {["signed", "active", "completed"].includes(c.status) && remaining > 0 && (
        <form onSubmit={onRecognize} className="flex flex-col gap-3 rounded-lg border border-hair p-3">
          <div className="px-label">Recognize revenue · {formatMoney(remaining, c.currency)} remaining</div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Date"><Input type="date" name="date" defaultValue={today} required /></Field>
            <Field label={`Amount ${c.currency}`}><Input name="amount" required inputMode="decimal" /></Field>
          </div>
          <Field label="Basis"><Select name="basis"><option value="milestone">Milestone delivered</option><option value="retainer_month">Retainer month served</option><option value="manual">Manual</option></Select></Field>
          <Field label="Description"><Input name="description" placeholder="e.g. Diagnostic readout delivered" /></Field>
          <Button type="submit" disabled={pending}>Recognize</Button>
        </form>
      )}
      <div className="flex flex-wrap gap-2">
        {c.status === "signed" && <Button size="sm" disabled={pending} onClick={() => call(() => contractStatusAction(c.id, "active"), "Contract active.")}>Mark active</Button>}
        {["signed", "active"].includes(c.status) && <Button size="sm" disabled={pending} onClick={() => call(() => contractStatusAction(c.id, "completed"), "Contract completed.")}>Mark completed</Button>}
        {["signed", "active"].includes(c.status) && <Button size="sm" variant="danger" disabled={pending} onClick={async () => (await askConfirm({ title: "Terminate this contract?", confirmLabel: "Terminate", danger: true })) && call(() => contractStatusAction(c.id, "terminated"), "Contract terminated.")}>Terminate</Button>}
      </div>
    </div>
  );
}
