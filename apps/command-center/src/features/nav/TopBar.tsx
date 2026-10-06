'use client';
import { territoryName } from '@/data/territories';
import { goTerritory } from '@/services/actions';
import { useUi } from '@/store/uiStore';
import { useWorld } from '@/store/worldStore';
import { Icon } from '@/components/ui/Icon';
import { cx, IconBtn } from '@/components/ui/primitives';

export function TopBar() {
  const conn = useWorld((s) => s.connection);
  const world = useWorld((s) => s.world);
  const sel = useUi((s) => s.selection);
  const terr = useUi((s) => s.cameraTerritory);
  const chat = useUi((s) => s.chat);
  const ws = useUi((s) => s.workspace);
  const profile = useUi((s) => s.agentProfile);
  const os = useUi((s) => s.os);
  const u = useUi.getState();

  const waiting = Object.values(world.agents).filter((a) => a.state === 'waiting').length;
  const pending = Object.values(world.decisions).filter((d) => d.status === 'pending').length;
  const attention = Math.max(waiting, pending) + Object.values(world.agents).filter((a) => a.state === 'blocked').length;
  const unread = world.notifications.filter((n) => !n.read && n.priority === 'high').length;

  const selName =
    sel?.kind === 'agent' ? world.agents[sel.id]?.name : sel?.kind === 'project' ? world.projects[sel.id]?.structure : sel?.kind === 'citadel' ? 'Command Citadel' : null;
  const selTerritory = sel?.kind === 'project' ? world.projects[sel.id]?.territory : sel?.kind === 'citadel' ? 'citadel' : terr;
  const level = chat || ws || profile || os ? 3 : sel ? 2 : 1;
  const l3 = chat ? 'Conversation' : ws ? 'Workspace' : profile ? 'Agent profile' : os ? 'Operating system' : null;

  const mode =
    conn.kind === 'mock'
      ? { text: 'DEMO · SIMULATED ACTIVITY', cls: 'text-sky-300 border-sky-400/30 bg-sky-400/8' }
      : conn.status === 'connected'
        ? { text: 'LIVE · GATEWAY CONNECTED', cls: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/8' }
        : { text: conn.status === 'connecting' ? 'CONNECTING…' : 'OFFLINE · AGENTS IDLE', cls: 'text-zinc-400 border-zinc-500/30' };

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-14 items-center gap-3 px-3 md:px-4">
      <div className="pointer-events-auto flex min-w-0 items-center gap-3">
        <button type="button" onClick={() => { u.select(null); u.focus({ type: 'world' }); }} className="flex items-center gap-2" title="Zoom out to the world">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]">
            <Icon name="crosshair" size={16} />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-[11px] font-bold tracking-[0.22em] text-zinc-100">FRANCISCO</span>
            <span className="block text-[9px] font-semibold tracking-[0.3em] text-zinc-500">COMMAND CENTER</span>
          </span>
        </button>
        <nav aria-label="Location" className="glass hidden min-w-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-400 md:flex">
          <span className="mr-1 rounded bg-white/8 px-1 text-[9px] font-bold text-zinc-300" title="Level 1 = World · 2 = Project/Agent · 3 = Workspace/Conversation">L{level}</span>
          <button type="button" className="hover:text-zinc-100" onClick={() => { u.select(null); u.focus({ type: 'world' }); }}>World</button>
          {selTerritory && (
            <>
              <Icon name="chevronRight" size={12} />
              <button type="button" className="truncate hover:text-zinc-100" onClick={() => goTerritory(selTerritory)}>{territoryName(selTerritory)}</button>
            </>
          )}
          {selName && (
            <>
              <Icon name="chevronRight" size={12} />
              <span className="truncate text-zinc-200">{selName}</span>
            </>
          )}
          {l3 && (
            <>
              <Icon name="chevronRight" size={12} />
              <span className="text-[var(--accent)]">{l3}</span>
            </>
          )}
        </nav>
      </div>
      <div className="flex-1" />
      <div className="pointer-events-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => u.openModal({ type: 'settings' })}
          className={cx('rounded-md border px-2 py-1 text-[9.5px] font-bold tracking-[0.16em]', mode.cls)}
          title={conn.kind === 'mock' ? 'Agent activity is simulated by the in-browser demo engine. Click to connect a real provider.' : conn.detail}
        >
          <span className="hidden lg:inline">{mode.text}</span>
          <span className="lg:hidden">{conn.kind === 'mock' ? 'DEMO' : conn.status === 'connected' ? 'LIVE' : 'OFFLINE'}</span>
        </button>
        {attention > 0 && (
          <button
            type="button"
            onClick={() => u.openOs('today')}
            className="flex h-8 items-center gap-1.5 rounded-md border border-yellow-400/30 bg-yellow-400/10 px-2.5 text-[11px] font-semibold text-yellow-200 hover:bg-yellow-400/15"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-300" />
            {attention} need{attention === 1 ? 's' : ''} you
          </button>
        )}
        <button
          type="button"
          onClick={() => u.setPalette(true)}
          className="glass hidden h-8 items-center gap-2 rounded-md px-2.5 text-[11px] text-zinc-400 hover:text-zinc-200 sm:flex"
        >
          <Icon name="search" size={14} />
          <span>Search or command</span>
          <kbd className="rounded bg-white/8 px-1 text-[10px] text-zinc-400">⌘K</kbd>
        </button>
        <IconBtn icon="search" label="Search" className="sm:hidden" onClick={() => u.setPalette(true)} />
        <IconBtn icon="bell" label="Notifications" badge={unread} onClick={() => u.openDrawer('notifications')} />
      </div>
    </header>
  );
}
