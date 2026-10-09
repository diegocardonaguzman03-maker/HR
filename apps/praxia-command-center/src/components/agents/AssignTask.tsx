"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/Modal";
import { assignTaskAction } from "@/app/actions/governance";
import { toast } from "@/lib/ui-store";

export function AssignTask({ agents, defaultAgentId, entityType, entityId, label = "Assign task to agent", defaultTitle = "" }: { agents: { id: string; label: string }[]; defaultAgentId?: string; entityType?: string; entityId?: string; label?: string; defaultTitle?: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <Modal open={open} onOpenChange={setOpen} title="Assign a task" description="Creates a real task record and queues it. Until the execution engine is connected (Phase 2) the agent will not run it by itself; you can update its status manually from Tasks.">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            start(async () => {
              const r = await assignTaskAction({ agentId: String(f.get("agentId")), title: String(f.get("title")), instructions: String(f.get("instructions")), entityType: entityType ?? null, entityId: entityId ?? null });
              if (r.ok) { toast.ok(`Task queued for ${f.get("agentId")}.`); setOpen(false); router.refresh(); } else toast.bad(r.error);
            });
          }}
        >
          <Field label="Agent"><Select name="agentId" defaultValue={defaultAgentId}>{agents.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}</Select></Field>
          <Field label="Task *"><Input name="title" required minLength={3} defaultValue={defaultTitle} /></Field>
          <Field label="Instructions"><Textarea name="instructions" placeholder="Expected output, sources to use, deadline…" /></Field>
          <div className="flex justify-end"><Button variant="primary" disabled={pending} type="submit">Queue task</Button></div>
        </form>
      </Modal>
    </>
  );
}
