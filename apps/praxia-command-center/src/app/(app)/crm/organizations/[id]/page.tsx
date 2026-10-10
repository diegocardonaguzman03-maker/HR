import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { getContext } from "@/server/context";
import { contacts, contracts, opportunities, organizations, pipelineStages } from "@/server/db/schema";
import { listActivities } from "@/server/services/crm";
import { formatMoney } from "@/domain/money";
import { Badge, Card, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { ActivityForm } from "@/components/crm/forms";
import { Timeline } from "@/components/crm/Timeline";
import { EditOrganization } from "./EditOrganization";

export default async function OrganizationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db } = await getContext();
  const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
  if (!org) notFound();
  const [people, opps, deals, acts, stages] = await Promise.all([
    db.select().from(contacts).where(eq(contacts.organizationId, id)),
    db.select().from(opportunities).where(eq(opportunities.organizationId, id)),
    db.select().from(contracts).where(eq(contracts.organizationId, id)),
    listActivities(db, { organizationId: id }),
    db.select().from(pipelineStages),
  ]);
  const stageName = new Map(stages.map((s) => [s.id, s.name]));
  return (
    <div className="mx-auto max-w-[1300px]">
      <PageHeader
        label={`CRM · Organization · ${org.lifecycle.replace("_", " ")}`}
        title={org.name}
        description={<>{[org.industry, org.country, org.sizeBand].filter(Boolean).join(" · ") || "No firmographics yet"} {org.isDemo && <Badge tone="clay">Demo</Badge>}</>}
        actions={<>
          {org.website && <a href={org.website} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 rounded-lg border border-hair px-3 py-1.5 text-[13px] hover:bg-graphite-3">Website <ExternalLink size={12} /></a>}
          {org.linkedinUrl && <a href={org.linkedinUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 rounded-lg border border-hair px-3 py-1.5 text-[13px] hover:bg-graphite-3">LinkedIn <ExternalLink size={12} /></a>}
          <EditOrganization org={org} />
        </>}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <SectionTitle label="Pipeline" title={`Opportunities (${opps.length})`} action={<Link href={`/crm?new=1`} className="text-[12px] text-niebla hover:text-ivory">+ New</Link>} />
            {opps.length ? (
              <table className="px-table"><tbody>
                {opps.map((o) => <tr key={o.id}><td><Link className="hover:underline" href={`/crm/opportunities/${o.id}`}>{o.title}</Link></td><td>{stageName.get(o.stageId)}</td><td className="text-right font-mono">{o.amount ? formatMoney(o.amount, o.currency) : "—"}</td></tr>)}
              </tbody></table>
            ) : <p className="text-[13px] text-mute">No opportunities.</p>}
            {deals.length > 0 && (
              <div className="mt-4">
                <div className="px-label mb-2">Contracts</div>
                {deals.map((c) => <div key={c.id} className="flex justify-between text-[13px]"><Link className="hover:underline" href={`/finance/contracts/${c.id}`}>{c.title}</Link><span className="font-mono">{c.status.replace("_", " ")} · {formatMoney(c.totalAmount, c.currency)}</span></div>)}
              </div>
            )}
          </Card>
          <Card className="p-5">
            <SectionTitle label="Activity" title="Timeline" />
            <div className="mb-6 rounded-lg border border-hair p-4"><ActivityForm organizationId={id} contacts={people.map((p) => ({ id: p.id, label: p.fullName }))} /></div>
            <Timeline items={acts} />
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <SectionTitle label="Decision-makers" title={`Contacts (${people.length})`} action={<Link href="/crm/contacts?new=1" className="text-[12px] text-niebla hover:text-ivory">+ New</Link>} />
            <ul className="flex flex-col gap-3">
              {people.map((p) => (
                <li key={p.id} className="text-[13px]">
                  <Link href={`/crm/contacts/${p.id}`} className="font-medium hover:underline">{p.fullName}</Link>
                  {p.doNotContact && <Badge tone="bad" className="ml-2">Do not contact</Badge>}
                  <div className="text-mute">{p.title ?? "—"} · {p.leadStatus}</div>
                </li>
              ))}
              {!people.length && <li className="text-[13px] text-mute">No contacts yet.</li>}
            </ul>
          </Card>
          <Card className="p-5 text-[13px]">
            <SectionTitle label="Provenance" title="Source of record" />
            <div>Source: {org.source}</div>
            <div className="text-mute">{org.sourceRetrievedAt ? `Retrieved ${org.sourceRetrievedAt.slice(0, 10)}` : "Entered manually"}</div>
            {org.notes && <p className="mt-3 whitespace-pre-wrap text-niebla">{org.notes}</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}
