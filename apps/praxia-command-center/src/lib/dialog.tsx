"use client";
/**
 * In-page confirmation and text-input dialogs. Native prompt()/confirm() are blocked inside the Artifact viewer
 * (and are poor UX anyway), so every decision step uses this instead.
 */
import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { Modal } from "@/components/ui/Modal";
import { Button, Field, Input } from "@/components/ui/primitives";

type Req =
  | { kind: "text"; title: string; message?: string; label: string; defaultValue?: string; required?: boolean; confirmLabel?: string; inputType?: string; resolve: (v: string | null) => void }
  | { kind: "confirm"; title: string; message?: string; confirmLabel?: string; danger?: boolean; resolve: (v: boolean) => void }
  | { kind: "choice"; title: string; message?: string; options: { value: string; label: string }[]; resolve: (v: string | null) => void };

const useDialog = create<{ req: Req | null; set: (r: Req | null) => void }>((set) => ({ req: null, set: (req) => set({ req }) }));

export function askText(o: { title: string; message?: string; label?: string; defaultValue?: string; required?: boolean; confirmLabel?: string; inputType?: string }): Promise<string | null> {
  return new Promise((resolve) => useDialog.getState().set({ kind: "text", label: o.label ?? o.title, ...o, resolve }));
}
export function askConfirm(o: { title: string; message?: string; confirmLabel?: string; danger?: boolean }): Promise<boolean> {
  return new Promise((resolve) => useDialog.getState().set({ kind: "confirm", ...o, resolve }));
}

/** Asks the founder to pick one of a few options. Resolves null when dismissed. */
export function askChoice(o: { title: string; message?: string; options: { value: string; label: string }[] }): Promise<string | null> {
  return new Promise((resolve) => useDialog.getState().set({ kind: "choice", ...o, resolve }));
}

export function DialogHost() {
  const { req, set } = useDialog();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (req?.kind === "text") setValue(req.defaultValue ?? ""); }, [req]);
  if (!req) return null;
  const close = (result: string | boolean | null) => {
    set(null);
    if (req.kind === "text" || req.kind === "choice") req.resolve(result as string | null);
    else req.resolve(result as boolean);
  };
  const canSubmit = req.kind === "confirm" || req.kind === "choice" || !req.required || value.trim().length > 0;
  if (req.kind === "choice") {
    return (
      <Modal open onOpenChange={(o) => !o && close(null)} title={req.title} description={req.message}>
        <div className="flex flex-col gap-2">
          {req.options.map((op) => <Button key={op.value} variant="secondary" onClick={() => close(op.value)}>{op.label}</Button>)}
          <Button type="button" variant="ghost" onClick={() => close(null)}>Cancel</Button>
        </div>
      </Modal>
    );
  }
  return (
    <Modal open onOpenChange={(o) => !o && close(req.kind === "confirm" ? false : null)} title={req.title} description={req.message}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => { e.preventDefault(); if (canSubmit) close(req.kind === "text" ? value.trim() : true); }}
      >
        {req.kind === "text" && <Field label={req.label + (req.required ? " *" : "")}><Input ref={inputRef} id="praxia-dialog-input" type={req.inputType ?? "text"} autoFocus value={value} onChange={(e) => setValue(e.target.value)} /></Field>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => close(req.kind === "confirm" ? false : null)}>Cancel</Button>
          <Button type="submit" variant={req.kind === "confirm" && req.danger ? "danger" : "primary"} disabled={!canSubmit}>{req.confirmLabel ?? "Confirm"}</Button>
        </div>
      </form>
    </Modal>
  );
}
