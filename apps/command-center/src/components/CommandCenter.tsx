'use client';
// Application shell: the world fills the screen; UI layers float above it.
// Level 1 = world · Level 2 = selection panel · Level 3 = workspace / chat / profile / OS.
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useState } from 'react';
import { focusCitadel } from '@/services/actions';
import { useUi } from '@/store/uiStore';
import { useWorld } from '@/store/worldStore';
import { ActivityFeed } from '@/features/activity/ActivityFeed';
import { AgentPanel } from '@/features/agents/AgentPanel';
import { AgentProfile } from '@/features/agents/AgentProfile';
import { ChatPanel } from '@/features/chat/ChatPanel';
import { CommandOS } from '@/features/citadel/CommandOS';
import { BottomCommandBar, currentBarCommands } from '@/features/command/BottomCommandBar';
import { CommandPalette } from '@/features/command/CommandPalette';
import { MiniMap } from '@/features/minimap/MiniMap';
import { ModalRoot } from '@/features/modals/Modals';
import { Drawer } from '@/features/nav/Drawer';
import { GlobalNav, MobileNav } from '@/features/nav/GlobalNav';
import { TopBar } from '@/features/nav/TopBar';
import { Toasts } from '@/features/notifications/Toasts';
import { ProjectPanel } from '@/features/projects/ProjectPanel';
import { ProjectWorkspace } from '@/features/projects/ProjectWorkspace';
import { IconBtn } from './ui/primitives';

// Three.js is heavy and touches `window`: load the game layer lazily, client-side.
const GameCanvas = lazy(() => import('./GameCanvas').then((m) => ({ default: m.GameCanvas })));
const WorldLoading = () => <div className="absolute inset-0 flex items-center justify-center text-[11px] tracking-[0.3em] text-zinc-600">LOADING WORLD…</div>;

const isTyping = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));

export function CommandCenter() {
  const start = useWorld((s) => s.start);
  const sel = useUi((s) => s.selection);
  const chat = useUi((s) => s.chat);
  const workspace = useUi((s) => s.workspace);
  const profile = useUi((s) => s.agentProfile);
  const os = useUi((s) => s.os);
  const drawer = useUi((s) => s.drawer);

  useEffect(() => {
    start();
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) useUi.getState().setReducedMotion(true);
    } catch {
      /* ignore */
    }
  }, [start]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const u = useUi.getState();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        u.setPalette(!u.paletteOpen);
        return;
      }
      if (e.key === 'Escape') {
        if (isTyping(e.target) && !u.chat) return;
        u.back();
        return;
      }
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey || u.modal || u.paletteOpen) return;
      if (/^[1-7]$/.test(e.key)) {
        currentBarCommands[Number(e.key) - 1]?.run();
      } else if (e.key === 'h' || e.key === 'H') {
        focusCitadel();
        u.openOs('today');
      } else if (e.key === 'n' || e.key === 'N') {
        u.openModal({ type: 'createConversation' });
      } else if (e.key === 'p' || e.key === 'P') {
        u.openModal({ type: 'createProject' });
      } else if (e.key === '/') {
        e.preventDefault();
        u.setPalette(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Narrow subscriptions: the shell re-renders only when what it shows changes,
  // not on every world event (keeps the 3D view smooth while agents work).
  const agent = useWorld((s) => (sel?.kind === 'agent' ? s.world.agents[sel.id] : undefined));
  const project = useWorld((s) => (sel?.kind === 'project' ? s.world.projects[sel.id] : undefined));
  const wsProject = useWorld((s) => (workspace ? s.world.projects[workspace.projectId] : undefined));
  const profAgent = useWorld((s) => (profile ? s.world.agents[profile.agentId] : undefined));
  const wide = wsProject || profAgent || os;
  const inspector = !wide && !chat && (agent || project);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[var(--bg)] text-zinc-100">
      <Suspense fallback={<WorldLoading />}>
        <GameCanvas />
      </Suspense>
      <div className="vignette pointer-events-none absolute inset-0" />
      <TopBar />
      <GlobalNav />
      {!wide && <ActivityFeed />}
      <MiniMap />
      {!chat && !wide && <div className={inspector ? 'max-md:hidden' : ''}><BottomCommandBar /></div>}
      <MobileNav />
      <AnimatePresence>{drawer && !wide && <Drawer key={drawer} kind={drawer} />}</AnimatePresence>

      <AnimatePresence>
        {inspector && (
          <SidePanel key={`insp-${sel?.kind}-${sel?.id}`} width={380} sheet>
            <div className="absolute right-2 top-2 z-10">
              <IconBtn icon="x" label="Deselect (Esc)" onClick={() => useUi.getState().select(null, { focus: false })} />
            </div>
            <div className="h-full overflow-y-auto p-4 pt-5">{agent ? <AgentPanel agent={agent} /> : project ? <ProjectPanel project={project} /> : null}</div>
          </SidePanel>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {wide && (
          <SidePanel key="wide" width={700} z={35}>
            {os ? <CommandOS section={os.section} /> : wsProject ? <ProjectWorkspace project={wsProject} tab={workspace!.tab} /> : profAgent ? <AgentProfile agent={profAgent} tab={profile!.tab} /> : null}
          </SidePanel>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chat && (
          <SidePanel key="chat" width={400} z={45}>
            <ChatPanel conversationId={chat.conversationId} />
          </SidePanel>
        )}
      </AnimatePresence>

      <Toasts />
      <FirstRunHint />
      <ModalRoot />
      <CommandPalette />
    </main>
  );
}

function SidePanel({ children, width, z = 30, sheet = false }: { children: React.ReactNode; width: number; z?: number; sheet?: boolean }) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{ zIndex: z, ['--w' as string]: `${width}px` }}
      className={`glass-solid pointer-events-auto absolute inset-x-0 bottom-[56px] ${sheet ? 'top-[36dvh]' : 'top-14'} overflow-hidden rounded-t-2xl md:inset-x-auto md:bottom-3 md:right-3 md:top-16 md:w-[min(var(--w),calc(100vw-96px))] md:rounded-xl`}
    >
      {children}
    </motion.section>
  );
}

function FirstRunHint() {
  const [show, setShow] = useState(false);
  const live = useWorld((s) => s.connection.kind === 'claude');
  useEffect(() => {
    try {
      setShow(localStorage.getItem('fcc.hint.v1') !== 'done');
    } catch {
      setShow(true);
    }
  }, []);
  if (!show) return null;
  const done = () => {
    setShow(false);
    try {
      localStorage.setItem('fcc.hint.v1', 'done');
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="glass pointer-events-auto absolute bottom-[132px] left-1/2 z-20 hidden w-[min(560px,calc(100%-24px))] -translate-x-1/2 items-center gap-3 rounded-xl px-4 py-2.5 text-[11.5px] text-zinc-300 md:flex">
      <span className="flex-1">
        <b className="text-zinc-100">{live ? 'Your agents run on Claude.' : 'Your world is live.'}</b> Click an agent to chat, a building to manage it · drag to pan · right-drag to rotate · scroll to zoom · <kbd className="kbd">⌘K</kbd> to command.
      </span>
      <button type="button" onClick={done} className="text-[11px] font-semibold text-[var(--accent)]">Got it</button>
    </div>
  );
}
