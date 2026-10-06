'use client';
// Clicking the Command Citadel opens Francisco's global operating system.
import { useMemo, useState } from 'react';
import { integrations } from '@/integrations/registry';
import { focusAgent, focusProject, openAgentChat, openAria } from '@/services/actions';
import { groupResults, RESULT_LABEL, search } from '@/services/search';
import { selectors } from '@/services/worldState';
import { useUi, type OsSection } from '@/store/uiStore';
import { dispatch, useWorld } from '@/store/worldStore';
import type { Priority } from '@/types/domain';
import { resultToItem } from '../command/commands';
import { DecisionButtons } from '../agents/AgentPanel';
import { MissionCard } from '../missions/MissionCard';
import { FileRow } from '../projects/FileRow';
import { NotificationList } from '../notifications/NotificationList';
import { Icon, type IconName } from '@/components/ui/Icon';
import { AgentAvatar, Btn, cx, Empty, IconBtn, PriorityBadge, Progress, ProjectStatusBadge, SectionTitle, StatusIndicator, timeAgo } from '@/components/ui/primitives';

const SECTIONS: { id: OsSection; label: string; icon: IconName }[] = [
  { id: 'today', label: 'Today', icon: 'target' },
  { id: 'sessions', label: 'Claude sessions', icon: 'link' },
  { id: 'priorities', label: 'Priorities', icon: 'alert' },
  { id: 'projects', label: 'Projects', icon: 'building' },
  { id: 'agents', label: 'Agents', icon: 'bot' },
  { id: 'conversations', label: 'Conversations', icon: 'chat' },
  { id: 'decisions', label: 'Decisions', icon: 'flag' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'inbox', label: 'Inbox', icon: 'inbox' },
  { id: 'files', label: 'Files', icon: 'file' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'search', label: 'Search', icon: 'search' },
  { id: 'system', label: 'System status', icon: 'database' },
];

const PRIO: Record<Priority, number> = { critical: 0, high: 1, normal: 2, low: 3 };

export function CommandOS({ section }: { section: OsSection }) {
  const u = useUi.getState();
  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <aside className="scrollbar-none flex shrink-0 gap-0.5 overflow-x-auto border-b border-white/8 p-2 md:w-48 md:flex-col md:overflow-visible md:border-b-0 md:border-r">
        <div className="hidden px-2 pb-3 pt-1 md:block">
          <div className="text-[9px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Command Citadel</div>
          <div className="text-sm font-semibold text-zinc-100">Francisco</div>
        </div>
        {SECTIONS.map((s) => (
          <button key={s.id} type="button" onClick={() => u.openOs(s.id)} className={cx('flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[12px]', section === s.id ? 'bg-[var(--accent)]/14 text-[var(--accent)]' : 'text-zinc-400 hover:bg-white/6 hover:text-zinc-200')}>
            <Icon name={s.icon} size={14} /> {s.label}
          </button>
        ))}
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/8 px-5 py-3">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-100">{SECTIONS.find((s) => s.id === section)?.label}</h2>
          <div className="flex gap-1">
            <Btn size="sm" variant="subtle" icon="sparkles" onClick={openAria}>Ask ARIA</Btn>
            <IconBtn icon="x" label="Close (Esc)" onClick={() => u.closeOs()} />
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <Section id={section} />
        </div>
      </div>
    </div>
  );
}

