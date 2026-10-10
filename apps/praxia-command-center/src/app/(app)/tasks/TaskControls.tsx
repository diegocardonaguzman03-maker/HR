"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/primitives";
import { updateTaskStatusAction } from "@/app/actions/governance";
import { askConfirm, askText } from "@/lib/dialog";
import { toast } from "@/lib/ui-store";
import type { TaskStatus } from "@/server/db/schema";

export function TaskControls({ id, status }: { id: string; status: TaskStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const go = (s: TaskStatus, opts: { output?: string; error?: string } = {}) => start(async () => { const r = await updateTaskStatusAction(id, s, opts); if (r.ok) { toast.ok(`Task → ${s.replace("_", " ")}`); router.refresh(); } else toast.bad(r.error); });
  return (
    <div className="flex flex-wrap gap-1">
      {(status === "queued" || status === "waiting_input") && <Button size="sm" disabled={pending} onClick={() => go("working")}>Start</Button>}
      {status === "working" && <Button size="sm" disabled={pending} onClick={async () => { const o = await askText({ title: "Complete task", label: "Output (deliverable or where it is saved)", required: true, confirmLabel: "Complete" }); if (o) go("completed", { output: o }); }}>Complete</Button>}
      {status === "working" && <Button size="sm" disabled={pending} onClick={() => go("waiting_approval")}>Needs approval</Button>}
      {status === "waiting_approval" && <Button size="sm" disabled={pending} onClick={async () => { const o = await askText({ title: "Approve output", label: "Approved output (location)", required: true, confirmLabel: "Approve" }); if (o) go("completed", { output: o }); }}>Approve output</Button>}
      {status === "working" && <Button size="sm" variant="ghost" disabled={pending} onClick={async () => { const e = await askText({ title: "Record an error", label: "What went wrong?", required: true, confirmLabel: "Record error" }); if (e) go("error", { error: e }); }}>Error</Button>}
      {status === "error" && <Button size="sm" disabled={pending} onClick={() => go("queued")}>Retry</Button>}
      {!["completed", "cancelled"].includes(status) && <Button size="sm" variant="ghost" disabled={pending} onClick={async () => (await askConfirm({ title: "Cancel this task?", confirmLabel: "Cancel task", danger: true })) && go("cancelled")}>Cancel</Button>}
    </div>
  );
}
