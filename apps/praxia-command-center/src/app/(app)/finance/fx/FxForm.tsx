"use client";
import { useRouter } from "next/navigation";
import { useTransition, type FormEvent } from "react";
import { Button, Field, Input, Select } from "@/components/ui/primitives";
import { addFxRateAction, applyMissingSnapshotsAction } from "@/app/actions/finance";
import { toast } from "@/lib/ui-store";

export function FxForm({ today }: { today: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; const f = new FormData(form);
    start(async () => {
      const r = await addFxRateAction({ base: String(f.get("base")) as "USD", quote: String(f.get("quote")) as "MXN", rate: Number(f.get("rate")), source: String(f.get("source")), rateDate: String(f.get("date")) });
      if (r.ok) { toast.ok("Rate recorded."); form.reset(); router.refresh(); } else toast.bad(r.error);
    });
  };
  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
        <Field label="Base"><Select name="base"><option>USD</option><option>MXN</option></Select></Field>
        <Field label="Quote"><Select name="quote" defaultValue="MXN"><option>MXN</option><option>USD</option></Select></Field>
        <Field label="Rate" className="col-span-2" hint="Units of quote per 1 base"><Input name="rate" type="number" step="0.000001" min="0" required /></Field>
        <Field label="Rate date"><Input name="date" type="date" defaultValue={today} max={today} required /></Field>
        <Field label="Source *"><Input name="source" required placeholder="Banxico FIX" /></Field>
        <div className="col-span-2 flex justify-end"><Button variant="primary" type="submit" disabled={pending}>Add rate</Button></div>
      </form>
      <div className="border-t border-hair pt-4">
        <p className="mb-2 text-[12px] text-niebla">Fill FX snapshots for records that were saved before a rate existed. Original amounts and existing snapshots are never changed.</p>
        <Button disabled={pending} onClick={() => start(async () => { const r = await applyMissingSnapshotsAction(); if (r.ok) { toast.ok(`${r.value} record(s) updated.`); router.refresh(); } else toast.bad(r.error); })}>Apply to records missing FX</Button>
      </div>
    </div>
  );
}
