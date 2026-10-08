'use client';
import { useMemo } from 'react';
import { focusAgent, focusProject } from '@/services/actions';
import { useUi, type FeedFilter } from '@/store/uiStore';
import { useWorld } from '@/store/worldStore';
import type { ActivityItem } from '@/types/domain';
import { Icon } from '@/components/ui/Icon';
import { useNow } from '@/components/ui/Modal';
import { clock, cx, hex } from '@/components/ui/primitives';

const FILTERS: { id: FeedFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'work', label: 'Work' },
  { id: 'praxia', label: 'Praxia' },
  { id: 'personal', label: 'Personal' },
  { id: 'critical', label: 'Critical' },
  { id: 'waiting', label: 'Waiting for me' },
  { id: 'completed', label: 'Completed' },
];

export function filterActivity(items: ActivityItem[], f: FeedFilter): ActivityItem[] {
  switch (f) {
    case 'all': return items;
    case 'critical': return items.filter((i) => i.critical);
    case 'waiting': return items.filter((i) => i.waitingForMe);
    case 'completed': return items.filter((i) => i.completed);
    default: return items.filter((i) => i.category === f);
  }
}

export function ActivityEvent({ item, compact }: { item: ActivityItem; compact?: boolean }) {
  const agent = useWorld((s) => (item.agentId ? s.world.agents[item.agentId] : undefined));
  const onClick = () => (item.agentId ? focusAgent(item.agentId) : item.projectId ? focusProject(item.projectId) : undefined);
  return (
    <button type="button" onClick={onClick} className="group flex w-full gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-white/5">
      <span className="w-9 shrink-0 pt-px font-mono text-[10px] text-zinc-500">{clock(item.ts)}</span>
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: item.waitingForMe ? '#facc15' : item.critical ? '#f97316' : item.completed ? '#22c55e' : agent ? hex(agent.color) : '#71717a' }} />
      <span className={cx('min-w-0 flex-1 text-[11.5px] leading-snug', item.waitingForMe ? 'text-yellow-100' : 'text-zinc-300', compact && 'line-clamp-2')}>
        {item.text}
        {item.source === 'simulated' && <span className="ml-1 text-[9px] text-sky-300/50" title="Simulated">◦sim</span>}
      </span>
    </button>
  );
}

export function ActivityFeed() {
  const items = useWorld((s) => s.world.activity);
  const open = useUi((s) => s.feedOpen);
  const filter = useUi((s) => s.feedFilter);
  const u = useUi.getState();
  useNow(30000);
  const list = useMemo(() => filterActivity(items, filter).slice(0, 60), [items, filter]);

  return (
    <aside aria-label="Activity feed" className="pointer-events-auto absolute left-[68px] top-16 z-20 hidden w-[300px] md:block lg:w-[330px]">
      <div className="glass overflow-hidden rounded-xl">
        <button type="button" onClick={() => u.setFeed(!open)} className="flex w-full items-center justify-between px-3 py-2">
          <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live activity
          </span>
          <Icon name={open ? 'chevronDown' : 'chevronUp'} size={14} className="text-zinc-500" />
        </button>
        {open && (
          <>
            <div className="scrollbar-none flex gap-1 overflow-x-auto px-2 pb-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => u.setFeedFilter(f.id)}
                  className={cx('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', filter === f.id ? 'bg-[var(--accent)]/18 text-[var(--accent)]' : 'text-zinc-500 hover:text-zinc-300')}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="max-h-[min(30vh,240px)] overflow-y-auto px-1 pb-2">
              {list.length ? list.map((i) => <ActivityEvent key={i.id} item={i} compact />) : <p className="px-3 py-4 text-center text-[11px] text-zinc-500">No activity for this filter.</p>}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
