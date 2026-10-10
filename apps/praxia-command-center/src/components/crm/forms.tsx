"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { createContactAction, createOpportunityAction, createOrganizationAction, logActivityAction, updateContactAction, updateOpportunityAction, updateOrganizationAction } from "@/app/actions/crm";
import { parseMoneyInput } from "@/domain/money";
import { toast } from "@/lib/ui-store";
import { FIELD_LABELS } from "@/domain/pipeline";
import { useCloseModal } from "./NewButton";

type Opt = { id: string; label: string };
const val = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const orNull = (s: string) => (s ? s : null);

function useSubmit() {
  const closeModal = useCloseModal();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const submit = (fn: () => Promise<{ ok: boolean; error?: string; value?: unknown }>, onOk: (v: unknown) => void) =>
    start(async () => {
      setError(null);
      const r = await fn();
      if (r.ok) onOk(r.value);
      else { setError(r.error ?? "Failed"); toast.bad(r.error ?? "Failed"); }
    });
  return { pending, error, submit, closeModal };
}

function FormError({ error }: { error: string | null }) {
  return error ? <div role="alert" className="rounded-lg border border-bad/50 bg-bad/10 px-3 py-2 text-[13px] text-bad">{error}</div> : null;
}

// ───────────── Organization ─────────────

type OrgValues = { id?: string; name?: string; domain?: string | null; website?: string | null; industry?: string | null; country?: string | null; sizeBand?: string | null; revenueBand?: string | null; linkedinUrl?: string | null; notes?: string; lifecycle?: string; fitScore?: number | null };

export function OrganizationForm({ initial, onDone }: { initial?: OrgValues; onDone?: () => void }) {
  const router = useRouter();
  const { pending, error, submit, closeModal } = useSubmit();
  const done = () => (onDone ?? closeModal)?.();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      name: val(f, "name"), domain: orNull(val(f, "domain")) ?? undefined, website: val(f, "website") || undefined, industry: val(f, "industry") || undefined,
      country: val(f, "country") || undefined, sizeBand: val(f, "sizeBand") || undefined, revenueBand: val(f, "revenueBand") || undefined,
      linkedinUrl: val(f, "linkedinUrl") || undefined, notes: val(f, "notes"),
    };
    if (initial?.id) {
      const fit = val(f, "fitScore");
      submit(() => updateOrganizationAction(initial.id!, { ...data, lifecycle: val(f, "lifecycle"), fitScore: fit ? Number(fit) : null }), () => { toast.ok("Organization updated."); done(); router.refresh(); });
    } else {
      submit(() => createOrganizationAction(data), (v) => { toast.ok("Organization saved."); done(); router.push(`/crm/organizations/${(v as { id: string }).id}`); });
    }
  };
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Name *" className="sm:col-span-2"><Input name="name" required defaultValue={initial?.name} /></Field>
      <Field label="Website" hint="Used to detect duplicates by domain"><Input name="website" placeholder="https://" defaultValue={initial?.website ?? ""} /></Field>
      <Field label="Domain"><Input name="domain" placeholder="company.com" defaultValue={initial?.domain ?? ""} /></Field>
      <Field label="Industry"><Input name="industry" defaultValue={initial?.industry ?? ""} /></Field>
      <Field label="Country"><Input name="country" placeholder="MX, US, CO…" defaultValue={initial?.country ?? ""} /></Field>
      <Field label="Company size"><Input name="sizeBand" placeholder="e.g. 1,000–5,000" defaultValue={initial?.sizeBand ?? ""} /></Field>
      <Field label="Revenue band"><Input name="revenueBand" defaultValue={initial?.revenueBand ?? ""} /></Field>
      <Field label="LinkedIn company URL" className="sm:col-span-2"><Input name="linkedinUrl" placeholder="https://www.linkedin.com/company/…" defaultValue={initial?.linkedinUrl ?? ""} /></Field>
      {initial?.id && (
        <>
          <Field label="Lifecycle">
            <Select name="lifecycle" defaultValue={initial.lifecycle}>
              {["target", "prospect", "client", "former_client", "partner"].map((l) => <option key={l} value={l}>{l.replace("_", " ")}</option>)}
            </Select>
          </Field>
          <Field label="ICP fit (1–5)" hint="Your assessment, same scale as the research bases; no external scoring"><Input name="fitScore" type="number" min={1} max={5} defaultValue={initial.fitScore ?? ""} /></Field>
        </>
      )}
      <Field label="Notes" className="sm:col-span-2"><Textarea name="notes" defaultValue={initial?.notes ?? ""} /></Field>
      <div className="sm:col-span-2"><FormError error={error} /></div>
      <div className="flex justify-end gap-2 sm:col-span-2"><Button type="submit" variant="primary" disabled={pending}>{pending ? "Saving…" : "Save organization"}</Button></div>
    </form>
  );
}

