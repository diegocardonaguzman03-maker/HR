"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NAV } from "@/lib/nav";
import { useUi } from "@/lib/ui-store";
import { cn } from "@/lib/cn";
import { Wordmark } from "./Logo";

export function Sidebar({ approvals }: { approvals: number }) {
  const path = usePathname();
  const { collapsed, toggleSidebar } = useUi();
  const isActive = (href: string) => (href === "/" ? path === "/" : path === href || (path.startsWith(href + "/") && !NAV.some((n) => n.href !== href && n.href.startsWith(href + "/") && path.startsWith(n.href))));
  return (
    <aside className={cn("sticky top-0 flex h-dvh shrink-0 flex-col border-r border-hair bg-graphite transition-[width] duration-300 ease-out-soft", collapsed ? "w-[64px]" : "w-[232px]")}>
      <div className={cn("flex h-16 items-center border-b border-hair", collapsed ? "justify-center" : "px-4")}>
        <Link href="/" aria-label="PRAXIA Command Center home"><Wordmark collapsed={collapsed} /></Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Primary">
        {NAV.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative mb-0.5 flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] transition-colors duration-150",
                active ? "bg-graphite-3 text-ivory" : "text-niebla hover:bg-graphite-2 hover:text-ivory",
                collapsed && "justify-center",
              )}
            >
              {active && <span className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded bg-indigo" />}
              <Icon size={16} strokeWidth={1.6} className={active ? "text-indigo" : ""} />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && item.status === "planned" && <span className="font-mono text-[9px] tracking-wider text-mute uppercase">soon</span>}
              {item.href === "/approvals" && approvals > 0 && (
                <span className={cn("rounded-full bg-clay px-1.5 font-mono text-[10px] text-graphite", collapsed && "absolute top-0.5 right-0.5")}>{approvals}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <button onClick={toggleSidebar} className="flex h-11 items-center justify-center gap-2 border-t border-hair text-niebla hover:text-ivory" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {collapsed ? <PanelLeftOpen size={16} /> : <><PanelLeftClose size={16} /><span className="text-[12px]">Collapse</span></>}
      </button>
    </aside>
  );
}
