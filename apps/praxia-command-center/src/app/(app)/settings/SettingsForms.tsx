"use client";
import { useRouter } from "next/navigation";
import { useTransition, type FormEvent } from "react";
import { Badge, Button, Field, Input, Select } from "@/components/ui/primitives";
import { updateSettingsAction } from "@/app/actions/finance";
import { updateServiceAction, updateStageAction } from "@/app/actions/config";
import { parseMoneyInput } from "@/domain/money";
import { FIELD_LABELS } from "@/domain/pipeline";
import { toast } from "@/lib/ui-store";
import type { Currency } from "@/server/db/schema";

const m = (v: number | null) => (v === null ? "" : (v / 100).toFixed(2));
function useCall() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return { pending, call: (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) => start(async () => { const r = await fn(); if (r.ok) { toast.ok(ok); router.refresh(); } else toast.bad(r.error ?? "Failed"); }) };
}

type S = { companyName: string; reportingCurrency: Currency; openingCashAmount: number | null; openingCashCurrency: Currency | null; openingCashDate: string | null; monthlyRevenueTarget: number; monthlyRevenueTargetCurrency: Currency; targetBasis: "recognized" | "collected" | "contracted"; defaultTaxRate: number };
export function CompanySettingsForm({ settings: s, locked }: { settings: S; locked: boolean }) {
  const { pending, call } = useCall();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const cash = String(f.get("cash") ?? "").trim();
    const target = parseMoneyInput(String(f.get("target")));
    if (target === null) { toast.bad("Enter a valid goal amount."); return; }
    const cashAmt = cash ? parseMoneyInput(cash) : null;
    if (cash && cashAmt === null) { toast.bad("Enter a valid opening cash amount."); return; }
    call(() => updateSettingsAction({
      companyName: String(f.get("companyName")), reportingCurrency: String(f.get("reportingCurrency")) as Currency,
      openingCashAmount: cashAmt, openingCashCurrency: cash ? (String(f.get("cashCurrency")) as Currency) : null, openingCashDate: cash ? String(f.get("cashDate")) || null : null,
      monthlyRevenueTarget: target, monthlyRevenueTargetCurrency: String(f.get("targetCurrency")) as Currency, targetBasis: String(f.get("basis")) as "recognized", defaultTaxRate: Number(f.get("tax")) / 100,
    }), "Settings saved.");
  };
  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-3">
      <Field label="Company name"><Input name="companyName" defaultValue={s.companyName} /></Field>
      <Field label="Reporting currency" hint={locked ? "Locked: financial records already use it" : "Choose before recording transactions"}><Select name="reportingCurrency" defaultValue={s.reportingCurrency} disabled={locked}><option>USD</option><option>MXN</option></Select></Field>
      <Field label="Default tax rate %"><Input name="tax" type="number" min={0} max={50} defaultValue={Math.round(s.defaultTaxRate * 100)} /></Field>
      <Field label="Opening cash balance" hint="Real bank balance on the date below; leave empty if unknown"><Input name="cash" inputMode="decimal" defaultValue={m(s.openingCashAmount)} /></Field>
      <Field label="Cash currency"><Select name="cashCurrency" defaultValue={s.openingCashCurrency ?? s.reportingCurrency}><option>USD</option><option>MXN</option></Select></Field>
      <Field label="Balance date"><Input name="cashDate" type="date" defaultValue={s.openingCashDate ?? ""} /></Field>
      <Field label="Monthly revenue goal" hint="A target, not revenue"><Input name="target" inputMode="decimal" defaultValue={m(s.monthlyRevenueTarget)} /></Field>
      <Field label="Goal currency"><Select name="targetCurrency" defaultValue={s.monthlyRevenueTargetCurrency}><option>USD</option><option>MXN</option></Select></Field>
      <Field label="Goal measured on" hint="Open decision in the PRAXIA skill §16"><Select name="basis" defaultValue={s.targetBasis}><option value="recognized">Recognized revenue</option><option value="collected">Cash collected</option><option value="contracted">Contracted (bookings)</option></Select></Field>
      {locked && <input type="hidden" name="reportingCurrency" value={s.reportingCurrency} />}
      <div className="flex justify-end md:col-span-3"><Button variant="primary" disabled={pending} type="submit">Save settings</Button></div>
    </form>
  );
}