// ───────────── Contact ─────────────

type ContactValues = { id?: string; organizationId?: string | null; fullName?: string; title?: string | null; email?: string | null; emailStatus?: string; linkedinUrl?: string | null; geography?: string | null; lawfulBasis?: string; leadStatus?: string; doNotContact?: boolean; notes?: string; source?: string };

export function ContactForm({ initial, organizations, onDone }: { initial?: ContactValues; organizations: Opt[]; onDone?: () => void }) {
  const router = useRouter();
  const { pending, error, submit, closeModal } = useSubmit();
  const done = () => (onDone ?? closeModal)?.();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      organizationId: orNull(val(f, "organizationId")), fullName: val(f, "fullName"), title: val(f, "title") || undefined, email: val(f, "email") || undefined,
      emailStatus: val(f, "emailStatus") as "unverified", linkedinUrl: val(f, "linkedinUrl") || undefined, geography: val(f, "geography") || undefined,
      lawfulBasis: val(f, "lawfulBasis") as "not_assessed", leadStatus: val(f, "leadStatus") as "new", doNotContact: f.get("doNotContact") === "on", notes: val(f, "notes"),
      source: val(f, "source") || "manual",
    };
    if (initial?.id) submit(() => updateContactAction(initial.id!, data), () => { toast.ok("Contact updated."); done(); router.refresh(); });
    else submit(() => createContactAction(data), (v) => { toast.ok("Contact saved."); done(); router.push(`/crm/contacts/${(v as { id: string }).id}`); });
  };
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name *"><Input name="fullName" required defaultValue={initial?.fullName} /></Field>
      <Field label="Job title"><Input name="title" defaultValue={initial?.title ?? ""} /></Field>
      <Field label="Organization" className="sm:col-span-2">
        <Select name="organizationId" defaultValue={initial?.organizationId ?? ""}>
          <option value="">— none —</option>
          {organizations.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </Select>
      </Field>
      <Field label="Business email"><Input name="email" type="email" defaultValue={initial?.email ?? ""} /></Field>
      <Field label="Email verification" hint="Verification provider not connected yet; set manually only if verified">
        <Select name="emailStatus" defaultValue={initial?.emailStatus ?? "unverified"}>
          {["unverified", "valid", "invalid", "risky", "unknown"].map((s) => <option key={s}>{s}</option>)}
        </Select>
      </Field>
      <Field label="LinkedIn profile URL" className="sm:col-span-2"><Input name="linkedinUrl" placeholder="https://www.linkedin.com/in/…" defaultValue={initial?.linkedinUrl ?? ""} /></Field>
      <Field label="Geography"><Input name="geography" defaultValue={initial?.geography ?? ""} /></Field>
      <Field label="Source" hint="Where this contact came from (provenance)"><Input name="source" defaultValue={initial?.source ?? "manual"} /></Field>
      <Field label="Lawful basis for contact">
        <Select name="lawfulBasis" defaultValue={initial?.lawfulBasis ?? "not_assessed"}>
          {[["not_assessed", "Not assessed"], ["legitimate_interest", "Legitimate interest"], ["consent", "Consent"], ["existing_relationship", "Existing relationship"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
      </Field>
      <Field label="Lead status">
        <Select name="leadStatus" defaultValue={initial?.leadStatus ?? "new"}>
          {["new", "researched", "contacted", "engaged", "qualified", "disqualified"].map((s) => <option key={s}>{s}</option>)}
        </Select>
      </Field>
      <label className="flex items-center gap-2 text-[13px] sm:col-span-2">
        <input type="checkbox" name="doNotContact" defaultChecked={initial?.doNotContact} className="accent-clay" /> Do not contact (suppression list — blocks outbound activity)
      </label>
      <Field label="Notes" className="sm:col-span-2"><Textarea name="notes" defaultValue={initial?.notes ?? ""} /></Field>
      <div className="sm:col-span-2"><FormError error={error} /></div>
      <div className="flex justify-end sm:col-span-2"><Button type="submit" variant="primary" disabled={pending}>{pending ? "Saving…" : "Save contact"}</Button></div>
    </form>
  );
}

// ───────────── Opportunity ─────────────

type OppValues = {
  id?: string; organizationId?: string; title?: string; primaryContactId?: string | null; serviceId?: string | null; stageId?: string; problemStatement?: string;
  proposedSolution?: string; amount?: number | null; currency?: string; probabilityOverride?: number | null; expectedCloseDate?: string | null;
  nextAction?: string | null; nextActionDate?: string | null; ownerAgentId?: string | null; risks?: string;
};

export function OpportunityForm({ initial, organizations, contacts, services, stages, agents, onDone }: { initial?: OppValues; organizations: Opt[]; contacts: (Opt & { organizationId: string | null })[]; services: Opt[]; stages?: Opt[]; agents: Opt[]; onDone?: () => void }) {
  const router = useRouter();
  const { pending, error, submit, closeModal } = useSubmit();
  const done = () => (onDone ?? closeModal)?.();
  const [orgId, setOrgId] = useState(initial?.organizationId ?? "");
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const amountRaw = val(f, "amount");
    const amount = amountRaw ? parseMoneyInput(amountRaw) : null;
    if (amountRaw && amount === null) { toast.bad("Estimated value is not a valid amount."); return; }
    const prob = val(f, "probabilityOverride");
    const data = {
      organizationId: val(f, "organizationId"), title: val(f, "title"), primaryContactId: orNull(val(f, "primaryContactId")), serviceId: orNull(val(f, "serviceId")),
      problemStatement: val(f, "problemStatement"), proposedSolution: val(f, "proposedSolution"), amount, currency: val(f, "currency") as "USD",
      probabilityOverride: prob ? Number(prob) / 100 : null, expectedCloseDate: orNull(val(f, "expectedCloseDate")), nextAction: val(f, "nextAction") || undefined,
      nextActionDate: orNull(val(f, "nextActionDate")), ownerAgentId: orNull(val(f, "ownerAgentId")), risks: val(f, "risks"),
    };
    if (initial?.id) {
      const { organizationId: _org, ...patch } = data; // organization cannot change after creation
      submit(() => updateOpportunityAction(initial.id!, patch), () => { toast.ok("Opportunity updated."); done(); router.refresh(); });
    }
    else submit(() => createOpportunityAction({ ...data, stageId: val(f, "stageId") || undefined }), (v) => { toast.ok("Opportunity created."); done(); router.push(`/crm/opportunities/${(v as { id: string }).id}`); });
  };
  const orgContacts = contacts.filter((c) => !orgId || c.organizationId === orgId);
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Title *" className="sm:col-span-2"><Input name="title" required defaultValue={initial?.title} placeholder="e.g. AI adoption diagnostic" /></Field>
      <Field label="Organization *">
        <Select name="organizationId" required value={orgId} onChange={(e) => setOrgId(e.target.value)} disabled={!!initial?.id}>
          <option value="">Select…</option>
          {organizations.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </Select>
      </Field>
      <Field label="Primary contact (decision-maker)">
        <Select name="primaryContactId" defaultValue={initial?.primaryContactId ?? ""}>
          <option value="">— none —</option>
          {orgContacts.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </Select>
      </Field>
      {!initial?.id && stages && (
        <Field label="Starting stage">
          <Select name="stageId" defaultValue="">{stages.map((s, i) => <option key={s.id} value={i === 0 ? "" : s.id}>{s.label}</option>)}</Select>
        </Field>
      )}
      <Field label="Service">
        <Select name="serviceId" defaultValue={initial?.serviceId ?? ""}>
          <option value="">— not defined —</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-[1fr_96px] gap-2">
        <Field label="Estimated value"><Input name="amount" inputMode="decimal" placeholder="12,000" defaultValue={initial?.amount ? (initial.amount / 100).toFixed(2) : ""} /></Field>
        <Field label="Currency"><Select name="currency" defaultValue={initial?.currency ?? "USD"}><option>USD</option><option>MXN</option></Select></Field>
      </div>
      <Field label="Probability override %" hint="Leave empty to use the stage default"><Input name="probabilityOverride" type="number" min={0} max={100} defaultValue={initial?.probabilityOverride != null ? Math.round(initial.probabilityOverride * 100) : ""} /></Field>
      <Field label="Expected close date"><Input name="expectedCloseDate" type="date" defaultValue={initial?.expectedCloseDate ?? ""} /></Field>
      <Field label="Responsible agent">
        <Select name="ownerAgentId" defaultValue={initial?.ownerAgentId ?? ""}>
          <option value="">— founder —</option>
          {agents.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
        </Select>
      </Field>
      <Field label="Next action"><Input name="nextAction" defaultValue={initial?.nextAction ?? ""} /></Field>
      <Field label="Next action date"><Input name="nextActionDate" type="date" defaultValue={initial?.nextActionDate ?? ""} /></Field>
      <Field label="Problem statement (client's economic problem)" className="sm:col-span-2"><Textarea name="problemStatement" defaultValue={initial?.problemStatement ?? ""} /></Field>
      <Field label="Proposed solution" className="sm:col-span-2"><Textarea name="proposedSolution" defaultValue={initial?.proposedSolution ?? ""} /></Field>
      <Field label="Risks" className="sm:col-span-2"><Textarea name="risks" defaultValue={initial?.risks ?? ""} className="min-h-14" /></Field>
      <div className="sm:col-span-2"><FormError error={error} /></div>
      <div className="flex justify-end sm:col-span-2"><Button type="submit" variant="primary" disabled={pending}>{pending ? "Saving…" : initial?.id ? "Save changes" : "Create opportunity"}</Button></div>
    </form>
  );
}

// ───────────── Activity log (manual record) ─────────────

export function ActivityForm({ organizationId, contactId, opportunityId, contacts }: { organizationId?: string; contactId?: string; opportunityId?: string; contacts?: Opt[] }) {
  const router = useRouter();
  const { pending, error, submit } = useSubmit();
  const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    submit(
      () => logActivityAction({
        type: val(f, "type") as "note", direction: val(f, "direction") as "internal", subject: val(f, "subject"), body: val(f, "body"),
        occurredAt: new Date(val(f, "occurredAt")).toISOString(), organizationId: organizationId ?? null, contactId: (val(f, "contactId") || contactId) ?? null, opportunityId: opportunityId ?? null,
      }),
      () => { toast.ok("Activity recorded."); form.reset(); router.refresh(); },
    );
  };
  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-4">
      <Field label="Type">
        <Select name="type" defaultValue="note">{["note", "call", "email", "linkedin", "meeting", "task"].map((t) => <option key={t}>{t}</option>)}</Select>
      </Field>
      <Field label="Direction">
        <Select name="direction" defaultValue="internal"><option value="internal">internal</option><option value="outbound">outbound (I sent)</option><option value="inbound">inbound (they replied)</option></Select>
      </Field>
      <Field label="When"><Input name="occurredAt" type="datetime-local" defaultValue={now} required /></Field>
      {contacts && contacts.length > 0 ? (
        <Field label="Contact"><Select name="contactId" defaultValue={contactId ?? ""}><option value="">—</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</Select></Field>
      ) : <div />}
      <Field label="Subject *" className="sm:col-span-4"><Input name="subject" required placeholder="e.g. Discovery call — agreed to share usage data" /></Field>
      <Field label="Details" className="sm:col-span-4"><Textarea name="body" className="min-h-14" /></Field>
      <p className="text-[11.5px] text-mute sm:col-span-3">This records something that already happened. The Command Center does not send messages on your behalf (no sending integration is connected).</p>
      <div className="flex justify-end"><Button type="submit" disabled={pending}>{pending ? "Saving…" : "Record activity"}</Button></div>
      <div className="sm:col-span-4"><FormError error={error} /></div>
    </form>
  );
}

export { FIELD_LABELS };
