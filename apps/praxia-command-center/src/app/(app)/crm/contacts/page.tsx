import Link from "next/link";
import { Suspense } from "react";
import { asc, eq } from "drizzle-orm";
import { getContext } from "@/server/context";
import { contacts, organizations } from "@/server/db/schema";
import { demoFilter } from "@/server/services/common";
import { crmOptions } from "@/server/queries";
import { Badge, EmptyState, PageHeader } from "@/components/ui/primitives";
import { NewButton } from "@/components/crm/NewButton";
import { ContactForm } from "@/components/crm/forms";
import { CrmTabs } from "@/components/crm/CrmTabs";

export const metadata = { title: "Contacts" };

export default async function ContactsPage() {
  const { db, includeDemo } = await getContext();
  const opts = await crmOptions(db, includeDemo);
  const rows = await db
    .select({ c: contacts, orgName: organizations.name })
    .from(contacts)
    .leftJoin(organizations, eq(contacts.organizationId, organizations.id))
    .where(demoFilter(contacts.isDemo, includeDemo))
    .orderBy(asc(contacts.fullName));
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader label="CRM" title="Contacts & leads" description="People at target organizations. Each record keeps its source, lawful basis for contact and suppression status." actions={<Suspense><NewButton label="New contact" title="New contact" wide><ContactForm organizations={opts.organizations} /></NewButton></Suspense>} />
      <CrmTabs active="contacts" />
      {!rows.length ? (
        <EmptyState title="No contacts yet">Add decision-makers manually (name, title, LinkedIn URL, business email). Email discovery and verification through Hunter will be available once the integration is configured in Phase 2.</EmptyState>
      ) : (
        <div className="px-card overflow-x-auto">
          <table className="px-table">
            <thead><tr><th>Name</th><th>Organization</th><th>Lead status</th><th>Email</th><th>Lawful basis</th><th>Source</th></tr></thead>
            <tbody>
              {rows.map(({ c, orgName }) => (
                <tr key={c.id}>
                  <td><Link href={`/crm/contacts/${c.id}`} className="font-medium hover:underline">{c.fullName}</Link> {c.isDemo && <Badge tone="clay">Demo</Badge>} {c.doNotContact && <Badge tone="bad">DNC</Badge>}<div className="text-[12px] text-mute">{c.title}</div></td>
                  <td>{orgName ?? "—"}</td>
                  <td><Badge tone={c.leadStatus === "qualified" ? "ok" : c.leadStatus === "engaged" ? "indigo" : "neutral"}>{c.leadStatus}</Badge></td>
                  <td className="text-[12.5px]">{c.email ?? "—"} {c.email && <span className="text-mute">({c.emailStatus})</span>}</td>
                  <td className="text-[12px] text-niebla">{c.lawfulBasis.replace("_", " ")}</td>
                  <td className="text-[12px] text-mute">{c.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
