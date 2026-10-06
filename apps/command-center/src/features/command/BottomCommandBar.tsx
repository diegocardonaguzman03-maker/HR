'use client';
// RTS-style contextual command bar. Its buttons change with the selection.
// Hotkeys 1–7 trigger the buttons (when no text field is focused).
import { focusCitadel, openAgentChat, openAria } from '@/services/actions';
import { useUi } from '@/store/uiStore';
import { dispatch, useWorld } from '@/store/worldStore';
import { Icon, type IconName } from '@/components/ui/Icon';
import { AgentAvatar, cx, StatusIndicator } from '@/components/ui/primitives';

export interface BarCommand {
  label: string;
  icon: IconName;
  run: () => void;
  primary?: boolean;
}

/** Latest command set — read by the global hotkey handler. */
export let currentBarCommands: BarCommand[] = [];

export function BottomCommandBar() {
  const sel = useUi((s) => s.selection);
  const selAgent = useWorld((s) => (sel?.kind === 'agent' ? s.world.agents[sel.id] : undefined));
  const selProject = useWorld((s) => (sel?.kind === 'project' ? s.world.projects[sel.id] : undefined));
  const homeExists = useWorld((s) => !!selAgent && selAgent.homeProjectId in s.world.projects);
  const u = useUi.getState();

  let title: React.ReactNode = (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/12 text-[var(--accent)]">
        <Icon name="home" size={16} />
      </span>
      <div className="leading-tight">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Nothing selected</div>
        <div className="text-xs font-semibold text-zinc-200">Command Center</div>
      </div>
    </div>
  );
  let cmds: BarCommand[];

  if (selAgent) {
    const a = selAgent;
    const pid = a.currentTask?.projectId ?? (homeExists ? a.homeProjectId : null);
    title = (
      <div className="flex min-w-0 items-center gap-2">
        <AgentAvatar agent={a} size={32} />
        <div className="min-w-0 leading-tight">
          <div className="text-xs font-bold tracking-wider text-zinc-100">{a.name}</div>
          <StatusIndicator state={a.state} />
        </div>
      </div>
    );
    cmds = [
      { label: 'Chat', icon: 'chat', run: () => openAgentChat(a.id), primary: true },
      { label: 'Assign mission', icon: 'target', run: () => u.openModal({ type: 'assignTask', agentId: a.id, projectId: pid ?? undefined }) },
      ...(pid ? [{ label: 'Project', icon: 'building' as IconName, run: () => u.openWorkspace(pid) }] : []),
      { label: 'Files', icon: 'file', run: () => u.openAgentProfile(a.id, 'files') },
      { label: 'History', icon: 'history', run: () => u.openAgentProfile(a.id, 'activity') },
      a.state === 'paused'
        ? { label: 'Resume', icon: 'play', run: () => dispatch({ type: 'agent.resume', agentId: a.id }) }
        : { label: 'Pause', icon: 'pause', run: () => dispatch({ type: 'agent.pause', agentId: a.id }) },
    ];
  } else if (selProject) {
    const p = selProject;
    title = (
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/6 text-zinc-300">
          <Icon name="building" size={16} />
        </span>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-xs font-bold text-zinc-100">{p.structure}</div>
          <div className="truncate text-[10.5px] text-zinc-500">{p.name}</div>
        </div>
      </div>
    );
    const lead = p.agentIds[0];
    cmds = [
      { label: 'Open', icon: 'layers', run: () => u.openWorkspace(p.id), primary: true },
      { label: 'Agents', icon: 'users', run: () => u.openWorkspace(p.id, 'agents') },
      { label: 'Missions', icon: 'target', run: () => u.openWorkspace(p.id, 'missions') },
      { label: 'Files', icon: 'file', run: () => u.openWorkspace(p.id, 'files') },
      { label: 'Chat', icon: 'chat', run: () => (lead ? openAgentChat(lead, p.id) : u.openModal({ type: 'createConversation', projectId: p.id })) },
      { label: 'Metrics', icon: 'activity', run: () => u.openWorkspace(p.id, 'metrics') },
    ];
  } else if (sel?.kind === 'citadel') {
    title = (
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]"><Icon name="crosshair" size={16} /></span>
        <div className="leading-tight">
          <div className="text-xs font-bold text-zinc-100">Command Citadel</div>
          <div className="text-[10.5px] text-zinc-500">Francisco</div>
        </div>
      </div>
    );
    cmds = [
      { label: 'Today', icon: 'target', run: () => u.openOs('today'), primary: true },
      { label: 'Ask ARIA', icon: 'sparkles', run: openAria },
      { label: 'Decisions', icon: 'flag', run: () => u.openOs('decisions') },
      { label: 'Calendar', icon: 'calendar', run: () => u.openOs('calendar') },
      { label: 'Inbox', icon: 'inbox', run: () => u.openOs('inbox') },
    ];
  } else {
    cmds = [
      { label: 'Command center', icon: 'home', run: () => { focusCitadel(); u.openOs('today'); }, primary: true },
      { label: 'Project', icon: 'plus', run: () => u.openModal({ type: 'createProject' }) },
      { label: 'Conversation', icon: 'plus', run: () => u.openModal({ type: 'createConversation' }) },
      { label: 'Agents', icon: 'bot', run: () => u.openDrawer('agents') },
      { label: 'Missions', icon: 'target', run: () => u.openDrawer('missions') },
      { label: 'Search', icon: 'search', run: () => u.setPalette(true) },
    ];
  }
  currentBarCommands = cmds;

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-20 mx-auto w-fit max-w-[calc(100%-16px)] md:bottom-3 lg:max-w-[calc(100%-520px)]">
      <div className="glass flex items-center gap-2 rounded-xl p-1.5">
        <div className="hidden max-w-48 shrink-0 border-r border-white/8 pl-1 pr-3 sm:block">{title}</div>
        <div className="scrollbar-none flex gap-1 overflow-x-auto">
          {cmds.map((c, i) => (
            <button
              key={c.label}
              type="button"
              onClick={c.run}
              className={cx(
                'group relative flex h-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg px-2.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] transition',
                c.primary ? 'bg-[var(--accent)]/14 text-[var(--accent)] hover:bg-[var(--accent)]/22' : 'text-zinc-300 hover:bg-white/8',
              )}
            >
              <Icon name={c.icon} size={16} />
              {c.label}
              <kbd className="absolute right-1 top-0.5 hidden text-[8px] text-zinc-600 md:block">{i + 1}</kbd>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