type Svc = { id: string; code: string; name: string; description: string; pricingModel: "fixed" | "milestone" | "retainer"; priceMin: number | null; priceMax: number | null; currency: Currency; typicalWeeks: string | null; pricingStatus: "proposed" | "validated"; active: boolean };
export function ServiceRow({ service: s }: { service: Svc }) {
  const { pending, call } = useCall();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const min = String(f.get("min")).trim(), max = String(f.get("max")).trim();
    call(() => updateServiceAction(s.id, {
      name: String(f.get("name")), description: String(f.get("description")), pricingModel: String(f.get("model")) as "fixed", priceMin: min ? parseMoneyInput(min) : null, priceMax: max ? parseMoneyInput(max) : null,
      currency: String(f.get("currency")) as Currency, typicalWeeks: String(f.get("weeks")) || null, pricingStatus: String(f.get("status")) as "proposed", active: f.get("active") === "on",
    }), `${s.code} saved.`);
  };
  return (
    <form onSubmit={onSubmit} className="grid gap-2 rounded-lg border border-hair p-3 md:grid-cols-[40px_1.3fr_2fr_110px_100px_100px_80px_110px_auto]">
      <div className="pt-2 font-mono text-indigo-soft">{s.code}</div>
      <Input name="name" defaultValue={s.name} aria-label="Name" />
      <Input name="description" defaultValue={s.description} aria-label="Description" />
      <Select name="model" defaultValue={s.pricingModel} aria-label="Pricing model"><option value="fixed">fixed</option><option value="milestone">milestone</option><option value="retainer">retainer</option></Select>
      <Input name="min" defaultValue={m(s.priceMin)} placeholder="min" aria-label="Minimum price" />
      <Input name="max" defaultValue={m(s.priceMax)} placeholder="max" aria-label="Maximum price" />
      <Select name="currency" defaultValue={s.currency} aria-label="Currency"><option>USD</option><option>MXN</option></Select>
      <Select name="status" defaultValue={s.pricingStatus} aria-label="Pricing status"><option value="proposed">proposed</option><option value="validated">validated</option></Select>
      <div className="flex items-center gap-2"><label className="flex items-center gap-1 text-[12px]"><input type="checkbox" name="active" defaultChecked={s.active} className="accent-indigo" />active</label><Button size="sm" disabled={pending} type="submit">Save</Button></div>
      <input type="hidden" name="weeks" value={s.typicalWeeks ?? ""} />
    </form>
  );
}

type St = { id: string; name: string; position: number; defaultProbability: number; kind: string; requiredFields: string[] };
export function StageRow({ stage: s }: { stage: St }) {
  const { pending, call } = useCall();
  return (
    <form className="grid items-center gap-2 md:grid-cols-[30px_1fr_110px_2fr_auto]" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); call(() => updateStageAction(s.id, { name: String(f.get("name")), defaultProbability: Number(f.get("p")) / 100 }), "Stage saved."); }}>
      <span className="font-mono text-[11px] text-mute">{s.position}</span>
      <Input name="name" defaultValue={s.name} aria-label="Stage name" />
      <div className="flex items-center gap-1"><Input name="p" type="number" min={0} max={100} defaultValue={Math.round(s.defaultProbability * 100)} disabled={s.kind !== "open"} aria-label="Default probability" /><span className="text-mute">%</span></div>
      <div className="flex flex-wrap gap-1">{s.requiredFields.map((r) => <Badge key={r}>{FIELD_LABELS[r] ?? r}</Badge>)}{s.kind !== "open" && <Badge tone={s.kind === "won" ? "ok" : "bad"}>{s.kind}{s.kind === "won" ? " · needs signed contract or accepted proposal" : ""}</Badge>}</div>
      <Button size="sm" disabled={pending} type="submit">Save</Button>
    </form>
  );
}
