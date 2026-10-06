'use client';
// Design-system primitives shared by every feature panel.
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { STATE_COLORS } from '@/game/agents/behavior';
import type { ActivitySource, Agent, AgentState, MissionStatus, Priority, ProjectStatus } from '@/types/domain';
import { Icon, type IconName } from './Icon';

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;

export const STATE_LABEL: Record<AgentState, string> = {
  working: 'Working',
  researching: 'Researching',
  collaborating: 'Collaborating',
  waiting: 'Waiting for input',
  reviewing: 'Reviewing',
  blocked: 'Blocked',
  idle: 'Idle',
  completed: 'Completed task',
  paused: 'Paused',
};

export function cx(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(' ');
}

export function StatusIndicator({ state, compact = false }: { state: AgentState; compact?: boolean }) {
  const c = hex(STATE_COLORS[state]);
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide" style={{ color: c }}>
      <span className="relative inline-flex h-2 w-2">
        {['working', 'researching', 'collaborating', 'waiting'].includes(state) && (
          <span className="absolute inset-0 animate-ping rounded-full opacity-40" style={{ background: c }} />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: c }} />
      </span>
      {!compact && STATE_LABEL[state]}
    </span>
  );
}

const PRIORITY_STYLE: Record<Priority, string> = {
  low: 'text-zinc-400 border-zinc-600/60',
  normal: 'text-zinc-300 border-zinc-500/60',
  high: 'text-amber-300 border-amber-400/50',
  critical: 'text-orange-300 border-orange-400/70 bg-orange-500/10',
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={cx('rounded border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider', PRIORITY_STYLE[priority])}>{priority}</span>;
}

const PSTATUS: Record<ProjectStatus, string> = {
  active: 'text-emerald-300',
  planning: 'text-sky-300',
  paused: 'text-zinc-400',
  blocked: 'text-red-400',
  completed: 'text-yellow-300',
  archived: 'text-zinc-500',
};
export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={cx('text-[11px] font-semibold uppercase tracking-wider', PSTATUS[status])}>{status}</span>;
}

const MSTATUS: Record<MissionStatus, string> = {
  pending: 'bg-zinc-700 text-zinc-300',
  active: 'bg-emerald-900/70 text-emerald-300',
  review: 'bg-orange-900/60 text-orange-300',
  blocked: 'bg-red-900/60 text-red-300',
  done: 'bg-yellow-900/50 text-yellow-200',
};
export function MissionStatusBadge({ status }: { status: MissionStatus }) {
  return <span className={cx('rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider', MSTATUS[status])}>{status}</span>;
}

export function SourceBadge({ source }: { source: ActivitySource | null | 'user' | undefined }) {
  if (source === 'real') return <span className="rounded bg-emerald-500/15 px-1.5 py-px text-[9px] font-bold tracking-widest text-emerald-300">LIVE</span>;
  if (source === 'simulated') return <span className="rounded bg-sky-500/10 px-1.5 py-px text-[9px] font-bold tracking-widest text-sky-300/80" title="Simulated by the demo engine — no real agent is executing this.">SIMULATED</span>;
  return null;
}

export function Progress({ value, tone = 'amber' }: { value: number; tone?: 'amber' | 'emerald' | 'sky' }) {
  const color = tone === 'emerald' ? 'bg-emerald-400' : tone === 'sky' ? 'bg-sky-400' : 'bg-[var(--accent)]';
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
      <div className={cx('h-full rounded-full transition-[width] duration-700', color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function AgentAvatar({ agent, size = 32 }: { agent: Pick<Agent, 'name' | 'color' | 'state'>; size?: number }) {
  const c = hex(agent.color);
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-lg font-bold text-[#111]"
      style={{ width: size, height: size, background: `linear-gradient(145deg, ${c}, ${c}aa)`, fontSize: size * 0.36 }}
    >
      {agent.name.slice(0, 2)}
      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--panel-solid)]" style={{ background: hex(STATE_COLORS[agent.state]) }} />
    </span>
  );
}

export function Btn({
  children,
  icon,
  variant = 'ghost',
  size = 'md',
  className,
  ...rest
}: { children?: ReactNode; icon?: IconName; variant?: 'primary' | 'ghost' | 'outline' | 'danger' | 'subtle'; size?: 'sm' | 'md' } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const v = {
    primary: 'bg-[var(--accent)] text-[#16120a] hover:brightness-110 font-semibold',
    ghost: 'text-zinc-300 hover:bg-white/8 hover:text-white',
    outline: 'border border-white/12 text-zinc-200 hover:border-white/25 hover:bg-white/5',
    danger: 'border border-red-400/40 text-red-300 hover:bg-red-500/10',
    subtle: 'bg-white/6 text-zinc-200 hover:bg-white/10',
  }[variant];
  const s = size === 'sm' ? 'h-7 px-2 text-[11px] gap-1' : 'h-9 px-3 text-xs gap-1.5';
  return (
    <button
      type="button"
      className={cx('inline-flex items-center justify-center rounded-md tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40', v, s, className)}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} />}
      {children}
    </button>
  );
}

export function IconBtn({ icon, label, active, badge, className, ...rest }: { icon: IconName; label: string; active?: boolean; badge?: number } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-md transition',
        active ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'text-zinc-400 hover:bg-white/8 hover:text-zinc-100',
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={17} />
      {!!badge && (
        <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-[var(--accent)] px-1 text-center text-[9px] font-bold leading-4 text-black">{badge > 9 ? '9+' : badge}</span>
      )}
    </button>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('glass rounded-xl', className)}>{children}</div>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{children}</h3>
      {right}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-white/8">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cx(
            'shrink-0 border-b-2 px-2.5 py-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] transition',
            value === t.id ? 'border-[var(--accent)] text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300',
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1 text-zinc-500">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-xs text-zinc-500">{children}</div>;
}

export function timeAgo(ts: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

export function clock(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}
