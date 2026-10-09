import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { getContext } from "@/server/context";
import { agentTasks, contacts, contracts, opportunities, organizations, proposals, services } from "@/server/db/schema";
import { listActivities, listStages } from "@/server/services/crm";
import { crmOptions } from "@/server/queries";
import { formatMoney } from "@/domain/money";
import { FIELD_LABELS, probabilityOf } from "@/domain/pipeline";
import { Badge, Card, PageHeader, SectionTitle, Stat } from "@/components/ui/primitives";
import { ActivityForm } from "@/components/crm/forms";
import { Timeline } from "@/components/crm/Timeline";
import { AssignTask } from "@/components/agents/AssignTask";
import { StageControl } from "./StageControl";
import { CreateProposal, EditOpportunity } from "./OppClient";

export default async function OpportunityWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, includeDemo, today } = await getContext();
  const [o] = await db.select().from(opportunities).where(eq(opportunities.id, id));
  if (!o) notFound();
  const [[org], stages, opts, people, props, deals, acts, tasks] = await Promise.all([
    db.select().from(organizations).where(eq(organizations.id, o.organizationId)),
    listStages(db),
    crmOptions(db, includeDemo),
    db.select().from(contacts).where(eq(contacts.organizationId, o.organizationId)),
    db.select().from(proposals).where(eq(proposals.opportunityId, id)).orderBy(desc(proposals.version)),
    db.select().from(contracts).where(eq(contracts.opportunityId, id)),
    listActivities(db, { opportunityId: id }),
    db.select().from(agentTasks).where(and(eq(agentTasks.entityType, "opportunity"), eq(agentTasks.entityId, id))).orderBy(desc(agentTasks.createdAt)),
  ]);
  const stage = stages.find((s) => s.id === o.stageId)!;
  const [svc] = o.serviceId ? await db.select().from(services).where(eq(services.id, o.serviceId)) : [];
  const next = stages.find((s) => s.position === stage.position + 1 && s.kind === "open");
  const nextMissing = next ? next.requiredFields.filter((f) => { const v = (o as Record<string, unknown>)[f]; return v === null || v === undefined || v === ""; }) : [];

  return (
    <div className="mx-auto max-w-[1300px]">
      <PageHeader
        label={`Opportunity · ${org?.name ?? ""}`}
        title={o.title}
        description={<><Link href={`/crm/organizations/${o.organizationId}`} className="text-indigo-soft hover:underline">{org?.name}</Link> · owner {o.ownerAgentId ?? "founder"} {o.isDemo && <Badge tone="clay">Demo</Badge>}</>}
        actions={<>
          <AssignTask agents={opts.agents} defaultAgentId={o.ownerAgentId ?? "SAL-03"} entityType="opportunity" entityId={id} />
          <EditOpportunity initial={o} organizations={opts.organizations} contacts={opts.contacts} services={opts.services} agents={opts.agents} />
        </>}
      />
      <Card className="mb-6 p-5">
        <StageControl opportunityId={id} stageId={o.stageId} stages={stages} />
        {next && nextMissing.length > 0 && <p className="mt-3 text-[12px] text-mute">To move to <span className="text-ivory">{next.name}</span> you still need: {nextMissing.map((m) => FIELD_LABELS[m] ?? m).join(", ")}.</p>}
        <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-5">
          <Stat label="Estimated value" value={o.amount ? formatMoney(o.amount, o.currency) : "—"} sub={o.currency} />
          <Stat label="Probability" value={`${Math.round(probabilityOf(o, stage) * 100)}%`} sub={o.probabilityOverride != null ? "override" : "stage default"} />
          <Stat label="Weighted" value={o.amount ? formatMoney(Math.round(o.amount * probabilityOf(o, stage)), o.currency) : "—"} sub="forecast" />
          <Stat label="Expected close" value={o.expectedCloseDate ?? "—"} />
          <Stat label="Next action" value={<span className={o.nextActionDate && o.nextActionDate < today ? "text-clay" : ""}>{o.nextActionDate ?? "—"}</span>} sub={o.nextAction ?? "not defined"} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <SectionTitle label="Problem → solution" title="Why this deal exists" />
            <div className="grid gap-5 md:grid-cols-2">
              <div><div className="px-label mb-1">Client problem</div><p className="whitespace-pre-wrap text-[13.5px]">{o.problemStatement || <span className="text-mute">Not captured yet — required to qualify.</span>}</p></div>
              <div><div className="px-label mb-1">Proposed solution · {svc ? `${svc.code} ${svc.name}` : "no service"}</div><p className="whitespace-pre-wrap text-[13.5px]">{o.proposedSolution || <span className="text-mute">Not defined.</span>}</p></div>
            </div>
            {o.risks && <div className="mt-4"><div className="px-label mb-1">Risks</div><p className="whitespace-pre-wrap text-[13px] text-niebla">{o.risks}</p></div>}
            {o.lostReason && <div className="mt-4"><div className="px-label mb-1 text-bad">Lost reason</div><p className="text-[13px]">{o.lostReason}</p></div>}
          </Card>
          <Card className="p-5">
            <SectionTitle label="Communications" title="Activity timeline" />
            <div className="mb-6 rounded-lg border border-hair p-4"><ActivityForm opportunityId={id} contacts={people.map((p) => ({ id: p.id, label: p.fullName }))} /></div>
            <Timeline items={acts} />
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <SectionTitle label="Commercial" title="Proposals" action={<CreateProposal opportunityId={id} />} />
            {props.length ? (
              <ul className="flex flex-col gap-2 text-[13px]">
                {props.map((p) => <li key={p.id} className="flex items-center justify-between gap-2"><Link className="hover:underline" href={`/proposals/${p.id}`}>v{p.version} · {p.title}</Link><Badge tone={p.status === "accepted" ? "ok" : p.status === "rejected" || p.status === "expired" ? "bad" : p.status === "internal_review" ? "warn" : "indigo"}>{p.status.replace("_", " ")}</Badge></li>)}
              </ul>
            ) : <p className="text-[13px] text-mute">No proposals yet.</p>}
            {deals.length > 0 && (
              <div className="mt-4 border-t border-hair pt-3">
                <div className="px-label mb-2">Contracts</div>
                {deals.map((c) => <div key={c.id} className="flex justify-between text-[13px]"><Link className="hover:underline" href={`/finance/contracts/${c.id}`}>{c.title}</Link><Badge tone={c.signedAt ? "ok" : "warn"}>{c.status.replace("_", " ")}</Badge></div>)}
              </div>
            )}
          </Card>
          <Card className="p-5">
            <SectionTitle label="Decision-makers" title="People" />
            <ul className="flex flex-col gap-2 text-[13px]">
              {people.map((p) => <li key={p.id}><Link href={`/crm/contacts/${p.id}`} className="hover:underline">{p.fullName}</Link>{p.id === o.primaryContactId && <Badge tone="indigo" className="ml-2">Primary</Badge>}<div className="text-mute">{p.title ?? "—"}</div></li>)}
              {!people.length && <li className="text-mute">No contacts at this organization.</li>}
            </ul>
          </Card>
          <Card className="p-5">
            <SectionTitle label="AI organization" title="Agent work on this deal" />
            {tasks.length ? tasks.map((t) => <div key={t.id} className="mb-2 text-[13px]"><span className="font-mono text-[11px] text-niebla">{t.agentId}</span> · {t.title} <Badge>{t.status.replace("_", " ")}</Badge></div>) : <p className="text-[13px] text-mute">No agent tasks linked yet.</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}
