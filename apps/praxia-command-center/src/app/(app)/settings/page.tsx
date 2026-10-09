import { asc } from "drizzle-orm";
import { getContext } from "@/server/context";
import { pipelineStages, services } from "@/server/db/schema";
import { getSettings } from "@/server/services/common";
import { reportingCurrencyLocked } from "@/server/services/finance";
import { Card, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { CompanySettingsForm, ServiceRow, StageRow } from "./SettingsForms";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { db } = await getContext();
  const [s, locked, svcs, stages] = await Promise.all([getSettings(db), reportingCurrencyLocked(db), db.select().from(services).orderBy(asc(services.code)), db.select().from(pipelineStages).orderBy(asc(pipelineStages.position))]);
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader label="Configuration" title="Settings" description="Business assumptions live here as editable configuration — never as historical results. Every change is written to the audit log." />
      <div className="flex flex-col gap-6">
        <Card className="p-5"><SectionTitle label="Company & finance" title="Reporting, cash and goal" /><CompanySettingsForm settings={s} locked={locked} /></Card>
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