function Section({ id }: { id: OsSection }) {
  const world = useWorld((s) => s.world);
  const conn = useWorld((s) => s.connection);
  const u = useUi.getState();
  const [q, setQ] = useState('');
  const results = useMemo(() => groupResults(search(world, q)), [world, q]);

  switch (id) {
    case 'today': {
      const waiting = selectors.waitingAgents(world);
      const blocked = Object.values(world.agents).filter((a) => a.state === 'blocked');
      const since = Date.now() - 12 * 3600_000;
      const completedToday = world.activity.filter((a) => a.completed && a.ts > since).length;
      const atRisk = selectors.projectsAtRisk(world);
      const today = new Date().toDateString();
      const meetings = world.calendar.filter((c) => new Date(c.start).toDateString() === today);
      const docs = Object.values(world.files).filter((f) => f.agentId && f.updatedAt > since);
      const criticalRecruiting = Object.values(world.missions).filter((m) => m.projectId === 'p-ta' && m.level === 'critical' && m.status !== 'done');
      const cards: { n: number; label: string; tone: string; run: () => void }[] = [
        { n: waiting.length, label: 'agents waiting for decisions', tone: 'text-yellow-300', run: () => waiting[0] && focusAgent(waiting[0].id) },
        { n: completedToday, label: 'missions & tasks completed', tone: 'text-emerald-300', run: () => { u.setFeed(true); u.setFeedFilter('completed'); u.closeOs(); } },
        { n: atRisk.length, label: 'projects at risk', tone: 'text-orange-300', run: () => u.openOs('priorities') },
        { n: meetings.length, label: 'meetings today', tone: 'text-sky-300', run: () => u.openOs('calendar') },
        { n: criticalRecruiting.length, label: 'critical recruiting process', tone: 'text-rose-300', run: () => focusProject('p-ta') },
        { n: docs.length, label: 'deliverables ready for review', tone: 'text-violet-300', run: () => u.openOs('files') },
      ];
      return (
        <div className="space-y-5">
          <p className="text-[12.5px] text-zinc-400">What needs your attention right now.</p>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            {cards.map((c) => (
              <button key={c.label} type="button" onClick={c.run} className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-left hover:border-white/20">
                <div className={cx('font-mono text-2xl', c.tone)}>{c.n}</div>
                <div className="text-[11.5px] text-zinc-400">{c.label}</div>
              </button>
            ))}
          </div>
          {(waiting.length > 0 || blocked.length > 0) && (
            <div>
              <SectionTitle>Needs you</SectionTitle>
              <div className="space-y-2">
                {[...waiting, ...blocked].map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-lg bg-white/[0.035] p-3">
                    <AgentAvatar agent={a} size={30} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[12.5px] font-semibold text-zinc-100">{a.name} <StatusIndicator state={a.state} /></div>
                      <p className="truncate text-[11.5px] text-zinc-400">{a.state === 'waiting' ? a.waitingFor?.question : a.blockedReason}</p>
                    </div>
                    <Btn size="sm" variant="subtle" icon="crosshair" onClick={() => { u.closeOs(); focusAgent(a.id); }}>Take me there</Btn>
                    <Btn size="sm" variant="primary" icon="chat" onClick={() => openAgentChat(a.id)}>Respond</Btn>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    case 'sessions': {
      const sessions = Object.values(world.remote ?? {}).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      const tone: Record<string, string> = { working: 'text-emerald-300', needs_input: 'text-yellow-300', failed: 'text-red-300', review_ready: 'text-sky-300', idle: 'text-zinc-400', completed: 'text-zinc-400', unknown: 'text-zinc-500' };
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Btn variant="primary" icon="zap" onClick={() => u.openModal({ type: 'launchRemote' })}>LAUNCH REAL WORK</Btn>
            <Btn variant="outline" icon="history" onClick={() => dispatch({ type: 'remote.sync' })}>Refresh</Btn>
            <span className="text-[11px] text-zinc-500">{conn.detail}</span>
          </div>
          {conn.kind !== 'claude' && <Empty>Switch to Live — Claude (Settings) inside claude.ai to link your Claude Code sessions.</Empty>}
          {conn.kind === 'claude' && sessions.length === 0 && <Empty>No sessions linked yet. If this stays empty, connect “Claude Code Remote” in claude.ai Settings → Connectors and allow it for this page.</Empty>}
          {sessions.map((r) => {
            const p = world.projects[r.projectId];
            return (
              <div key={r.id} className="rounded-lg bg-white/[0.035] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-zinc-100">{r.title}</div>
                    <div className="text-[11px] text-zinc-500">{p?.name ?? '—'}{r.branch ? ` · ${r.branch}` : ''}{r.launchedHere ? ' · launched here' : ''}</div>
                  </div>
                  <span className={`shrink-0 text-[10.5px] font-bold uppercase tracking-wider ${tone[r.status] ?? 'text-zinc-400'}`}>{r.status.replace('_', ' ')}</span>
                </div>
                {r.needsAction && <p className="mt-1.5 rounded-md bg-yellow-400/8 px-2 py-1 text-[12px] text-yellow-100">Waiting for you: {r.needsAction}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 flex -space-x-1">{r.agentIds.map((id) => world.agents[id]).filter(Boolean).map((a) => <AgentAvatar key={a.id} agent={a} size={20} />)}</span>
                  <Btn size="sm" variant="primary" icon="chat" onClick={() => u.openChat(r.conversationId)}>Open chat</Btn>
                  <Btn size="sm" variant="subtle" icon="crosshair" onClick={() => { u.closeOs(); focusProject(r.projectId); }}>Map</Btn>
                  <Btn size="sm" variant="ghost" icon="zap" onClick={() => u.openModal({ type: 'launchRemote', projectId: r.projectId, agentIds: r.agentIds })}>New task</Btn>
                  <a href={`https://claude.ai/code/${r.id}`} target="_blank" rel="noreferrer" className="ml-auto text-[11px] text-[var(--accent)] hover:underline">Open in Claude ↗</a>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    case 'priorities': {
      const projects = Object.values(world.projects).filter((p) => p.status !== 'archived' && p.status !== 'completed').sort((a, b) => PRIO[a.priority] - PRIO[b.priority]);
      const critical = Object.values(world.missions).filter((m) => (m.level === 'critical' || world.projects[m.projectId]?.priority === 'critical') && m.status !== 'done');
      return (
        <div className="space-y-5">
          <div>
            <SectionTitle>Critical missions</SectionTitle>
            <div className="space-y-2">{critical.length ? critical.map((m) => <MissionCard key={m.id} mission={m} showProject />) : <Empty>No critical missions.</Empty>}</div>
          </div>
          <div>
            <SectionTitle>Projects by priority</SectionTitle>
            <ProjectList ids={projects.map((p) => p.id)} />
          </div>
        </div>
      );
    }
    case 'projects':
      return (
        <div className="space-y-3">
          <Btn variant="primary" icon="plus" onClick={() => u.openModal({ type: 'createProject' })}>NEW PROJECT</Btn>
          <ProjectList ids={Object.keys(world.projects)} />
        </div>
      );
    case 'agents':
      return (
        <div className="space-y-2">
          {Object.values(world.agents).map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-lg bg-white/[0.035] p-3">
              <AgentAvatar agent={a} size={30} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[12.5px] font-semibold tracking-wider text-zinc-100">{a.name} <StatusIndicator state={a.state} /></div>
                <p className="truncate text-[11.5px] text-zinc-400">{a.currentTask?.title ?? a.role}</p>
              </div>
              <Btn size="sm" variant="subtle" icon="crosshair" onClick={() => { u.closeOs(); focusAgent(a.id); }}>Locate</Btn>
              <Btn size="sm" variant="ghost" icon="chat" onClick={() => openAgentChat(a.id)}>Chat</Btn>
            </div>
          ))}
          <Btn variant="outline" icon="plus" onClick={() => u.openModal({ type: 'createAgent' })}>CREATE AGENT</Btn>
        </div>
      );
    case 'conversations':
      return (
        <div className="space-y-2">
          <Btn variant="primary" icon="plus" onClick={() => u.openModal({ type: 'createConversation' })}>NEW CONVERSATION</Btn>
          {Object.values(world.conversations).sort((a, b) => b.updatedAt - a.updatedAt).map((c) => {
            const a = world.agents[c.agentId];
            return (
              <button key={c.id} type="button" onClick={() => u.openChat(c.id)} className="flex w-full items-center gap-3 rounded-lg bg-white/[0.035] p-3 text-left hover:bg-white/[0.06]">
                {a && <AgentAvatar agent={a} size={28} />}
                <span className="flex-1 truncate text-[12.5px] text-zinc-100">{c.title}</span>
                <span className="text-[10.5px] text-zinc-500">{timeAgo(c.updatedAt)}</span>
              </button>
            );
          })}
        </div>
      );
    case 'decisions': {
      const ds = Object.values(world.decisions).sort((a, b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1) || b.requestedAt - a.requestedAt);
      return (
        <div className="space-y-2">
          {ds.map((d) => (
            <div key={d.id} className="rounded-lg bg-white/[0.035] p-3">
              <div className="flex items-start justify-between gap-2">
                <button type="button" className="text-left text-[13px] font-medium text-zinc-100 hover:underline" onClick={() => u.openModal({ type: 'decision', decisionId: d.id })}>{d.title}</button>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${d.status === 'pending' ? 'text-yellow-300' : d.status === 'approved' ? 'text-emerald-300' : 'text-zinc-400'}`}>{d.status}</span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-zinc-500">{d.projectId ? world.projects[d.projectId]?.name : ''} · {d.agentId ? world.agents[d.agentId]?.name : ''} · {timeAgo(d.requestedAt)}</p>
              <div className="mt-2"><DecisionButtons decisionId={d.id} compact /></div>
            </div>
          ))}
        </div>
      );
    }
    case 'calendar':
      return (
        <div className="space-y-2">
          <DemoNote>Calendar shows seed events. Connect Google Calendar or Microsoft 365 via the integration layer.</DemoNote>
          {[...world.calendar].sort((a, b) => a.start.localeCompare(b.start)).map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-lg bg-white/[0.035] p-3">
              <div className="w-20 shrink-0 font-mono text-[11px] text-zinc-400">{new Date(c.start).toLocaleDateString([], { weekday: 'short' })} {new Date(c.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] text-zinc-100">{c.title}</div>
                <div className="text-[11px] text-zinc-500">{c.durationMin} min{c.location ? ` · ${c.location}` : ''}</div>
              </div>
              {c.projectId && <Btn size="sm" variant="ghost" icon="building" onClick={() => { u.closeOs(); focusProject(c.projectId!); }}>Project</Btn>}
            </div>
          ))}
        </div>
      );
    case 'inbox':
      return (
        <div className="space-y-2">
          <DemoNote>Inbox shows seed messages. Connect Gmail or Microsoft 365 via the integration layer.</DemoNote>
          {world.inbox.map((m) => (
            <div key={m.id} className="rounded-lg bg-white/[0.035] p-3">
              <div className="flex justify-between text-[12.5px]"><span className="font-medium text-zinc-100">{m.from}</span><span className="text-[10.5px] text-zinc-500">{timeAgo(m.ts)}</span></div>
              <div className="text-[12px] text-zinc-300">{m.subject}</div>
              <p className="text-[11.5px] text-zinc-500">{m.preview}</p>
              <div className="mt-2 flex gap-1.5">
                <Btn size="sm" variant="subtle" icon="sparkles" onClick={() => u.openModal({ type: 'createConversation', request: `Draft a reply to ${m.from}: "${m.subject}"`, projectId: m.projectId ?? null })}>Delegate reply</Btn>
                {m.projectId && <Btn size="sm" variant="ghost" icon="building" onClick={() => { u.closeOs(); focusProject(m.projectId!); }}>Project</Btn>}
              </div>
            </div>
          ))}
        </div>
      );
    case 'files':
      return <div className="space-y-2">{Object.values(world.files).sort((a, b) => b.updatedAt - a.updatedAt).map((f) => <FileRow key={f.id} file={f} showProject />)}</div>;
    case 'notifications':
      return <NotificationList />;
    case 'search':
      return (
        <div className="space-y-4">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agents, projects, conversations, documents, decisions…  e.g. “OJT”" className="field w-full" />
          {q.length >= 2 && results.length === 0 && <Empty>No results for “{q}”.</Empty>}
          {results.map(([type, rs]) => (
            <div key={type}>
              <SectionTitle>{RESULT_LABEL[type]}</SectionTitle>
              {rs.map((r) => {
                const item = resultToItem(world, r);
                return (
                  <button key={item.id} type="button" onClick={() => { item.run(); if (!['conversation', 'message', 'file', 'decision'].includes(r.type)) u.closeOs(); }} className="flex w-full flex-col rounded-md px-2.5 py-1.5 text-left hover:bg-white/6">
                    <span className="text-[12.5px] text-zinc-100">{r.title}</span>
                    <span className="text-[11px] text-zinc-500">{r.subtitle}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      );
    case 'system':
      return (
        <div className="space-y-5">
          <div>
            <SectionTitle>Agent provider</SectionTitle>
            <div className="rounded-lg bg-white/[0.035] p-3 text-[12.5px]">
              <div className="flex justify-between"><span className="text-zinc-400">Provider</span><span className="text-zinc-100">{conn.label}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Status</span><span className="text-zinc-100">{conn.status}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Events this session</span><span className="font-mono text-zinc-100">{world.events.length}</span></div>
              <div className="mt-2"><Btn size="sm" variant="outline" icon="settings" onClick={() => u.openModal({ type: 'settings' })}>Configure provider</Btn></div>
            </div>
          </div>
          <div>
            <SectionTitle>Integrations</SectionTitle>
            <div className="grid gap-2 sm:grid-cols-2">
              {integrations.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-lg bg-white/[0.035] px-3 py-2">
                  <div>
                    <div className="text-[12.5px] text-zinc-100">{i.name}</div>
                    <div className="text-[10.5px] text-zinc-500">{i.category} · /integrations/{i.id}</div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{i.status === 'connected' ? 'connected' : 'not connected'}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10.5px] text-zinc-500">Adapters are wired server-side through the gateway (see README → “Connect a real AI provider”).</p>
          </div>
        </div>
      );
  }
}

function ProjectList({ ids }: { ids: string[] }) {
  const world = useWorld((s) => s.world);
  const u = useUi.getState();
  return (
    <div className="space-y-1.5">
      {ids.map((id) => world.projects[id]).filter(Boolean).map((p) => (
        <div key={p.id} className="flex items-center gap-3 rounded-lg bg-white/[0.035] px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><span className="truncate text-[12.5px] font-medium text-zinc-100">{p.name}</span><PriorityBadge priority={p.priority} /></div>
            <div className="mt-1 flex items-center gap-2"><ProjectStatusBadge status={p.status} /><div className="w-28"><Progress value={p.progress} tone="emerald" /></div><span className="text-[10.5px] text-zinc-500">{p.structure}</span></div>
          </div>
          <Btn size="sm" variant="subtle" icon="crosshair" onClick={() => { u.closeOs(); focusProject(p.id); }}>Map</Btn>
          <Btn size="sm" variant="ghost" icon="layers" onClick={() => u.openWorkspace(p.id)}>Open</Btn>
        </div>
      ))}
    </div>
  );
}

function DemoNote({ children }: { children: React.ReactNode }) {
  return <p className="rounded-md border border-sky-400/20 bg-sky-400/5 px-3 py-2 text-[11px] text-sky-200/80">{children}</p>;
}
