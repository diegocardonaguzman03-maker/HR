"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/Modal";
import { OpportunityForm } from "@/components/crm/forms";
import { createProposalAction } from "@/app/actions/commercial";
import { toast } from "@/lib/ui-store";

type Props = Parameters<typeof OpportunityForm>[0];
export function EditOpportunity(props: Omit<Props, "onDone">) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit opportunity</Button>
      <Modal open={open} onOpenChange={setOpen} title="Edit opportunity" wide><OpportunityForm {...props} onDone={() => setOpen(false)} /></Modal>
    </>
  );
}

export function CreateProposal({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button variant="primary" disabled={pending} onClick={() => start(async () => {
      const r = await createProposalAction(opportunityId);
      if (r.ok) { toast.ok("Draft proposal created."); router.push(`/proposals/${r.value.id}`); } else toast.bad(r.error);
    })}>New proposal version</Button>
  );
}
