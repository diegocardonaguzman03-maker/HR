import { createRoot } from "react-dom/client";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { and, eq, sql } from "drizzle-orm";
import { approvals, companySettings } from "@/server/db/schema";
import { seedBase } from "@/server/seed/base";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { Toaster } from "@/components/shell/Toaster";
import { AxisSymbol } from "@/components/shell/Logo";
import { boot, getRuntime } from "./runtime";
import { nav } from "./router";
import { NotFoundSignal, RedirectSignal } from "./shims/next-navigation";
import { cookies } from "./shims/next-headers";

import Overview from "@/app/(app)/page";
import World from "@/app/(app)/world/page";
import Sales from "@/app/(app)/sales/page";
import Crm from "@/app/(app)/crm/page";
import Orgs from "@/app/(app)/crm/organizations/page";
import Org from "@/app/(app)/crm/organizations/[id]/page";
import Contacts from "@/app/(app)/crm/contacts/page";
import Contact from "@/app/(app)/crm/contacts/[id]/page";
import Opp from "@/app/(app)/crm/opportunities/[id]/page";
import Proposal from "@/app/(app)/proposals/[id]/page";
import PrintProposal from "@/app/print/proposals/[id]/page";
import Projects from "@/app/(app)/projects/page";
import Finance from "@/app/(app)/finance/page";
import ContractP from "@/app/(app)/finance/contracts/[id]/page";
import Invoices from "@/app/(app)/finance/invoices/page";
import NewInvoice from "@/app/(app)/finance/invoices/new/page";
import InvoiceP from "@/app/(app)/finance/invoices/[id]/page";
import Expenses from "@/app/(app)/finance/expenses/page";
import Fx from "@/app/(app)/finance/fx/page";
import Agents from "@/app/(app)/agents/page";
import AgentP from "@/app/(app)/agents/[id]/page";
import Tasks from "@/app/(app)/tasks/page";
import Approvals from "@/app/(app)/approvals/page";
import Integrations from "@/app/(app)/integrations/page";
import Settings from "@/app/(app)/settings/page";
import Audit from "@/app/(app)/settings/audit/page";
import Outreach from "@/app/(app)/outreach/page";
import Marketing from "@/app/(app)/marketing/page";
import Knowledge from "@/app/(app)/knowledge/page";
import Analytics from "@/app/(app)/analytics/page";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PageFn = (props: any) => ReactNode | Promise<ReactNode>;
const ROUTES: [string, PageFn][] = [
  ["/", Overview], ["/world", World], ["/sales", Sales], ["/crm", Crm], ["/crm/organizations", Orgs], ["/crm/organizations/:id", Org],
  ["/crm/contacts", Contacts], ["/crm/contacts/:id", Contact], ["/crm/opportunities/:id", Opp], ["/proposals/:id", Proposal],
  ["/print/proposals/:id", PrintProposal], ["/projects", Projects], ["/finance", Finance], ["/finance/contracts/:id", ContractP],
  ["/finance/invoices", Invoices], ["/finance/invoices/new", NewInvoice], ["/finance/invoices/:id", InvoiceP], ["/finance/expenses", Expenses],
  ["/finance/fx", Fx], ["/agents", Agents], ["/agents/:id", AgentP], ["/tasks", Tasks], ["/approvals", Approvals], ["/integrations", Integrations],
  ["/settings", Settings], ["/settings/audit", Audit], ["/outreach", Outreach], ["/marketing", Marketing], ["/knowledge", Knowledge], ["/analytics", Analytics],
];

function match(path: string): { page: PageFn; params: Record<string, string> } | null {
  const segs = path.split("/").filter(Boolean);
  for (const [pattern, page] of ROUTES) {
    const ps = pattern.split("/").filter(Boolean);
    if (ps.length !== segs.length) continue;
    const params: Record<string, string> = {};
    if (ps.every((p, i) => (p.startsWith(":") ? ((params[p.slice(1)] = decodeURIComponent(segs[i]!)), true) : p === segs[i]))) return { page, params };
  }
  return null;
}

