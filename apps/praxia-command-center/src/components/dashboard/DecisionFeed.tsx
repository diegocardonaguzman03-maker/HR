"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowUpRight, Check, X } from "lucide-react";
import type { DecisionItem } from "@/domain/decisions";
import { Badge, Button, EmptyState } from "@/components/ui/primitives";
import { decideApprovalAction, assignTaskAction } from "@/app/actions/governance";
import { toast } from "@/lib/ui-store";

const PRIORITY = { critical: "bad", high: "clay", medium: "warn", low: "neutral" } as const;

export function DecisionFeed({ items }: { items: DecisionItem[] }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<Set<string>>(new Set());
  if (!items.length)
    return <EmptyState title="Nothing needs your decision right now.">The feed only shows items backed by real records: overdue invoices, pending approvals, stalled opportunities, uninvoiced contracts and setup gaps.</EmptyState>;

  const act = (item: DecisionItem, fn: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    start(async () => {
      const r = await fn();
      if (r.ok) { toast.ok(success); setDone((s) => new Set(s).add(item.id)); } else toast.bad(r.error ?? "Action failed");
    });

  return (
    <ol className="flex flex-col gap-2.5">
      {items.filter((i) => !done.has(i.id)).map((d) => (
        <li key={d.id} className="px-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <Badge tone={PRIORITY[d.priority]}>{d.priority}</Badge>
                <Badge>{d.category}</Badge>
                <span className="font-mono text-[10px] tracking-wider text-niebla">→ {d.agentId}</span>
              </div>
              <div className="font-display text-[15px] font-semibold">{d.title}</div>
              <p className="mt-1 text-[13px] text-niebla">{d.reason}</p>
              <dl className="mt-2.5 grid gap-x-6 gap-y-1 text-[12.5px] sm:grid-cols-[auto_1fr]">
                <dt className="px-label pt-0.5">Evidence</dt>
                <dd className="flex flex-wrap gap-x-3">{d.evidence.map((e, i) => e.href ? <Link key={i} href={e.href} className="text-[#a9a1ff] hover:underline">{e.label}</Link> : <span key={i}>{e.label}</span>)}</dd>
                <dt className="px-label pt-0.5">Impact</dt>
                <dd>{d.impact}</dd>
                <dt className="px-label pt-0.5">Recommended</dt>
                <dd>{d.recommendedAction}</dd>
              </dl>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {d.actions.map((a, i) => {
                if (a.type === "link") return <Link key={i} href={a.href} className="inline-flex items-center gap-1 rounded-lg border border-hair px-2.5 py-1.5 text-[12.5px] hover:bg-graphite-3">{a.label}<ArrowUpRight size={12} /></Link>;
                if (a.type === "approve") return <Button key={i} size="sm" variant="primary" disabled={pending} onClick={() => act(d, () => decideApprovalAction(a.approvalId, "approved", null), "Approved and recorded in the audit log.")}><Check size={13} />{a.label}</Button>;
                if (a.type === "reject") return <Button key={i} size="sm" variant="danger" disabled={pending} onClick={() => { const note = prompt("Reason for rejecting (recorded):"); if (note !== null) act(d, () => decideApprovalAction(a.approvalId, "rejected", note), "Rejected."); }}><X size={13} />{a.label}</Button>;
                return <Button key={i} size="sm" disabled={pending} onClick={() => act(d, () => assignTaskAction({ agentId: a.agentId, title: a.title, origin: "decision_feed", entityType: a.entityType, entityId: a.entityId }), `Task queued for ${a.agentId}. It will run when the execution engine is connected.`)}>{a.label}</Button>;
              })}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
