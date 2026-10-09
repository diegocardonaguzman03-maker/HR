import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getContext } from "@/server/context";
import { approvals, contracts, opportunities, organizations, services } from "@/server/db/schema";
import { getProposalWithLines, MARGIN_TARGET } from "@/server/services/commercial";
import { Badge, PageHeader } from "@/components/ui/primitives";
import { ProposalEditor } from "./ProposalEditor";

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, today } = await getContext();
  let data;
  try { data = await getProposalWithLines(db, id); } catch { notFound(); }
  const { proposal: p, lines, totals } = data;
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, p.opportunityId));
  const [org] = await db.select().from(organizations).where(eq(organizations.id, opp!.organizationId));
  const svcs = await db.select({ id: services.id, label: services.name, priceMin: services.priceMin, priceMax: services.priceMax, currency: services.currency }).from(services).orderBy(asc(services.code));
  const history = await db.select().from(approvals).where(eq(approvals.entityId, id));
  const [contract] = await db.select().from(contracts).where(eq(contracts.proposalId, id));
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        label={`Proposal v${p.version} · ${org?.name}`}
        title={p.title}
        description={<>For <Link href={`/crm/opportunities/${opp!.id}`} className="text-[#a9a1ff] hover:underline">{opp!.title}</Link> · status <Badge tone={p.status === "accepted" ? "ok" : p.status === "internal_review" ? "warn" : "indigo"}>{p.status.replace("_", " ")}</Badge> {p.isDemo && <Badge tone="clay">Demo</Badge>}</>}
        actions={<Link href={`/print/proposals/${id}`} target="_blank" className="inline-flex items-center rounded-lg border border-hair px-3 py-1.5 text-[13px] hover:bg-graphite-3">Print / save as PDF</Link>}
      />
      <ProposalEditor
        proposal={p}
        lines={lines}
        totals={totals}
        marginTarget={MARGIN_TARGET}
        services={svcs}
        today={today}
        approvals={history.map((a) => ({ id: a.id, status: a.status, createdAt: a.createdAt, decidedAt: a.decidedAt, decisionNote: a.decisionNote }))}
        contractId={contract?.id ?? null}
      />
    </div>
  );
}
