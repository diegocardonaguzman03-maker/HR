import Link from "next/link";
import { Suspense } from "react";
import { getContext } from "@/server/context";
import { listOrganizations } from "@/server/services/crm";
import { Badge, EmptyState, PageHeader } from "@/components/ui/primitives";
import { NewButton } from "@/components/crm/NewButton";
import { OrganizationForm } from "@/components/crm/forms";
import { CrmTabs } from "@/components/crm/CrmTabs";

export const metadata = { title: "Organizations" };

export default async function OrganizationsPage() {
  const { db, includeDemo } = await getContext();
  const orgs = await listOrganizations(db, includeDemo);
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader label="CRM" title="Organizations" description="Target accounts, prospects and clients. Duplicates are detected by domain and name." actions={<Suspense><NewButton label="New organization" title="New organization" wide><OrganizationForm /></NewButton></Suspense>} />
      <CrmTabs active="organizations" />
      {!orgs.length ? (
        <EmptyState title="No organizations yet">Add target accounts manually. Account discovery and enrichment providers (e.g. Hunter) arrive in Phase 2; every externally sourced fact will keep its source and retrieval date.</EmptyState>
      ) : (
        <div className="px-card overflow-x-auto">
          <table className="px-table">
            <thead><tr><th>Name</th><th>Lifecycle</th><th>Industry</th><th>Country</th><th>Size</th><th>Fit</th><th>Source</th></tr></thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/crm/organizations/${o.id}`} className="font-medium hover:underline">{o.name}</Link> {o.isDemo && <Badge tone="clay">Demo</Badge>}<div className="text-[12px] text-mute">{o.domain}</div></td>
                  <td><Badge tone={o.lifecycle === "client" ? "ok" : o.lifecycle === "prospect" ? "indigo" : "neutral"}>{o.lifecycle.replace("_", " ")}</Badge></td>
                  <td>{o.industry ?? "—"}</td><td>{o.country ?? "—"}</td><td>{o.sizeBand ?? "—"}</td>
                  <td className="font-mono">{o.fitScore ?? "—"}</td>
                  <td className="text-[12px] text-mute">{o.source}{o.sourceRetrievedAt ? ` · ${o.sourceRetrievedAt.slice(0, 10)}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
