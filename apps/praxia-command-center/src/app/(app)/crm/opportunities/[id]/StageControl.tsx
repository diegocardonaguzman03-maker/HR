"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { moveStageAction } from "@/app/actions/crm";
import { toast } from "@/lib/ui-store";
import { cn } from "@/lib/cn";

export function StageControl({ opportunityId, stageId, stages }: { opportunityId: string; stageId: string; stages: { id: string; name: string; kind: string; position: number }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const current = stages.find((s) => s.id === stageId)!;
  const move = (to: (typeof stages)[number]) => {
    let reason: string | undefined;
    if (to.kind === "lost") { const r = prompt("Lost reason (required):"); if (!r) return; reason = r; }
    start(async () => {
      const r = await moveStageAction(opportunityId, to.id, reason);
      if (r.ok) toast.ok(`Moved to ${to.name}`); else toast.bad(r.error);
      router.refresh();
    });
  };
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Pipeline stage">
      {stages.map((s) => (
        <button
          key={s.id}
          disabled={pending}
          onClick={() => s.id !== stageId && move(s)}
          aria-current={s.id === stageId ? "step" : undefined}
          className={cn(
            "rounded-md border px-2 py-1 font-mono text-[10.5px] tracking-wide transition-colors",
            s.id === stageId ? (s.kind === "won" ? "border-ok bg-ok/15 text-ok" : s.kind === "lost" ? "border-bad bg-bad/15 text-bad" : "border-indigo bg-indigo/15 text-ivory") :
              s.kind === "open" && s.position < current.position ? "border-hair bg-graphite-3 text-niebla" : "border-hair text-mute hover:border-niebla/50 hover:text-ivory",
          )}
        >
          {s.name}
        </button>
      ))}
    </div>
  );
}
