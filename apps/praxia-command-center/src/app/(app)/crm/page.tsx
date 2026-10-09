import Link from "next/link";
import { Suspense } from "react";
import { asc } from "drizzle-orm";
import { getContext } from "@/server/context";
import { opportunities, organizations } from "@/server/db/schema";
import { demoFilter, getSettings } from "@/server/services/common";
import { listStages } from "@/server/services/crm";
import { crmOptions } from "@/server/queries";
import { probabilityOf } from "@/domain/pipeline";
import { formatMoney } from "@/domain/money";
import { Badge, EmptyState, PageHeader } from "@/components/ui/primitives";
import { PipelineBoard } from "@/components/crm/PipelineBoard";
import { NewButton } from "@/components/crm/NewButton";
import { OpportunityForm } from "@/components/crm/forms";
import { CrmTabs } from "@/components/crm/CrmTabs";

export const metadata = { title: "CRM pipeline" };

export default async function CrmPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { db, includeDemo, today } = await getContext();
  const { view } = await searchParams;
  const [stages, opts, settings] = await Promise.all([listStages(db), crmOptions(db, includeDemo), getSettings(db)]);
  const opps = await db.select().from(opportunities).where(demoFilter(opportunities.isDemo, includeDemo)).orderBy(asc(opportunities.expectedCloseDate));
  const orgs = new Map((await db.select({ id: organizations.id, name: organizations.name }).from(organizations)).map((o) => [o.id, o.name]));
  const stageById = new Map(stages.map((s) => [s.id, s]));
  const cards = opps.map((o) => ({
    id: o.id, title: o.title, organizationName: orgs.get(o.organizationId) ?? "—", stageId: o.stageId, amount: o.amount, currency: o.currency,
    probability: probabilityOf(o, stageById.get(o.stageId)!), nextAction: o.nextAction, nextActionDate: o.nextActionDate, ownerAgentId: o.ownerAgentId, isDemo: o.isDemo,
  }));

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        label="CRM"
        title="Commercial pipeline"
        description="Every card is a persistent opportunity record. Stage probabilities are configurable defaults (Settings), not predictions."
        actions={
          <Suspense>
            <NewButton label="New opportunity" title="New opportunity" description="Start from the client's economic problem." wide>
              <OpportunityForm organizations={opts.organizations} contacts={opts.contacts} services={opts.services} agents={opts.agents} stages={stages.filter((s) => s.kind === "open").map((s) => ({ id: s.id, label: s.name }))} />
            </NewButton>
          </Suspense>
        }
      />
      <CrmTabs active={view === "table" ? "table" : "pipeline"} />
      {!opts.organizations.length ? (
        <EmptyState title="No organizations yet" action={<Link className="text-indigo-soft hover:underline" href="/crm/organizations?new=1">Add your first target organization →</Link>}>
          Opportunities belong to an organization. Add a target account first, then create the opportunity from the client's problem.
        </EmptyState>
      ) : view === "table" ? (
        <div className="px-card overflow-x-auto">
          <table className="px-table">
            <thead><tr><th>Organization</th><th>Opportunity</th><th>Stage</th><th className="text-right">Value</th><th className="text-right">Prob.</th><th>Expected close</th><th>Next action</th><th>Owner</th></tr></thead>
            <tbody>
              {cards.length === 0 && <tr><td colSpan={8} className="text-mute">No opportunities yet.</td></tr>}
              {cards.map((c) => (
                <tr key={c.id}>
                  <td>{c.organizationName} {c.isDemo && <Badge tone="clay">Demo</Badge>}</td>
                  <td><Link href={`/crm/opportunities/${c.id}`} className="hover:underline">{c.title}</Link></td>
                  <td>{stageById.get(c.stageId)?.name}</td>
                  <td className="text-right font-mono tabular-nums">{c.amount ? formatMoney(c.amount, c.currency) : "—"}</td>
                  <td className="text-right font-mono">{Math.round(c.probability * 100)}%</td>
                  <td className="font-mono text-[12px]">{opps.find((o) => o.id === c.id)?.expectedCloseDate ?? "—"}</td>
                  <td className={c.nextActionDate && c.nextActionDate < today ? "text-clay" : ""}>{c.nextActionDate ? `${c.nextActionDate} · ` : ""}{c.nextAction ?? "—"}</td>
                  <td className="font-mono text-[12px]">{c.ownerAgentId ?? "founder"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <PipelineBoard stages={stages.map((s) => ({ id: s.id, name: s.name, kind: s.kind, defaultProbability: s.defaultProbability }))} cards={cards} today={today} reportingCurrency={settings.reportingCurrency} />
      )}
    </div>
  );
}
