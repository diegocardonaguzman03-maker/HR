"use client";
import { X } from "lucide-react";
import { useToasts } from "@/lib/ui-store";
import { cn } from "@/lib/cn";

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div className="fixed right-5 bottom-5 z-[60] flex w-[min(420px,90vw)] flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={cn("flex items-start gap-3 rounded-lg border bg-graphite-2 px-4 py-3 text-[13px] shadow-xl", t.tone === "ok" ? "border-ok/50" : t.tone === "bad" ? "border-bad/60" : "border-indigo/50")}>
          <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", t.tone === "ok" ? "bg-ok" : t.tone === "bad" ? "bg-bad" : "bg-indigo")} />
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-mute hover:text-ivory"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}