function usePageElement() {
  const s = useSyncExternalStore(nav.subscribe, nav.state);
  const [el, setEl] = useState<ReactNode>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    const m = match(s.path);
    if (!m) { setEl(null); setErr("This page does not exist."); return; }
    const sp = Object.fromEntries(new URLSearchParams(s.search));
    Promise.resolve()
      .then(() => m.page({ params: Promise.resolve(m.params), searchParams: Promise.resolve(sp) }))
      .then((node) => { if (live) { setEl(node); setErr(null); } })
      .catch((e) => {
        if (!live) return;
        if (e instanceof RedirectSignal) return nav.replace(e.to);
        if (e instanceof NotFoundSignal) { setEl(null); setErr("Record not found."); return; }
        console.error(e);
        setErr(e?.message ?? "Something went wrong loading this page.");
      });
    return () => { live = false; };
  }, [s.path, s.search, s.version]);
  return { el, err, path: s.path, version: s.version };
}

function Shell() {
  const { el, err, path, version } = usePageElement();
  const [pending, setPending] = useState(0);
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    (async () => {
      const includeDemo = (await cookies()).get("praxia_demo")?.value === "1";
      setDemo(includeDemo);
      const [{ n }] = (await getRuntime().db.select({ n: sql<number>`count(*)` }).from(approvals).where(and(eq(approvals.status, "pending"), includeDemo ? undefined : eq(approvals.isDemo, false)))) as [{ n: number }];
      setPending(n);
    })();
  }, [version]);
  const print = path.startsWith("/print/");
  const rt = getRuntime();
  return (
    <div className="flex min-h-dvh">
      {!print && <Sidebar approvals={pending} />}
      <div className="min-w-0 flex-1">
        {!print && <Topbar includeDemo={demo} approvals={pending} devOpen={false} />}
        {rt.storage === "browser" && <div className="border-b border-hair bg-graphite-2 px-6 py-2 font-mono text-[11px] tracking-wider text-niebla uppercase" role="note">Standalone mode — data is saved only in this browser (localStorage). Clearing site data erases it.</div>}
        {!rt.persisted && <div className="border-b border-warn/40 bg-warn/10 px-6 py-2 font-mono text-[11px] tracking-wider text-warn uppercase" role="note">Not connected to the Artifact database — changes in this view are not saved.</div>}
        {demo && !print && <div className="border-b border-clay/40 bg-clay/10 px-6 py-2 font-mono text-[11px] tracking-wider text-clay uppercase" role="note">Demo mode — fictional demonstration records are included and labelled. They are not real business performance.</div>}
        <main className={print ? "" : "px-glow min-h-[calc(100dvh-4rem)] px-4 py-8 sm:px-6 lg:px-10"}>
          {err ? <div className="px-card mx-auto max-w-xl p-6 text-[14px]"><div className="mb-2 font-display text-[18px] font-semibold">Can't show this page</div><p className="text-niebla">{err}</p><button className="mt-4 text-indigo-soft hover:underline" onClick={() => nav.push("/")}>Back to overview</button></div> : el}
        </main>
      </div>
      <CommandPalette />
      <Toaster />
    </div>
  );
}

function Setup({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <main className="px-glow flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md">
        <AxisSymbol size={48} />
        <h1 className="mt-4 font-display text-[28px] font-bold tracking-[-0.03em]">Set up the Command Center</h1>
        <p className="mt-2 text-[14px] text-niebla">This workspace has no configuration yet. Initializing creates the 28-agent registry, the 12 pipeline stages, the 7 editable services and default settings. It creates no clients, revenue or activity.</p>
        <button disabled={busy} onClick={async () => { setBusy(true); await seedBase(getRuntime().db); await getRuntime().flush(); onDone(); }} className="mt-6 rounded-lg bg-indigo px-4 py-2 text-[14px] font-medium text-ivory disabled:opacity-50">{busy ? "Initializing…" : "Initialize workspace"}</button>
      </div>
    </main>
  );
}

function App() {
  const [phase, setPhase] = useState<"boot" | "setup" | "ready" | "error">("boot");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    boot()
      .then(async (rt) => {
        const s = await rt.db.select().from(companySettings);
        nav.restore();
        setPhase(s.length ? "ready" : "setup");
      })
      .catch((e) => { console.error(e); setMsg(String(e?.message ?? e)); setPhase("error"); });
  }, []);
  if (phase === "boot") return <div className="flex min-h-dvh items-center justify-center"><div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-niebla uppercase"><AxisSymbol size={28} />Loading Command Center…</div></div>;
  if (phase === "error") return <div className="p-8 text-bad">Could not start: {msg}</div>;
  if (phase === "setup") return <Setup onDone={() => setPhase("ready")} />;
  return <Shell />;
}

createRoot(document.getElementById("praxia-root")!).render(<App />);
