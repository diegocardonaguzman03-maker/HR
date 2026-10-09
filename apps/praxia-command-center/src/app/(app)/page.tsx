import Link from "next/link";
import { getContext } from "@/server/context";
import { loadDashboard } from "@/server/services/dashboard";
import type { PeriodKey } from "@/domain/period";
import { formatMoney, formatPct } from "@/domain/money";
import { PageHeader, SectionTitle } from "@/components/ui/primitives";
import { KpiCard, SimpleKpi } from "@/components/dashboard/Kpi";
import { DecisionFeed } from "@/components/dashboard/DecisionFeed";
import { cn } from "@/lib/cn";

export const metadata = { title: "Overview" };
const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "mtd", label: "MTD" },
  { key: "qtd", label: "QTD" },
  { key: "ytd", label: "YTD" },
  { key: "all", label: "All" },
];

export default async function Overview({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const { db, includeDemo, today } = await getContext();
  const sp = await searchParams;
  const periodKey = (PERIODS.some((p) => p.key === sp.period) ? sp.period : "mtd") as PeriodKey;
  const d = await loadDashboard(db, { includeDemo, periodKey, today });
  const R = d.settings.reportingCurrency;
  const f = d.finance;
  const s = d.sales;
  const target = f.revenueTarget.value;
  const ratio = f.revenueVsTarget.value;

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        label={`Overview · ${d.period.label} · ${d.period.from === "0000-01-01" ? "all time" : `${d.period.from} → ${d.period.to}`}`}
        title="What needs your attention"
        description={
          <>
            Reporting currency {R}. Figures are computed from recorded transactions only{includeDemo ? " — including labelled demo records" : ""}. Each card says whether it is an actual, a forecast, an estimate or a goal.
          </>
        }
        actions={
          <nav className="flex rounded-lg border border-hair p-0.5" aria-label="Period">
            {PERIODS.map((p) => (
              <Link key={p.key} href={`/?period=${p.key}`} className={cn("rounded-md px-3 py-1 font-mono text-[11px] tracking-wider", p.key === periodKey ? "bg-graphite-3 text-ivory" : "text-niebla hover:text-ivory")}>{p.label}</Link>
            ))}
          </nav>
        }
      />

      {/* Revenue vs goal — the five-second read */}
      <section className="px-card mb-8 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="px-label">Revenue vs goal · basis: {d.settings.targetBasis}{d.settings.targetBasis === "collected" ? " (net of tax)" : ""}</div>
            <div className="mt-1 font-display text-[34px] leading-none font-semibold tracking-[-0.02em] tabular-nums">
              {formatMoney(f.revenueTargetBasisValue.value, R)}
              <span className="ml-2 text-[16px] text-niebla">of {target === null ? "—" : formatMoney(target, R)} goal</span>
            </div>
          </div>
          <div className="text-right text-[12px] text-mute">
            Goal: {formatMoney(d.settings.monthlyRevenueTarget, d.settings.monthlyRevenueTargetCurrency)}/month — a target, not revenue. <br className="hidden md:block" />Measurement basis is an open founder decision [Supuesto]. Change under <Link href="/settings" className="text-indigo-soft hover:underline">Settings</Link>.
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-graphite-3" role="progressbar" aria-label="Revenue versus monthly goal" aria-valuenow={Math.min(100, Math.round((ratio ?? 0) * 100))} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-indigo transition-[width] duration-300" style={{ width: `${Math.min((ratio ?? 0) * 100, 100)}%` }} />
        </div>
        <div className="mt-1.5 font-mono text-[11px] text-niebla">{ratio === null ? "Select a bounded period to compare with the goal" : `${formatPct(ratio)} of goal`}</div>
      </section>

      <section className="mb-9">
        <SectionTitle label="Finance" title="Money in, money out" action={<Link href="/finance" className="text-[12px] text-niebla hover:text-ivory">Open finance →</Link>} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <KpiCard label="Contracted (bookings)" metric={f.bookings} currency={R} emphasis="indigo" />
          <KpiCard label="Recognized revenue" metric={f.recognizedRevenue} currency={R} hint={`Recurring ${formatMoney(f.recognizedRecurring.value, R)} · Project ${formatMoney(f.recognizedProject.value, R)}`} />
          <KpiCard label="Cash collected (incl. tax)" metric={f.collected} currency={R} emphasis="clay" hint={`Net of tax ${formatMoney(f.collectedNet.value, R)}`} />
          <KpiCard label="MRR" metric={f.mrr} currency={R} />
          <KpiCard label="Invoiced (pre-tax)" metric={f.invoicedSubtotal} currency={R} />
          <KpiCard label="Outstanding invoices" metric={f.accountsReceivable} currency={R} hint={`Overdue ${formatMoney(f.overdueReceivables.value, R)}`} />
          <KpiCard label="Operating expenses" metric={f.operatingExpenses} currency={R} hint={`Direct costs ${formatMoney(f.directCosts.value, R)}`} />
          <KpiCard label="Gross margin" metric={f.grossMargin} format="pct" currency={R} />
          <KpiCard label="Operating profit" metric={f.operatingProfit} currency={R} />
          <KpiCard label="Cash balance" metric={f.cashBalance} currency={R} />
          <KpiCard label="Cash runway" metric={f.runwayMonths} format="months" currency={R} />
          <KpiCard label="Expected collections · 30d" metric={f.expectedCollections30} currency={R} />
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section aria-label="Executive decision feed">
          <SectionTitle label="Executive decision feed" title={`${d.decisions.length} item${d.decisions.length === 1 ? "" : "s"} backed by records`} />
          <DecisionFeed items={d.decisions} />
        </section>

        <div className="flex flex-col gap-8">

          <section>
            <SectionTitle label="Sales" title="Pipeline health" action={<Link href="/sales" className="text-[12px] text-niebla hover:text-ivory">Open sales →</Link>} />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <SimpleKpi label="Weighted pipeline" kind="forecast" value={formatMoney(s.weightedPipeline.value, R)} sub={s.weightedPipeline.missingFx ? `${s.weightedPipeline.missingFx} deal(s) without FX rate excluded` : `Unweighted ${formatMoney(s.unweightedPipeline.value, R)}`} />
              <SimpleKpi label="Active opportunities" value={String(s.activeOpportunities)} sub={s.opportunitiesWithoutValue ? `${s.opportunitiesWithoutValue} without estimated value` : undefined} />
              <SimpleKpi label="Open proposal value" kind="forecast" value={formatMoney(s.openProposalValue.value, R)} />
              <SimpleKpi label="Leads · qualified" value={`${s.totalLeads} · ${s.qualifiedLeads}`} />
              <SimpleKpi label="Win rate" value={formatPct(s.winRate)} sub={`${s.wonCount} won · ${s.lostCount} lost in period`} />
              <SimpleKpi label="Avg deal · cycle" value={`${s.averageDealSize === null ? "—" : formatMoney(s.averageDealSize, R, { compact: true })} · ${s.salesCycleDays === null ? "—" : `${s.salesCycleDays} d`}`} />
              <SimpleKpi label="Meetings booked" value={String(s.meetingsBooked)} />
              <SimpleKpi label="Reply rate" value={formatPct(s.replyRate)} sub={`${s.contactsReplied} of ${s.contactsReached} contacts reached`} />
              <SimpleKpi label="Forecast · next 3 mo" kind="forecast" value={formatMoney(s.forecast.reduce((a, x) => a + x.weighted, 0), R, { compact: true })} sub="Weighted by stage probability" />
            </div>
          </section>

          <section>
            <SectionTitle label="Operations" title="Delivery & AI organization" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <SimpleKpi label="Active clients" value={String(d.operations.activeClients)} sub={`${d.operations.activeContracts} active contract(s)`} />
              <SimpleKpi label="Open approvals" value={String(d.operations.openApprovals)} />
              <SimpleKpi label="Agent tasks done / open" value={`${d.operations.agentTasksCompleted} / ${d.operations.agentTasksOpen}`} sub={`${d.operations.agentsWorking} marked working (manual updates — no engine yet)`} />
              <KpiCard label="AI operating costs" metric={f.aiCosts} currency={R} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
