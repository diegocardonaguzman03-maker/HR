'use client';
// The command center is a live, time-relative client app (seed data is relative
// to "now", the world is WebGL). Render it client-only to avoid hydration drift.
import dynamic from 'next/dynamic';

export const ClientApp = dynamic(() => import('./CommandCenter').then((m) => m.CommandCenter), {
  ssr: false,
  loading: () => (
    <main className="flex h-dvh items-center justify-center bg-[#0e0f12] text-[11px] tracking-[0.3em] text-zinc-600">FRANCISCO COMMAND CENTER</main>
  ),
});
