"use client";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/nav";
import { useUi } from "@/lib/ui-store";
import { globalSearch, type SearchHit } from "@/app/actions/session";

const CREATE = [
  { label: "New organization", href: "/crm/organizations?new=1" },
  { label: "New contact", href: "/crm/contacts?new=1" },
  { label: "New opportunity", href: "/crm?new=1" },
  { label: "Record expense", href: "/finance/expenses?new=1" },
  { label: "New invoice", href: "/finance/invoices/new" },
  { label: "Add exchange rate", href: "/finance/fx" },
];

export function CommandPalette() {
  const { paletteOpen, setPalette } = useUi();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(!useUi.getState().paletteOpen); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPalette]);

  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    const t = setTimeout(() => globalSearch(q).then(setHits).catch(() => setHits([])), 180);
    return () => clearTimeout(t);
  }, [q]);

  const go = (href: string) => { setPalette(false); setQ(""); router.push(href); };
  const item = "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-[13px] text-niebla aria-selected:bg-graphite-3 aria-selected:text-ivory";

  return (
    <Dialog.Root open={paletteOpen} onOpenChange={setPalette}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-[14vh] left-1/2 z-50 w-[min(640px,92vw)] -translate-x-1/2 overflow-hidden rounded-xl border border-hair bg-graphite-2 shadow-2xl">
          <Dialog.Title className="sr-only">Search and commands</Dialog.Title>
          <Command shouldFilter={false} label="Command palette">
            <Command.Input value={q} onValueChange={setQ} autoFocus placeholder="Search records or type a command…" className="w-full border-b border-hair bg-transparent px-4 py-3.5 text-[14px] outline-none placeholder:text-mute" />
            <Command.List className="max-h-[52vh] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-6 text-[13px] text-mute">No matches.</Command.Empty>
              {hits.length > 0 && (
                <Command.Group heading="Records" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:px-label">
                  {hits.map((h) => (
                    <Command.Item key={h.type + h.id} value={h.type + h.id} onSelect={() => go(h.href)} className={item}>
                      <span className="w-20 font-mono text-[10px] uppercase text-mute">{h.type}</span>
                      <span className="flex-1 truncate text-ivory">{h.label}</span>
                      {h.isDemo && <span className="font-mono text-[9px] text-clay">DEMO</span>}
                      <span className="truncate text-[12px] text-mute">{h.sub}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
              <Command.Group heading="Go to" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:px-label">
                {NAV.filter((n) => !q || n.label.toLowerCase().includes(q.toLowerCase())).map((n) => (
                  <Command.Item key={n.href} value={"nav" + n.href} onSelect={() => go(n.href)} className={item}>
                    <n.icon size={14} /> {n.label} {n.status === "planned" && <span className="ml-auto font-mono text-[9px] text-mute">PLANNED</span>}
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="Create" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:px-label">
                {CREATE.filter((c) => !q || c.label.toLowerCase().includes(q.toLowerCase())).map((c) => (
                  <Command.Item key={c.href} value={"create" + c.href} onSelect={() => go(c.href)} className={item}>+ {c.label}</Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
