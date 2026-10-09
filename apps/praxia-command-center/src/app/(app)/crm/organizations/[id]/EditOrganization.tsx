"use client";
import { useState } from "react";
import { Button } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/Modal";
import { OrganizationForm } from "@/components/crm/forms";

export function EditOrganization({ org }: { org: Parameters<typeof OrganizationForm>[0]["initial"] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit</Button>
      <Modal open={open} onOpenChange={setOpen} title="Edit organization" wide><OrganizationForm initial={org} onDone={() => setOpen(false)} /></Modal>
    </>
  );
}
