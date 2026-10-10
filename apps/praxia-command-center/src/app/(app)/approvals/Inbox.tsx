"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge, Button } from "@/components/ui/primitives";
import { decideAction, loadDecisionsAction, markOutreachSentAction } from "@/app/actions/engine";
import { askChoice, askText } from "@/lib/dialog";
import { toast } from "@/lib/ui-store";
import type { DecisionOption } from "@/server/db/schema";

function useAct() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) =>
    start(async () => { const r = await fn(); if (r.ok) { toast.ok(ok); router.refresh(); } else toast.bad(r.error ?? "Something went wrong."); });
  return { pending, act };
}

/** A founder decision: pick one option (the recommendation is preselected but nothing is recorded until you confirm). */
export function DecisionForm({ id, options, recommended }: { id: string; options: DecisionOption[]; recommended: string | null }) {
  const { pending, act } = useAct();
  const [choice, setChoice] = useState<string | null>(recommended && options.some((o) => o.id === recommended) ? recommended : null);
  return (
    <div className="mt-3">
      <fieldset className="flex flex-col gap-1.5">
        <legend className="sr-only">Options</legend>
        {options.map((o) => (
          <label key={o.id} className={`flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 text-[13px] ${choice === o.id ? "border-indigo/60 bg-indigo/10" : "border-hair hover:border-mute/60"}`}>
            <input type="radio" name={`d-${id}`} className="mt-1" checked={choice === o.id} onChange={() => setChoice(o.id)} />
            <span className="min-w-0 flex-1"><b className="font-mono">{o.id}.</b> {o.label}</span>
            {o.id === recommended && <Badge tone="indigo">Recommended</Badge>}
          </label>
        ))}
      </fieldset>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="primary" size="sm" disabled={pending || !choice} onClick={async () => {
          const note = await askText({ title: `Decide option ${choice}`, message: "Recorded in the decision log and the audit trail.", label: "Note (optional)", confirmLabel: `Record ${choice}` });
          if (note !== null) act(() => decideAction(id, "approved", note || null, choice), `Decision recorded: ${choice}`);
        }}>Record decision</Button>
        <Button variant="ghost" size="sm" disabled={pending} onClick={async () => {
          const note = await askText({ title: "Defer this decision", label: "Why / what you need first", required: true, confirmLabel: "Defer" });
          if (note) act(() => decideAction(id, "rejected", note), "Deferred.");
        }}>Defer</Button>
      </div>
    </div>
  );
}

/** Agent output or 1:1 draft: approve, or send back with feedback (the agent reworks it on the next engine run). */
export function ReviewButtons({ id, kind }: { id: string; kind: "agent_output" | "outbound_message" }) {
  const { pending, act } = useAct();
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="primary" size="sm" disabled={pending} onClick={async () => {
        const note = await askText({ title: kind === "outbound_message" ? "Approve this draft" : "Approve this output", message: kind === "outbound_message" ? "Approving does not send anything: you send it yourself, then mark it sent." : undefined, label: "Note (optional)", confirmLabel: "Approve" });
        if (note !== null) act(() => decideAction(id, "approved", note || null), "Approved.");
      }}>Approve</Button>
      <Button size="sm" disabled={pending} onClick={async () => {
        const note = await askText({ title: "Send back for rework", label: "What should change?", required: true, confirmLabel: "Send back" });
        if (note) act(() => decideAction(id, "rejected", note), "Sent back to the agent with your feedback.");
      }}>Send back</Button>
    </div>
  );
}

export function CopyButton({ text }: { text: string }) {
  return <Button size="sm" variant="ghost" onClick={async () => { try { await navigator.clipboard.writeText(text); toast.ok("Copied."); } catch { toast.bad("Copy is blocked here — select the text instead."); } }}>Copy</Button>;
}

export function MarkSentButton({ id, today }: { id: string; today: string }) {
  const { pending, act } = useAct();
  return (
    <Button size="sm" disabled={pending} onClick={async () => {
      const channel = await askChoice({ title: "How did you send it?", options: [{ value: "linkedin", label: "LinkedIn" }, { value: "email", label: "Email" }, { value: "call", label: "Call" }] });
      if (!channel) return;
      const on = await askText({ title: "Date sent", label: "YYYY-MM-DD", defaultValue: today, required: true, confirmLabel: "Record" });
      if (on) act(() => markOutreachSentAction(id, on, channel as "linkedin" | "email" | "call"), "Recorded as sent — the funnel moved.");
    }}>Mark as sent</Button>
  );
}

export function LoadDecisionsButton() {
  const { pending, act } = useAct();
  return <Button variant="primary" size="sm" disabled={pending} onClick={() => act(() => loadDecisionsAction(), "PRX-0013 decisions loaded into your inbox.")}>Load the agents' pending decisions</Button>;
}
