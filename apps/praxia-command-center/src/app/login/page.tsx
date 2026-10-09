import { authConfig } from "@/server/auth";
import { LoginForm } from "./LoginForm";
import { AxisSymbol } from "@/components/shell/Logo";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const cfg = authConfig();
  const { next } = await searchParams;
  return (
    <main className="px-glow flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-start gap-4">
          <AxisSymbol size={52} />
          <div>
            <h1 className="font-display text-[34px] font-bold tracking-[-0.03em]">Praxia</h1>
            <div className="px-label mt-1">Command Center · Founder access</div>
          </div>
        </div>
        {cfg.configured ? (
          <LoginForm next={next ?? "/"} />
        ) : (
          <div className="rounded-xl border border-bad/50 bg-bad/10 p-4 text-[13px]">
            <div className="mb-1 font-semibold text-bad">Authentication not configured</div>
            {cfg.reason} Set them in the server environment (see <code>.env.example</code>). The app does not serve data in production without them.
          </div>
        )}
        <p className="mt-10 font-mono text-[10px] tracking-[0.2em] text-mute uppercase">Turn strategy into adoption.</p>
      </div>
    </main>
  );
}
