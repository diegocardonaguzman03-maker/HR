import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { getContext } from "@/server/context";
import { opportunities, organizations } from "@/server/db/schema";
import { demoFilter } from "@/server/services/common";
import { loadDashboard } from "@/server/services/dashboard";
import { formatMoney, formatPct } from "@/domain/money";
import { Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { SimpleKpi } from "@/components/dashboard/Kpi";

export const metadata = { title: "Sales" };

export default async function SalesPage() {
  const { db, includeDemo, today } = await getContext();
  const d = await loadDashboard(db, { includeDemo, periodKey: "ytd", today });
  const s = d.sales;
  const R = d.settings.reportingCurrency;
  const openStageIds = new Set(d.stages.filter((x) => x.kind === "open").map((x) => x.id));
  const queue = (await db.select({ o: opportunities, org: organizations.name }).from(opportunities).leftJoin(organizations, eq(opportunities.organizationId, organizations.id)).where(demoFilter(opportunities.isDemo, includeDemo)).orderBy(asc(opportunities.nextActionDate)))
    .filter(({ o }) => openStageIds.has(o.stageId));
  const maxReached = Math.max(1, ...s.funnel.map((f) => f.reached));
  return (
    <div className="mx-auto max-w-[1300px]">
      <PageHeader label="Revenue intelligence · year to date" title="Sales" description="Pipeline conversion, forecast and the follow-up queue. Forecasts are weighted by stage probability; they are not commitments." />
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <SimpleKpi label="Weighted pipeline" kind="forecast" value={formatMoney(s.weightedPipeline.value, R)} sub={`Unweighted ${formatMoney(s.unweightedPipeline.value, R)}`} />
        <SimpleKpi label="Win rate (YTD)" value={formatPct(s.winRate)} sub={`${s.wonCount} won / ${s.lostCount} lost`} />
        <SimpleKpi label="Average deal" value={s.averageDealSize === null ? "—" : formatMoney(s.averageDealSize, R)} />
        <SimpleKpi label="Sales cycle" value={s.salesCycleDays === null ? "—" : `${s.salesCycleDays} days`} sub="created → closed won" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle label="Conversion by stage" title="Funnel (opportunities that reached each stage)" />
          {s.funnel.every((f) => f.reached === 0) ? <p className="text-[13px] text-mute">No opportunities yet.</p> : (
            <ul className="flex flex-col gap-2">
              {s.funnel.map((f) => (
                <li key={f.stageId} className="grid grid-cols-[150px_1fr_80px] items-center gap-3 text-[12.5px]">
                  <span className="truncate text-niebla">{f.name}</span>
                  <span className="h-2.5 rounded-sm bg-graphite-3"><span className="block h-full rounded-sm bg-indigo/80" style={{ width: `${(f.reached / maxReached) * 100}%` }} /></span>
                  <span className="text-right font-mono">{f.reached}{f.conversionFromPrev !== null ? ` · ${formatPct(f.conversionFromPrev)}` : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <SectionTitle label="Forecast" title="Weighted revenue by expected close month" />
          <table className="px-table"><thead><tr><th>Month</th><th className="text-right">Weighted</th></tr></thead>
            <tbody>{s.forecast.map((f) => <tr key={f.month}><td className="font-mono">{f.month}</td><td className="text-right font-mono">{formatMoney(f.weighted, R)}</td></tr>)}</tbody>
          </table>
          <p className="mt-3 text-[11.5px] text-mute">Opportunities without an expected close date or value are excluded. {s.weightedPipeline.missingFx ? `${s.weightedPipeline.missingFx} deal(s) in another currency excluded until an FX rate is recorded.` : ""}</p>
        </Card>
      </div>
      <Card className="mt-6 p-5">
        <SectionTitle label="Follow-up queue" title="Next actions, soonest first" />
        {!queue.length ? <EmptyState title="No open opportunities" /> : (
          <table className="px-table"><thead><tr><th>Due</th><th>Organization</th><th>Next action</th><th>Opportunity</th><th>Owner</th></tr></thead>
            <tbody>{queue.map(({ o, org }) => <tr key={o.id}><td className={`font-mono text-[12px] ${o.nextActionDate && o.nextActionDate < today ? "text-clay" : ""}`}>{o.nextActionDate ?? "not set"}</td><td>{org}</td><td>{o.nextAction ?? <span className="text-mute">—</span>}</td><td><Link href={`/crm/opportunities/${o.id}`} className="hover:underline">{o.title}</Link></td><td className="font-mono text-[12px]">{o.ownerAgentId ?? "founder"}</td></tr>)}</tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
