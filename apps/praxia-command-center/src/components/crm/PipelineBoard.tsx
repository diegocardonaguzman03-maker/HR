"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { DndContext, PointerSensor, KeyboardSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { CalendarClock } from "lucide-react";
import { moveStageAction } from "@/app/actions/crm";
import { formatMoney } from "@/domain/money";
import { toast } from "@/lib/ui-store";
import { askText } from "@/lib/dialog";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/primitives";
import type { Currency } from "@/server/db/schema";

export type BoardStage = { id: string; name: string; kind: "open" | "won" | "lost"; defaultProbability: number };
export type BoardCard = {
  id: string; title: string; organizationName: string; stageId: string; amount: number | null; currency: Currency; probability: number;
  nextAction: string | null; nextActionDate: string | null; ownerAgentId: string | null; isDemo: boolean;
};

function Card({ c, today }: { c: BoardCard; today: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: c.id });
  const late = c.nextActionDate && c.nextActionDate < today;
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={cn("cursor-grab rounded-lg border border-hair bg-graphite-2 p-3 text-[12.5px] shadow-sm transition-shadow active:cursor-grabbing", isDragging && "z-50 shadow-2xl ring-1 ring-indigo")}
      aria-roledescription="Draggable opportunity"
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <Link href={`/crm/opportunities/${c.id}`} onPointerDown={(e) => e.stopPropagation()} className="font-medium text-ivory hover:underline">{c.organizationName}</Link>
        {c.isDemo && <Badge tone="clay">Demo</Badge>}
      </div>
      <div className="line-clamp-2 text-niebla">{c.title}</div>
      <div className="mt-2 flex items-center justify-between font-mono text-[11px]">
        <span className="text-ivory">{c.amount ? formatMoney(c.amount, c.currency, { compact: true }) : <span className="text-mute">no value</span>}</span>
        <span className="text-mute">{Math.round(c.probability * 100)}%</span>
      </div>
      {(c.nextAction || c.nextActionDate) && (
        <div className={cn("mt-2 flex items-center gap-1.5 border-t border-hair pt-2 text-[11.5px]", late ? "text-clay" : "text-mute")}>
          <CalendarClock size={12} /> <span className="truncate">{c.nextActionDate ?? "—"} · {c.nextAction ?? "next action?"}</span>
        </div>
      )}
    </div>
  );
}

function Column({ stage, cards, today, currency, totals }: { stage: BoardStage; cards: BoardCard[]; today: string; currency: Currency; totals: { value: number; missing: number } }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return (
    <div ref={setNodeRef} className={cn("flex w-[228px] shrink-0 flex-col rounded-xl border border-transparent bg-graphite-2/40 p-2 transition-colors", isOver && "border-indigo/60 bg-indigo/5")}>
      <div className="mb-2 px-1.5 pt-1">
        <div className="flex items-center justify-between">
          <span className={cn("px-label", stage.kind === "won" && "text-ok", stage.kind === "lost" && "text-bad")}>{stage.name}</span>
          <span className="font-mono text-[10px] text-mute">{cards.length}</span>
        </div>
        <div className="mt-0.5 font-mono text-[10.5px] text-mute">{formatMoney(totals.value, currency, { compact: true })}{totals.missing ? ` +${totals.missing} other ccy` : ""} · {Math.round(stage.defaultProbability * 100)}%</div>
      </div>
      <div className="flex min-h-24 flex-1 flex-col gap-2">{cards.map((c) => <Card key={c.id} c={c} today={today} />)}</div>
    </div>
  );
}

export function PipelineBoard({ stages, cards, today, reportingCurrency }: { stages: BoardStage[]; cards: BoardCard[]; today: string; reportingCurrency: Currency }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(cards, (state, move: { id: string; stageId: string }) => state.map((c) => (c.id === move.id ? { ...c, stageId: move.stageId } : c)));
  const [hideClosed, setHideClosed] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));

  const byStage = useMemo(() => {
    const m = new Map<string, BoardCard[]>();
    for (const s of stages) m.set(s.id, []);
    for (const c of optimistic) m.get(c.stageId)?.push(c);
    return m;
  }, [optimistic, stages]);

  const onDragEnd = async (e: DragEndEvent) => {
    const id = String(e.active.id);
    const to = e.over ? String(e.over.id) : null;
    const card = cards.find((c) => c.id === id);
    if (!to || !card || card.stageId === to) return;
    const target = stages.find((s) => s.id === to)!;
    let lostReason: string | undefined;
    if (target.kind === "lost") {
      const r = await askText({ title: `Close ${card.organizationName} as lost`, label: "Lost reason", required: true, confirmLabel: "Move to Closed Lost" });
      if (!r) return;
      lostReason = r;
    }
    start(async () => {
      setOptimistic({ id, stageId: to });
      const res = await moveStageAction(id, to, lostReason);
      if (res.ok) toast.ok(`${card.organizationName} → ${target.name}`);
      else toast.bad(res.error);
      router.refresh();
    });
  };

  const visible = stages.filter((s) => !hideClosed || s.kind === "open");
  return (
    <div>
      <label className="mb-3 flex items-center gap-2 text-[12.5px] text-niebla">
        <input type="checkbox" checked={hideClosed} onChange={(e) => setHideClosed(e.target.checked)} className="accent-indigo" /> Hide closed stages
      </label>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-4">
          {visible.map((s) => {
            const list = byStage.get(s.id) ?? [];
            const same = list.filter((c) => c.amount && c.currency === reportingCurrency);
            return <Column key={s.id} stage={s} cards={list} today={today} currency={reportingCurrency} totals={{ value: same.reduce((a, c) => a + (c.amount ?? 0), 0), missing: list.filter((c) => c.amount && c.currency !== reportingCurrency).length }} />;
          })}
        </div>
      </DndContext>
      <p className="mt-1 text-[11.5px] text-mute">Drag a card to change stage. Moves are validated on the server: required fields per stage; Closed Won needs signature or acceptance evidence; Closed Lost needs a reason.</p>
    </div>
  );
}
