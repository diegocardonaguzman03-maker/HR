"use client";
import Link from "next/link";
import { useTransition } from "react";
import { Bell, LogOut, Search } from "lucide-react";
import { setDemoMode, logout } from "@/app/actions/session";
import { useUi, toast } from "@/lib/ui-store";
import { cn } from "@/lib/cn";

export function Topbar({ includeDemo, approvals, devOpen }: { includeDemo: boolean; approvals: number; devOpen: boolean }) {
  const setPalette = useUi((s) => s.setPalette);
  const [pending, start] = useTransition();
  return (
    <div className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-hair bg-graphite/85 px-6 backdrop-blur">
      <button
        onClick={() => setPalette(true)}
        className="flex w-full max-w-md items-center gap-2 rounded-lg border border-hair bg-graphite-2 px-3 py-2 text-left text-[13px] text-mute hover:border-niebla/40"
        aria-label="Search and commands"
      >
        <Search size={14} />
        <span className="flex-1">Search accounts, contacts, deals or jump to…</span>
        <kbd className="rounded border border-hair px-1.5 font-mono text-[10px] text-niebla">⌘K</kbd>
      </button>
      <div className="flex-1" />
      {devOpen && <span className="rounded-md border border-warn/40 bg-warn/10 px-2 py-1 font-mono text-[10px] tracking-wider text-warn uppercase" title="Set PRAXIA_ADMIN_PASSWORD and PRAXIA_SESSION_SECRET">Dev mode · no login</span>}
      <button
        disabled={pending}
        onClick={() => start(async () => { await setDemoMode(!includeDemo); toast.info(includeDemo ? "Demo data hidden. Showing real records only." : "Demo mode on. Demo records are fictional and labelled."); })}
        className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12px]", includeDemo ? "border-clay/60 bg-clay/10 text-clay" : "border-hair text-niebla hover:text-ivory")}
        aria-pressed={includeDemo}
      >
        <span className={cn("inline-block size-2 rounded-full", includeDemo ? "bg-clay" : "bg-hair")} />
        Demo data {includeDemo ? "on" : "off"}
      </button>
      <Link href="/approvals" className="relative rounded-lg p-2 text-niebla hover:bg-graphite-2 hover:text-ivory" aria-label={`${approvals} pending approvals`} title={`${approvals} pending approvals`}>
        <Bell size={17} />
        {approvals > 0 && <span className="absolute top-1 right-1 size-2 rounded-full bg-clay" />}
      </Link>
      <form action={logout}>
        <button className="rounded-lg p-2 text-niebla hover:bg-graphite-2 hover:text-ivory" aria-label="Sign out" title="Sign out"><LogOut size={16} /></button>
      </form>
    </div>
  );
}
