'use client';
// Roster drawers opened from the global navigation.
import { motion } from 'framer-motion';
import { useState } from 'react';
import { focusAgent, focusProject, openAgentChat } from '@/services/actions';
import { useUi, type DrawerKind } from '@/store/uiStore';
import { useWorld } from '@/store/worldStore';
import type { ProjectStatus } from '@/types/domain';
import { territoryName } from '@/data/territories';
import { MissionCard } from '../missions/MissionCard';
import { FileRow } from '../projects/FileRow';
import { NotificationList } from '../notifications/NotificationList';
import { AgentAvatar, Btn, cx, IconBtn, PriorityBadge, Progress, ProjectStatusBadge, StatusIndicator, timeAgo } from '@/components/ui/primitives';

const TITLES: Record<DrawerKind, string> = {
  agents: 'Agents',
  projects: 'Projects',
  conversations: 'Conversations',
  files: 'Files',
  missions: 'Missions',
  notifications: 'Notifications',
  decisions: 'Decisions',
};

export function Drawer({ kind }: { kind: DrawerKind }) {
  const u = useUi.getState();
  return (
    <motion.aside
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.16 }}
      className="glass-solid pointer-events-auto absolute inset-x-0 bottom-[56px] top-14 z-40 flex flex-col rounded-t-2xl md:inset-x-auto md:bottom-3 md:left-[68px] md:top-16 md:w-[360px] md:rounded-xl"
      aria-label={TITLES[kind]}
    >
      <header className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-300">{TITLES[kind]}</h2>
        <IconBtn icon="x" label="Close" onClick={() => u.openDrawer(null)} />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <Body kind={kind} />
      </div>
    </motion.aside>
  );
}

function Body({ kind }: { kind: DrawerKind }) {
  const world = useWorld((s) => s.world);
  const u = useUi.getState();
  const [filter, setFilter] = useState<'all' | ProjectStatus>('all');
  switch (kind) {
    case 'agents':
      return (
        <div className="space-y-1.5">
          {Object.values(world.agents).map((a) => (
            <div key={a.id} className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-white/5">
              <button type="button" onClick={() => focusAgent(a.id)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                <AgentAvatar agent={a} size={30} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider text-zinc-100">{a.name}<StatusIndicator state={a.state} compact /></div>
                  <div className="truncate text-[11px] text-zinc-500">{a.currentTask?.title ?? a.role}</div>
                </div>
              </button>
              <IconBtn icon="chat" label={`Chat with ${a.name}`} onClick={() => openAgentChat(a.id)} />
            </div>
          ))}
          <Btn variant="outline" icon="plus" className="mt-2 w-full" onClick={() => u.openModal({ type: 'createAgent' })}>CREATE AGENT</Btn>
        </div>
      );
    case 'projects': {
      const ps = Object.values(world.projects).filter((p) => filter === 'all' || p.status === filter);
      return (
        <div className="space-y-1.5">
          <div className="scrollbar-none mb-2 flex gap-1 overflow-x-auto">
            {(['all', 'active', 'paused', 'blocked', 'completed', 'archived'] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={cx('shrink-0 rounded-full px-2 py-0.5 text-[10.5px] capitalize', filter === f ? 'bg-[var(--accent)]/18 text-[var(--accent)]' : 'text-zinc-500 hover:text-zinc-300')}>{f}</button>
            ))}
          </div>
          {ps.map((p) => (
            <button key={p.id} type="button" onClick={() => focusProject(p.id)} className="w-full rounded-lg px-2.5 py-2 text-left hover:bg-white/5">
              <div className="flex items-center justify-between gap-2"><span className="truncate text-[12.5px] font-medium text-zinc-100">{p.name}</span><PriorityBadge priority={p.priority} /></div>
              <div className="mt-0.5 flex items-center gap-2 text-[10.5px] text-zinc-500"><ProjectStatusBadge status={p.status} /> {territoryName(p.territory)}</div>
              <div className="mt-1.5"><Progress value={p.progress} tone="emerald" /></div>
            </button>
          ))}
          <Btn variant="outline" icon="plus" className="mt-2 w-full" onClick={() => u.openModal({ type: 'createProject' })}>NEW PROJECT</Btn>
        </div>
      );
    }
    case 'conversations':
      return (
        <div className="space-y-1">
          {Object.values(world.conversations).sort((a, b) => b.updatedAt - a.updatedAt).map((c) => {
            const a = world.agents[c.agentId];
            const last = world.messages[c.messageIds[c.messageIds.length - 1]];
            return (
              <button key={c.id} type="button" onClick={() => u.openChat(c.id)} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-white/5">
                {a && <AgentAvatar agent={a} size={28} />}
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2 text-[12px]"><span className="truncate text-zinc-100">{c.title}</span><span className="shrink-0 text-[10px] text-zinc-500">{timeAgo(c.updatedAt)}</span></div>
                  <div className="truncate text-[11px] text-zinc-500">{last?.text ?? '—'}</div>
                </div>
              </button>
            );
          })}
          <Btn variant="outline" icon="plus" className="mt-2 w-full" onClick={() => u.openModal({ type: 'createConversation' })}>NEW CONVERSATION</Btn>
        </div>
      );
    case 'files':
      return <div className="space-y-1.5">{Object.values(world.files).sort((a, b) => b.updatedAt - a.updatedAt).map((f) => <FileRow key={f.id} file={f} showProject />)}</div>;
    case 'missions': {
      const ms = Object.values(world.missions).filter((m) => m.status !== 'done').sort((a, b) => a.deadline.localeCompare(b.deadline));
      return <div className="space-y-2">{ms.map((m) => <button key={m.id} type="button" className="block w-full text-left" onClick={() => u.openWorkspace(m.projectId, 'missions')}><MissionCard mission={m} showProject /></button>)}</div>;
    }
    case 'notifications':
      return <NotificationList />;
    case 'decisions':
      return null;
  }
}
