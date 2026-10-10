"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({ open, onOpenChange, title, description, children, wide }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: ReactNode; wide?: boolean }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in" />
        <Dialog.Content className={`fixed top-1/2 left-1/2 z-50 max-h-[88vh] w-[92vw] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-hair bg-graphite-2 p-6 shadow-2xl ${wide ? "max-w-3xl" : "max-w-lg"}`}>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-[19px] font-semibold">{title}</Dialog.Title>
              {description && <Dialog.Description className="mt-1 text-[13px] text-niebla">{description}</Dialog.Description>}
            </div>
            <Dialog.Close className="rounded p-1 text-mute hover:text-ivory" aria-label="Close"><X size={16} /></Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
