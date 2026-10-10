"use client";
import { useState } from "react";
import { Button } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/Modal";
import { ContactForm } from "@/components/crm/forms";

export function EditContact({ contact, organizations }: { contact: Parameters<typeof ContactForm>[0]["initial"]; organizations: { id: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit</Button>
      <Modal open={open} onOpenChange={setOpen} title="Edit contact" wide><ContactForm initial={contact} organizations={organizations} onDone={() => setOpen(false)} /></Modal>
    </>
  );
}
