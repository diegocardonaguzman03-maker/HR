import { and, eq, sql } from "drizzle-orm";
import { approvals } from "@/server/db/schema";
import { getContext } from "@/server/context";
import { devOpenMode } from "@/server/auth";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { Toaster } from "@/components/shell/Toaster";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { db, includeDemo } = await getContext();
  const [{ n }] = (await db
    .select({ n: sql<number>`count(*)` })
    .from(approvals)
    .where(and(eq(approvals.status, "pending"), includeDemo ? undefined : eq(approvals.isDemo, false)))) as [{ n: number }];
  return (
    <div className="flex min-h-dvh">
      <Sidebar approvals={n} />
      <div className="min-w-0 flex-1">
        <Topbar includeDemo={includeDemo} approvals={n} devOpen={devOpenMode()} />
        {includeDemo && (
          <div className="border-b border-clay/40 bg-clay/10 px-6 py-2 font-mono text-[11px] tracking-wider text-clay uppercase" role="note">
            Demo mode — fictional demonstration records are included and labelled. They are not real business performance.
          </div>
        )}
        <main className="px-glow min-h-[calc(100dvh-4rem)] px-6 py-8 lg:px-10">{children}</main>
      </div>
      <CommandPalette />
      <Toaster />
    </div>
  );
}
