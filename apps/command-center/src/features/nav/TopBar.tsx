'use client';
import { territoryName } from '@/data/territories';
import { goTerritory } from '@/services/actions';
import { useUi } from '@/store/uiStore';
import { useWorld } from '@/store/worldStore';
import { Icon } from '@/components/ui/Icon';
import { cx, IconBtn } from '@/components/ui/primitives';

export function TopBar() {
  const conn = useWorld((s) => s.connection);
  const sel = useUi((s) => s.selection);
  const terr = useUi((s) => s.cameraTerritory);
  const chat = useUi((s) => s.chat);
  const ws = useUi((s) => s.workspace);
  const profile = useUi((s) => s.agentProfile);
  const os = useUi((s) => s.os);
  const u = useUi.getState();

  // Primitive selectors: re-render only when a count or name actually changes.
  const attention = useWorld((s) => {
    const agents = Object.values(s.world.agents);
    const waiting = agents.filter((a) => a.state === 'waiting').length;
    const pending = Object.values(s.world.decisions).filter((d) => d.status === 'pending').length;
    return Math.max(waiting, pending) + agents.filter((a) => a.state === 'blocked').length;
  });
  const unread = useWorld((s) => s.world.notifications.filter((n) => !n.read && n.priority === 'high').length);
  const selName = useWorld((s) =>
    sel?.kind === 'agent' ? s.world.agents[sel.id]?.name : sel?.kind === 'project' ? s.world.projects[sel.id]?.structure : sel?.kind === 'citadel' ? 'Command Citadel' : null,
  );
  const selProjectTerritory = useWorld((s) => (sel?.kind === 'project' ? s.world.projects[sel.id]?.territory : undefined));
  const selTerritory = sel?.kind === 'project' ? selProjectTerritory : sel?.kind === 'citadel' ? 'citadel' : terr;
  const level = chat || ws || profile || os ? 3 : sel ? 2 : 1;
  const l3 = chat ? 'Conversation' : ws ? 'Workspace' : profile ? 'Agent profile' : os ? 'Operating system' : null;

  const mode =
    conn.kind === 'claude'
      ? conn.status === 'connected'
        ? { text: 'LIVE · AGENTS RUN ON CLAUDE', cls: 'text-emerald-300 border-emerald-400/30' }
        : { text: 'CONNECTING TO CLAUDE…', cls: 'text-zinc-400 border-zinc-500/30' }
      : conn.kind === 'mock'
      ? { text: 'DEMO · SIMULATED ACTIVITY', cls: 'text-sky-300 border-sky-400/30' }
      : conn.status === 'connected'
        ? { text: 'LIVE · GATEWAY CONNECTED', cls: 'text-emerald-300 border-emerald-400/30' }
        : { text: conn.status === 'connecting' ? 'CONNECTING…' : 'OFFLINE · AGENTS IDLE', cls: 'text-zinc-400 border-zinc-500/30' };

  return (
    <header
      className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-16 items-center gap-3 px-3 pb-2 md:px-4"
      // soft scrim so controls stay legible over the bright diorama
      style={{ background: 'linear-gradient(to bottom, rgba(9,9,11,0.55), rgba(9,9,11,0.2) 60%, transparent)' }}
    >
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
          className={cx('rounded-md border bg-zinc-950/75 px-2 py-1 text-[9.5px] font-bold tracking-[0.16em] backdrop-blur-md', mode.cls)}
          title={conn.kind === 'mock' ? 'Agent activity is simulated by the in-browser demo engine. Click to switch modes.' : conn.detail}
        >
          <span className="hidden lg:inline">{mode.text}</span>
          <span className="lg:hidden">{conn.kind === 'mock' ? 'DEMO' : conn.status === 'connected' ? 'LIVE' : '…'}</span>
        </button>
        {attention > 0 && (
          <button
            type="button"
            onClick={() => u.openOs('today')}
            className="flex h-8 items-center gap-1.5 rounded-md border border-yellow-400/30 bg-zinc-950/75 px-2.5 text-[11px] font-semibold text-yellow-200 backdrop-blur-md hover:bg-zinc-900/85"
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
