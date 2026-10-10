"use client";
import { useActionState } from "react";
import { login } from "@/app/actions/session";
import { Button, Field, Input } from "@/components/ui/primitives";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <Field label="Password">
        <Input name="password" type="password" autoComplete="current-password" required autoFocus />
      </Field>
      {state?.error && <div className="text-[13px] text-bad" role="alert">{state.error}</div>}
      <Button variant="primary" disabled={pending} type="submit">{pending ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}
