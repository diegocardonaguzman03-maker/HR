import { AlertTriangle } from "lucide-react";
import type { Metric, MetricKind } from "@/domain/finance";
import { formatMoney, formatPct } from "@/domain/money";
import type { Currency } from "@/server/db/schema";
import type { Tone } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

const KIND: Record<MetricKind, { label: string; tone: Tone }> = {
  actual: { label: "Actual", tone: "neutral" },
  forecast: { label: "Forecast", tone: "violet" },
  estimate: { label: "Estimate", tone: "warn" },
  goal: { label: "Goal", tone: "indigo" },
};

type Format = "money" | "pct" | "months" | "count" | "days";
export function fmt(v: number | null, f: Format, cur: Currency) {
  if (v === null || v === undefined) return "—";
  if (f === "money") return formatMoney(v, cur, { compact: Math.abs(v) >= 10_000_000 });
  if (f === "pct") return formatPct(v);
  if (f === "months") return `${v.toFixed(1)} mo`;
  if (f === "days") return `${v} d`;
  return String(v);
}

function KindTag({ kind }: { kind: MetricKind }) {
  const k = KIND[kind];
  const color = { neutral: "text-mute", violet: "text-violet", warn: "text-warn", indigo: "text-[#a9a1ff]" }[k.tone as "neutral" | "violet" | "warn" | "indigo"];
  return <span className={cn("shrink-0 font-mono text-[9.5px] tracking-[0.14em] uppercase", color)}>{k.label}</span>;
}

export function KpiCard({ label, metric, format = "money", currency, emphasis, hint }: { label: string; metric: Metric; format?: Format; currency: Currency; emphasis?: "indigo" | "clay"; hint?: string }) {
  const foot = metric.missingFx > 0 ? null : metric.value === null ? (metric.note ?? "No data") : (hint ?? "");
  return (
    <div className={cn("px-card flex min-h-[118px] flex-col justify-between gap-2 p-4", emphasis === "indigo" && "border-indigo/40", emphasis === "clay" && "border-clay/40")} title={metric.note ?? hint}>
      <div className="px-label leading-snug tracking-[0.14em]">{label}</div>
      <div>
        <div className="font-display text-[23px] leading-tight font-semibold tracking-[-0.02em] tabular-nums">{fmt(metric.value, format, currency)}</div>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-[11.5px] text-mute">
          {metric.missingFx > 0 ? (
            <span className="flex min-w-0 items-center gap-1 text-warn"><AlertTriangle size={12} className="shrink-0" /><span className="truncate">{metric.missingFx} without FX rate</span></span>
          ) : (
            <span className="min-w-0 truncate">{foot}</span>
          )}
          <KindTag kind={metric.kind} />
        </div>
      </div>
    </div>
  );
}

export function SimpleKpi({ label, value, sub, kind = "actual" }: { label: string; value: string; sub?: string; kind?: MetricKind }) {
  return (
    <div className="px-card flex min-h-[118px] flex-col justify-between gap-2 p-4">
      <div className="px-label leading-snug tracking-[0.14em]">{label}</div>
      <div>
        <div className="font-display text-[23px] leading-tight font-semibold tabular-nums">{value}</div>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-[11.5px] text-mute">
          <span className="min-w-0 truncate">{sub ?? ""}</span>
          <KindTag kind={kind} />
        </div>
      </div>
    </div>
  );
}
