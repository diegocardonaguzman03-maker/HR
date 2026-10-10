"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button, Field, Input } from "@/components/ui/primitives";
import { setPrivacyNoticeAction } from "@/app/actions/privacy";
import { toast } from "@/lib/ui-store";

export function PrivacyNoticeForm({ version, url }: { version: string | null; url: string | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <form className="grid gap-3 md:grid-cols-[160px_1fr_auto] md:items-end" onSubmit={(e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      start(async () => { const r = await setPrivacyNoticeAction(String(f.get("version")), String(f.get("url"))); if (r.ok) { toast.ok("Privacy notice recorded."); router.refresh(); } else toast.bad(r.error); });
    }}>
      <Field label="Version"><Input name="version" defaultValue={version ?? ""} placeholder="1.0" required /></Field>
      <Field label="Public link"><Input name="url" type="url" defaultValue={url ?? ""} placeholder="https://…/aviso-de-privacidad" required /></Field>
      <Button variant="primary" disabled={pending} type="submit">Save</Button>
    </form>
  );
}
