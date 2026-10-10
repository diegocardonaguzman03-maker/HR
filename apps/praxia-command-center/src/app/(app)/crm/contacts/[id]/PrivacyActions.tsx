"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/Modal";
import { eraseContactAction, exportContactAction, optOutAction } from "@/app/actions/privacy";
import { askChoice, askConfirm, askText } from "@/lib/dialog";
import { toast } from "@/lib/ui-store";

/** ARCO and consent actions for one person (RISK-01 C2/C4). */
export function PrivacyActions({ contactId, name, optedOut }: { contactId: string; name: string; optedOut: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [json, setJson] = useState<string | null>(null);
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button size="sm" disabled={pending} onClick={() => start(async () => { const r = await exportContactAction(contactId); if (r.ok) setJson(JSON.stringify(r.value, null, 2)); else toast.bad(r.error); })}>Export data (ARCO)</Button>
      {!optedOut && <Button size="sm" disabled={pending} onClick={async () => {
        const ch = await askChoice({ title: `${name} asked not to be contacted`, message: "Sets do-not-contact and adds the person to the suppression list (hashed).", options: [{ value: "email", label: "By email" }, { value: "linkedin", label: "On LinkedIn" }, { value: "phone", label: "By phone" }, { value: "other", label: "Other" }] });
        if (ch) start(async () => { const r = await optOutAction(contactId, ch); if (r.ok) { toast.ok("Opt-out recorded."); router.refresh(); } else toast.bad(r.error); });
      }}>Record opt-out</Button>}
      <Button size="sm" variant="danger" disabled={pending} onClick={async () => {
        const reason = await askText({ title: `Erase ${name}?`, message: "Deletes the person, redacts their interactions, drafts and audit entries, and suppresses them so a re-import cannot bring them back. This cannot be undone.", label: "Reason (e.g. ARCO request of 2026-10-10)", required: true, confirmLabel: "Continue" });
        if (!reason || !(await askConfirm({ title: "Erase permanently?", confirmLabel: "Erase", danger: true }))) return;
        start(async () => { const r = await eraseContactAction(contactId, reason); if (r.ok) { toast.ok("Erased."); router.push("/crm/contacts"); } else toast.bad(r.error); });
      }}>Erase (ARCO)</Button>
      <Modal open={json !== null} onOpenChange={(o) => !o && setJson(null)} title="Personal data held by PRAXIA" description="Everything recorded about this person, for an access request. Copy it into your reply." wide>
        <pre className="max-h-[60vh] overflow-auto rounded-md bg-graphite-3 p-3 font-mono text-[11.5px] whitespace-pre-wrap">{json}</pre>
      </Modal>
    </div>
  );
}
