import Link from "next/link";
import { Card, PageHeader } from "./primitives";

/** Honest placeholder for modules that are not built yet: what it will do, when, and what exists today. */
export function PlannedModule({ label, title, phase, purpose, scope, today, needs }: { label: string; title: string; phase: string; purpose: string; scope: string[]; today: { label: string; href: string }[]; needs: string[] }) {
  return (
    <div className="mx-auto max-w-[900px]">
      <PageHeader label={`${label} · not built yet · ${phase}`} title={title} description={purpose} />
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-5">
          <div className="px-label mb-3">Planned scope (PRD v3.0)</div>
          <ul className="list-disc space-y-1.5 pl-4 text-[13px]">{scope.map((s) => <li key={s}>{s}</li>)}</ul>
        </Card>
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <div className="px-label mb-3">Use today</div>
            <ul className="space-y-1.5 text-[13px]">{today.map((t) => <li key={t.label}><Link className="text-[#a9a1ff] hover:underline" href={t.href}>{t.label} →</Link></li>)}</ul>
          </Card>
          <Card className="p-5">
            <div className="px-label mb-3">Requires</div>
            <ul className="list-disc space-y-1.5 pl-4 text-[13px] text-niebla">{needs.map((n) => <li key={n}>{n}</li>)}</ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
