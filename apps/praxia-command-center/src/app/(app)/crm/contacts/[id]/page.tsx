import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { getContext } from "@/server/context";
import { contacts, organizations } from "@/server/db/schema";
import { listActivities } from "@/server/services/crm";
import { crmOptions } from "@/server/queries";
import { Badge, Card, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { ActivityForm } from "@/components/crm/forms";
import { Timeline } from "@/components/crm/Timeline";
import { EditContact } from "./EditContact";

export default async function ContactDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, includeDemo } = await getContext();
  const [c] = await db.select().from(contacts).where(eq(contacts.id, id));
  if (!c) notFound();
  const [org] = c.organizationId ? await db.select().from(organizations).where(eq(organizations.id, c.organizationId)) : [];
  const acts = await listActivities(db, { contactId: id });
  const opts = await crmOptions(db, includeDemo);
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        label={`CRM · Contact · ${c.leadStatus}`}
        title={c.fullName}
        description={<>{c.title ?? "No title"}{org && <> at <Link className="text-[#a9a1ff] hover:underline" href={`/crm/organizations/${org.id}`}>{org.name}</Link></>} {c.isDemo && <Badge tone="clay">Demo</Badge>} {c.doNotContact && <Badge tone="bad">Do not contact</Badge>}</>}
        actions={<>
          {c.linkedinUrl && <a href={c.linkedinUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 rounded-lg border border-hair px-3 py-1.5 text-[13px] hover:bg-graphite-3">Open LinkedIn profile <ExternalLink size={12} /></a>}
          <EditContact contact={c} organizations={opts.organizations} />
        </>}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-5">
          <SectionTitle label="Engagement" title="Interaction history" />
          {c.doNotContact ? (
            <p className="mb-5 rounded-lg border border-bad/40 bg-bad/10 p-3 text-[13px]">This contact is on the suppression list. Outbound activity cannot be recorded or prepared.</p>
          ) : (
            <div className="mb-6 rounded-lg border border-hair p-4">
              <p className="mb-3 text-[12px] text-niebla">LinkedIn-assisted workflow (manual): open the profile, send your approved message yourself on LinkedIn, then record it here as <em>linkedin · outbound</em>. Record replies as <em>inbound</em>. Automated LinkedIn messaging is not used.</p>
              <ActivityForm contactId={id} organizationId={c.organizationId ?? undefined} />
            </div>
          )}
          <Timeline items={acts} />
        </Card>
        <Card className="h-fit p-5 text-[13px]">
          <SectionTitle label="Record" title="Details" />
          <dl className="grid grid-cols-[110px_1fr] gap-y-2">
            <dt className="text-mute">Email</dt><dd>{c.email ?? "—"}</dd>
            <dt className="text-mute">Verification</dt><dd>{c.emailStatus}</dd>
            <dt className="text-mute">Geography</dt><dd>{c.geography ?? "—"}</dd>
            <dt className="text-mute">Lawful basis</dt><dd>{c.lawfulBasis.replace("_", " ")}</dd>
            <dt className="text-mute">Source</dt><dd>{c.source}{c.sourceRetrievedAt ? ` · ${c.sourceRetrievedAt.slice(0, 10)}` : ""}</dd>
            <dt className="text-mute">Owner</dt><dd>{c.ownerAgentId ?? "founder"}</dd>
          </dl>
          {c.notes && <p className="mt-4 whitespace-pre-wrap text-niebla">{c.notes}</p>}
        </Card>
      </div>
    </div>
  );
}
