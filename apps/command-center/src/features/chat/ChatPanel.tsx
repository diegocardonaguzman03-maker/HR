'use client';
// Level 3 — the conversation attached to an agent (and its project/mission context).
import { useEffect, useMemo, useRef, useState } from 'react';
import { focusAgent, focusProject, runAction } from '@/services/actions';
import { uid } from '@/services/ids';
import { useUi } from '@/store/uiStore';
import { dispatch, useWorld } from '@/store/worldStore';
import type { Message } from '@/types/domain';
import { Icon } from '@/components/ui/Icon';
import { AgentAvatar, clock, cx, IconBtn, SourceBadge, StatusIndicator } from '@/components/ui/primitives';
import { DecisionButtons } from '../agents/AgentPanel';

const REMOTE_PROMPTS = ['¿En qué estado vas?', 'Aprobado, continúa.', 'Resume lo que hiciste y qué falta.', 'Prepara la presentación ejecutiva de avances.'];

const QUICK_PROMPTS = [
  'Give me a status update.',
  'What are you working on?',
  'Show me what you found.',
  'Stop this task.',
  'Change priority to high.',
  'Collaborate with another agent.',
  'Create a deliverable.',
];

export function ChatPanel({ conversationId }: { conversationId: string }) {
  const conv = useWorld((s) => s.world.conversations[conversationId]);
  const messagesMap = useWorld((s) => s.world.messages);
  const agent = useWorld((s) => (conv ? s.world.agents[conv.agentId] : undefined));
  const projects = useWorld((s) => s.world.projects);
  const conversations = useWorld((s) => s.world.conversations);
  const typing = useWorld((s) => s.typing[conversationId]);
  const stream = useWorld((s) => s.streaming[conversationId]);
  const live = useWorld((s) => s.connection.kind === 'claude');
  const u = useUi.getState();
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [showThreads, setShowThreads] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const remoteId = conv?.remoteSessionId;
  const remote = useWorld((s) => (remoteId ? s.world.remote?.[remoteId] : undefined));
  const transcript = useWorld((s) => (remoteId ? s.transcripts[remoteId] : undefined));
  const [sent, setSent] = useState<Message[]>([]);
  const local = useMemo(() => (conv ? conv.messageIds.map((id) => messagesMap[id]).filter(Boolean) : []), [conv, messagesMap]);
  const messages = useMemo(() => {
    if (!remoteId) return local;
    const t = transcript ?? [];
    const lastTs = t.length ? t[t.length - 1].ts : 0;
    return [...t, ...sent.filter((m) => m.ts > lastTs - 2000 && !t.some((x) => x.role === 'user' && x.text === m.text))];
  }, [remoteId, local, transcript, sent]);

  // Real session: load its transcript and keep it fresh while the chat is open.
  useEffect(() => {
    if (!remoteId) return;
    dispatch({ type: 'remote.refresh', sessionId: remoteId });
    const t = setInterval(() => document.visibilityState === 'visible' && dispatch({ type: 'remote.refresh', sessionId: remoteId }), 15000);
    return () => clearInterval(t);
  }, [remoteId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, typing, stream?.text]);
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, [conversationId]);

  if (!conv || !agent) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-zinc-500">
        Opening conversation…
      </div>
    );
  }

  const project = conv.projectId ? projects[conv.projectId] : undefined;
  const threads = agent.conversationIds.map((id) => conversations[id]).filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt);

  const send = (value = text) => {
    const v = value.trim();
    if (!v && !files.length) return;
    if (remoteId) {
      if (!v) return;
      dispatch({ type: 'chat.send', conversationId, agentId: agent.id, text: v });
      setSent((xs) => [...xs, { id: `local-${Date.now()}`, conversationId, role: 'user', text: v, ts: Date.now() }]);
      setText('');
      return;
    }
    dispatch({
      type: 'chat.send',
      conversationId,
      agentId: agent.id,
      text: v || `Attached ${files.length} file${files.length > 1 ? 's' : ''}.`,
      attachments: files.map((f) => ({ name: f.name, size: f.size })),
    });
    setText('');
    setFiles([]);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="border-b border-white/8 px-4 pb-3 pt-3.5">
        <div className="flex items-start gap-3">
          <button type="button" onClick={() => focusAgent(agent.id)} title="Locate on map"><AgentAvatar agent={agent} size={40} /></button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-[0.12em] text-zinc-50">{agent.name}</h2>
              <StatusIndicator state={agent.state} />
            </div>
            <p className="truncate text-[11.5px] text-zinc-400">{agent.role}</p>
            <p className="mt-0.5 truncate text-[11px] text-zinc-500">
              Mission: <span className="text-zinc-300">{agent.currentTask?.title ?? 'none'}</span>
            </p>
          </div>
          <div className="flex shrink-0 gap-0.5">
            <IconBtn icon="user" label="Agent profile" onClick={() => u.openAgentProfile(agent.id)} />
            <IconBtn icon="x" label="Close chat (Esc)" onClick={() => u.closeChat()} />
          </div>
        </div>
        <div className="relative mt-2 flex items-center gap-2 text-[11px]">
          <button type="button" onClick={() => setShowThreads((v) => !v)} className="flex min-w-0 items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-zinc-300 hover:bg-white/10">
            <Icon name="chat" size={12} />
            <span className="truncate">{conv.title}</span>
            <Icon name="chevronDown" size={12} />
          </button>
          {project && (
            <button type="button" onClick={() => focusProject(project.id)} className="truncate rounded-md bg-white/5 px-2 py-1 text-[var(--accent)] hover:bg-white/10">
              {project.structure}
            </button>
          )}
          {showThreads && (
            <div className="glass-solid absolute left-0 top-8 z-10 w-72 rounded-lg p-1">
              {threads.map((c) => (
                <button key={c.id} type="button" onClick={() => { setShowThreads(false); u.openChat(c.id); }} className={cx('flex w-full flex-col rounded-md px-2.5 py-1.5 text-left hover:bg-white/8', c.id === conv.id && 'bg-white/6')}>
                  <span className="truncate text-xs text-zinc-200">{c.title}</span>
                  <span className="text-[10px] text-zinc-500">{c.projectId ? projects[c.projectId]?.name : 'General'} · {c.messageIds.length} msgs</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setShowThreads(false);
                  const id = uid('c');
                  dispatch({ type: 'conversation.start', conversationId: id, agentId: agent.id, projectId: conv.projectId, title: `${agent.name} · new thread` });
                  u.openChat(id);
                }}
                className="mt-0.5 flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-[var(--accent)] hover:bg-white/8"
              >
                <Icon name="plus" size={13} /> New thread with {agent.name}
              </button>
            </div>
          )}
        </div>
      </header>

      {remoteId && (
        <div className="flex items-center gap-2 border-b border-white/8 bg-emerald-400/5 px-4 py-2 text-[11px] text-emerald-100/90">
          <Icon name="link" size={13} className="shrink-0 text-emerald-300" />
          <span className="min-w-0 flex-1">
            Real Claude Code session · <b className="font-semibold">{remote?.status?.replace('_', ' ') ?? 'loading'}</b>
            {remote?.needsAction ? <span className="block truncate text-yellow-200">Waiting for you: {remote.needsAction}</span> : null}
          </span>
          <a href={`https://claude.ai/code/${remoteId}`} target="_blank" rel="noreferrer" className="shrink-0 rounded border border-emerald-400/30 px-2 py-0.5 text-emerald-200 hover:bg-emerald-400/10">Open in Claude</a>
        </div>
      )}
      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.length === 0 && (
          <p className="text-center text-xs text-zinc-500">
            {remoteId ? (transcript ? 'No messages in this session yet.' : 'Loading the session’s conversation…') : `Start the conversation — ${agent.name} has the context of ${project ? project.name : 'your workspace'}.`}
          </p>
        )}
        {messages.map((m) => <Bubble key={m.id} m={m} />)}
        {agent.state === 'waiting' && agent.waitingFor?.decisionId && (
          <div className="rounded-lg border border-yellow-400/25 bg-yellow-400/6 p-3">
            <p className="mb-2 text-[12px] text-yellow-100">{agent.waitingFor.question}</p>
            <DecisionButtons decisionId={agent.waitingFor.decisionId} />
          </div>
        )}
        {stream && <StreamingBubble agentId={stream.agentId} text={stream.text} />}
        {typing && !stream && (
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: `${i * 120}ms` }} />)}
            </span>
            {live ? `${agent.name} is thinking…` : `${agent.name} is typing…`}
            {live && (
              <button type="button" onClick={() => dispatch({ type: 'agent.cancel', agentId: agent.id })} className="ml-1 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-300 hover:bg-white/8">
                Stop
              </button>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-white/8 px-3 pb-3 pt-2">
        <div className="scrollbar-none mb-2 flex gap-1.5 overflow-x-auto">
          {(remoteId ? REMOTE_PROMPTS : QUICK_PROMPTS).map((q) => (
            <button key={q} type="button" onClick={() => send(q)} className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10.5px] text-zinc-300 hover:border-[var(--accent)]/50 hover:text-white">
              {q}
            </button>
          ))}
        </div>
        {files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {files.map((f, i) => (
              <span key={i} className="flex items-center gap-1 rounded bg-white/8 px-2 py-0.5 text-[10.5px] text-zinc-300">
                <Icon name="file" size={11} /> {f.name}
                <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((xs) => xs.filter((_, j) => j !== i))}><Icon name="x" size={11} /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-end gap-1.5 rounded-xl border border-white/10 bg-black/25 p-1.5 focus-within:border-[var(--accent)]/50">
          <input ref={fileRef} type="file" multiple hidden onChange={(e) => setFiles((xs) => [...xs, ...Array.from(e.target.files ?? [])])} />
          <IconBtn icon="clip" label="Attach file" onClick={() => fileRef.current?.click()} />
          <textarea
            ref={inputRef}
            value={text}
            rows={1}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={remoteId ? 'Write to the Claude Code session…' : `Message ${agent.name}…`}
            className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus-visible:outline-none"
          />
          <IconBtn icon="mic" label="Voice input — coming later (not yet available)" disabled className="opacity-35" />
          <button type="button" onClick={() => send()} aria-label="Send" className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-black disabled:opacity-40" disabled={!text.trim() && !files.length}>
            <Icon name="send" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StreamingBubble({ agentId, text }: { agentId: string; text: string }) {
  const agent = useWorld((s) => s.world.agents[agentId]);
  return (
    <div className="flex gap-2">
      {agent && <AgentAvatar agent={agent} size={24} />}
      <div className="max-w-[85%]">
        <div className="whitespace-pre-wrap rounded-xl rounded-tl-sm bg-white/[0.06] px-3 py-2 text-[12.5px] leading-relaxed text-zinc-200">
          {text}
          <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-[var(--accent)] align-middle" />
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[9.5px] text-zinc-600">
          writing…
          <button type="button" onClick={() => dispatch({ type: 'agent.cancel', agentId })} className="rounded border border-white/10 px-1.5 text-zinc-400 hover:bg-white/8">Stop</button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ m }: { m: Message }) {
  const agent = useWorld((s) => (m.agentId ? s.world.agents[m.agentId] : undefined));
  const u = useUi.getState();
  const mine = m.role === 'user';
  if (m.role === 'system')
    return (
      <div className="mx-auto max-w-[92%] rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 text-center text-[11.5px] leading-snug text-zinc-400">
        {m.text}
        {m.actions && m.actions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap justify-center gap-1">
            {m.actions.map((a) => (
              <button key={a.label + a.command} type="button" onClick={() => runAction(a.command)} className="rounded-md border border-[var(--accent)]/40 px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">{a.label}</button>
            ))}
          </div>
        )}
      </div>
    );
  return (
    <div className={cx('flex gap-2', mine && 'flex-row-reverse')}>
      {!mine && agent && <AgentAvatar agent={agent} size={24} />}
      <div className={cx('max-w-[85%]', mine && 'items-end')}>
        <div className={cx('whitespace-pre-wrap rounded-xl px-3 py-2 text-[12.5px] leading-relaxed', mine ? 'rounded-tr-sm bg-[var(--accent)]/16 text-zinc-50' : 'rounded-tl-sm bg-white/[0.06] text-zinc-200')}>
          {m.text}
        </div>
        {m.attachments && m.attachments.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {m.attachments.map((a) => (
              <button key={a.fileId} type="button" onClick={() => u.openModal({ type: 'file', fileId: a.fileId })} className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[10.5px] text-zinc-300 hover:bg-white/8">
                <Icon name="file" size={11} /> {a.name}
              </button>
            ))}
          </div>
        )}
        {m.actions && m.actions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {m.actions.map((a) => (
              <button key={a.label + a.command} type="button" onClick={() => runAction(a.command)} className="flex items-center gap-1 rounded-md border border-[var(--accent)]/40 px-2 py-1 text-[10px] font-semibold tracking-wider text-[var(--accent)] hover:bg-[var(--accent)]/10">
                <Icon name="crosshair" size={11} /> {a.label}
              </button>
            ))}
          </div>
        )}
        <div className={cx('mt-0.5 flex items-center gap-1.5 text-[9.5px] text-zinc-600', mine && 'justify-end')}>
          {clock(m.ts)}
          {!mine && <SourceBadge source={m.source} />}
        </div>
      </div>
    </div>
  );
}
