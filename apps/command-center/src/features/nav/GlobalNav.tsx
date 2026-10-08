'use client';
import { useState } from 'react';
import { focusCitadel } from '@/services/actions';
import { useUi, type DrawerKind } from '@/store/uiStore';
import { useWorld } from '@/store/worldStore';
import { Icon, type IconName } from '@/components/ui/Icon';
import { cx, IconBtn } from '@/components/ui/primitives';

type Item = { id: string; icon: IconName; label: string; run: () => void; active?: boolean; badge?: number };

export function useNavItems(): Item[] {
  const u = useUi.getState();
  const drawer = useUi((s) => s.drawer);
  const os = useUi((s) => s.os);
  const unread = useWorld((s) => s.world.notifications.filter((n) => !n.read).length);
  const waiting = useWorld((s) => Object.values(s.world.agents).filter((a) => a.state === 'waiting').length);
  const d = (k: DrawerKind) => () => u.openDrawer(k);
  return [
    { id: 'home', icon: 'home', label: 'Command Center', run: () => { focusCitadel(); u.openOs('today'); }, active: !!os, badge: waiting },
    { id: 'world', icon: 'map', label: 'World', run: () => { u.select(null); u.closeOs(); u.openDrawer(null); u.focus({ type: 'world' }); } },
    { id: 'agents', icon: 'bot', label: 'Agents', run: d('agents'), active: drawer === 'agents' },
    { id: 'projects', icon: 'building', label: 'Projects', run: d('projects'), active: drawer === 'projects' },
    { id: 'conversations', icon: 'chat', label: 'Conversations', run: d('conversations'), active: drawer === 'conversations' },
    { id: 'files', icon: 'file', label: 'Files', run: d('files'), active: drawer === 'files' },
    { id: 'missions', icon: 'target', label: 'Missions', run: d('missions'), active: drawer === 'missions' },
    { id: 'notifications', icon: 'bell', label: 'Notifications', run: d('notifications'), active: drawer === 'notifications', badge: unread },
    { id: 'search', icon: 'search', label: 'Search (⌘K)', run: () => u.setPalette(true) },
  ];
}

export function GlobalNav() {
  const items = useNavItems();
  const collapsed = useUi((s) => s.navCollapsed);
  const u = useUi.getState();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <nav aria-label="Global" className="pointer-events-auto absolute left-3 top-1/2 z-30 hidden -translate-y-1/2 md:block">
      <div className="glass flex flex-col items-center gap-0.5 rounded-xl p-1">
        {(collapsed ? items.slice(0, 2) : items).map((i) => (
          <IconBtn key={i.id} icon={i.icon} label={i.label} active={i.active} badge={i.badge} onClick={i.run} />
        ))}
        <div className="my-1 h-px w-6 bg-white/10" />
        <div className="relative">
          <IconBtn icon="plus" label="Create" active={createOpen} onClick={() => setCreateOpen((v) => !v)} />
          {createOpen && (
            <div className="glass-solid absolute left-11 top-0 w-48 rounded-lg p-1" onMouseLeave={() => setCreateOpen(false)}>
              {([
                ['building', 'New project', () => u.openModal({ type: 'createProject' })],
                ['chat', 'New conversation', () => u.openModal({ type: 'createConversation' })],
                ['bot', 'New agent', () => u.openModal({ type: 'createAgent' })],
              ] as const).map(([icon, label, run]) => (
                <button key={label} type="button" onClick={() => { setCreateOpen(false); run(); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-zinc-200 hover:bg-white/8">
                  <Icon name={icon} size={15} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>
        {!collapsed && (
          <>
            <IconBtn icon="user" label="Profile" onClick={() => u.openModal({ type: 'profile' })} />
            <IconBtn icon="settings" label="Settings" onClick={() => u.openModal({ type: 'settings' })} />
          </>
        )}
        <button type="button" onClick={() => u.setNavCollapsed(!collapsed)} className="mt-0.5 flex h-5 w-9 items-center justify-center rounded text-zinc-600 hover:text-zinc-300" aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}>
          <Icon name={collapsed ? 'chevronDown' : 'chevronUp'} size={13} />
        </button>
      </div>
    </nav>
  );
}

/** Mobile: bottom tab bar with the most important destinations. */
export function MobileNav() {
  const items = useNavItems();
  const u = useUi.getState();
  const pick = ['home', 'world', 'agents', 'projects', 'notifications'];
  return (
    <nav aria-label="Global" className="glass-solid pointer-events-auto absolute inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/8 px-1 pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.filter((i) => pick.includes(i.id)).map((i) => (
        <button key={i.id} type="button" onClick={i.run} className={cx('relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[9.5px] font-medium', i.active ? 'text-[var(--accent)]' : 'text-zinc-400')}>
          <Icon name={i.icon} size={19} />
          {i.label.replace(' (⌘K)', '').replace('Command Center', 'Command')}
          {!!i.badge && <span className="absolute right-[calc(50%-16px)] top-1 h-2 w-2 rounded-full bg-[var(--accent)]" />}
        </button>
      ))}
      <button type="button" onClick={() => u.openModal({ type: 'createConversation' })} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[9.5px] font-medium text-zinc-400">
        <Icon name="plus" size={19} /> Create
      </button>
    </nav>
  );
}
