import { desc } from "drizzle-orm";
import { getContext } from "@/server/context";
import { auditLog } from "@/server/db/schema";
import { Card, PageHeader } from "@/components/ui/primitives";

export const metadata = { title: "Audit log" };

export default async function AuditPage() {
  const { db } = await getContext();
  const rows = await db.select().from(auditLog).orderBy(desc(auditLog.at)).limit(300);
  return (
    <div className="mx-auto max-w-[1300px]">
      <PageHeader label="Governance" title="Audit log" description="Every mutation — who, what, when, and the record before and after. Showing the latest 300 entries." />
      <Card className="overflow-x-auto">
        <table className="px-table">
          <thead><tr><th>When (UTC)</th><th>Actor</th><th>Action</th><th>Entity</th><th>Change</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="font-mono text-[11.5px] whitespace-nowrap">{r.at.slice(0, 19).replace("T", " ")}</td>
                <td className="font-mono text-[12px]">{r.actor}</td>
                <td className="font-mono text-[12px] text-[#a9a1ff]">{r.action}</td>
                <td className="font-mono text-[11px] text-mute">{r.entityType} · {r.entityId.slice(0, 8)}</td>
                <td><details><summary className="cursor-pointer text-[12px] text-niebla">view</summary><pre className="mt-2 max-w-[520px] overflow-auto text-[10.5px] whitespace-pre-wrap text-mute">{JSON.stringify({ before: r.before, after: r.after }, null, 1)}</pre></details></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
