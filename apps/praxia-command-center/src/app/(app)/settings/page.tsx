import { asc } from "drizzle-orm";
import { getContext } from "@/server/context";
import Link from "next/link";
import { pipelineStages, services, suppressions } from "@/server/db/schema";
import { retentionCandidates } from "@/server/services/privacy";
import { getSettings } from "@/server/services/common";
import { reportingCurrencyLocked } from "@/server/services/finance";
import { Card, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { CompanySettingsForm, ServiceRow, StageRow } from "./SettingsForms";
import { PrivacyNoticeForm } from "./PrivacySettings";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { db, today } = await getContext();
  const retention = await retentionCandidates(db, today);
  const suppressed = (await db.select({ id: suppressions.id }).from(suppressions)).length;
  const [s, locked, svcs, stages] = await Promise.all([getSettings(db), reportingCurrencyLocked(db), db.select().from(services).orderBy(asc(services.code)), db.select().from(pipelineStages).orderBy(asc(pipelineStages.position))]);
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader label="Configuration" title="Settings" description="Business assumptions live here as editable configuration — never as historical results. Every change is written to the audit log." />
      <div className="flex flex-col gap-6">
        <Card className="p-5"><SectionTitle label="Company & finance" title="Reporting, cash and goal" /><CompanySettingsForm settings={s} locked={locked} /></Card>
        <Card className="p-5">
          <SectionTitle label="Privacy (RISK-01)" title="Privacy notice, suppression and retention" />
          <p className="mb-4 text-[12.5px] text-mute">No outbound message can be recorded as sent until a privacy notice is on record. RISK-01 also requires a responsible party (legal name, address, privacy email) and a lawyer&apos;s review under the LFPDPPP before the first contact.{s.privacyNoticeVersion ? ` In force: v${s.privacyNoticeVersion}.` : " None recorded yet."}</p>
          <PrivacyNoticeForm version={s.privacyNoticeVersion} url={s.privacyNoticeUrl} />
          <div className="mt-4 grid gap-3 text-[13px] md:grid-cols-2">
            <div className="rounded-lg border border-hair p-3"><div className="font-mono text-[10px] tracking-[0.12em] text-mute uppercase">Suppression list</div><div className="mt-1">{suppressed} hashed entr{suppressed === 1 ? "y" : "ies"} (email, domain or person) · opt-outs and erasures add to it automatically</div></div>
            <div className="rounded-lg border border-hair p-3"><div className="font-mono text-[10px] tracking-[0.12em] text-mute uppercase">Retention review (12 months without interaction)</div>
              {retention.length ? <ul className="mt-1">{retention.slice(0, 10).map((c) => <li key={c.id}><Link className="hover:underline" href={`/crm/contacts/${c.id}`}>{c.fullName}</Link> · retain until {c.retainUntil}</li>)}</ul> : <div className="mt-1 text-niebla">Nobody is past retention.</div>}
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle label="Commercial offerings" title="Service definitions (PRD §2.4)" />
          <p className="mb-4 text-[12.5px] text-mute">Names follow the PRD. Decision D-P02 (naming vs the PRAXIA skill catalogue) is still open. Prices are exploratory until marked validated.</p>
          <div className="flex flex-col gap-3">{svcs.map((x) => <ServiceRow key={x.id} service={x} />)}</div>
        </Card>
        <Card className="p-5">
          <SectionTitle label="Pipeline" title="Stages & default probabilities" />
          <p className="mb-4 text-[12.5px] text-mute">Default probabilities are assumptions used for the weighted forecast. Required fields per stage are enforced on every move.</p>
          <div className="flex flex-col gap-2">{stages.map((x) => <StageRow key={x.id} stage={x} />)}</div>
        </Card>
      </div>
    </div>
  );
}
