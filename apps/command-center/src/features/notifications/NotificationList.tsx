'use client';
import { focusAgent, focusProject } from '@/services/actions';
import { useUi } from '@/store/uiStore';
import { useWorld } from '@/store/worldStore';
import type { AppNotification } from '@/types/domain';
import { Icon, type IconName } from '@/components/ui/Icon';
import { cx, Empty, timeAgo } from '@/components/ui/primitives';

const ICON: Record<AppNotification['kind'], IconName> = {
  input_needed: 'bell',
  mission_completed: 'check',
  deadline: 'clock',
  document_ready: 'file',
  project_blocked: 'alert',
  meeting: 'calendar',
  info: 'sparkles',
};

export function openNotificationTarget(n: AppNotification) {
  useWorld.getState().markRead([n.id]);
  const t = n.target;
  if (!t) return;
  const u = useUi.getState();
  if (t.type === 'agent') focusAgent(t.id);
  else if (t.type === 'project') focusProject(t.id);
  else u.openModal({ type: 'decision', decisionId: t.id });
}

export function NotificationList() {
  const ns = useWorld((s) => s.world.notifications);
  if (!ns.length) return <Empty>No notifications.</Empty>;
  return (
    <div className="space-y-1">
      {ns.some((n) => !n.read) && (
        <button type="button" onClick={() => useWorld.getState().markRead()} className="mb-1 px-3 text-[10.5px] text-zinc-500 hover:text-zinc-200">Mark all as read</button>
      )}
      {ns.slice(0, 60).map((n) => (
        <button key={n.id} type="button" onClick={() => openNotificationTarget(n)} className={cx('flex w-full gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/6', !n.read && 'bg-white/[0.035]')}>
          <span className={cx('mt-0.5', n.priority === 'high' ? 'text-yellow-300' : 'text-zinc-500')}><Icon name={ICON[n.kind]} size={15} /></span>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-2">
              <span className={cx('truncate text-[12.5px]', n.read ? 'text-zinc-400' : 'font-medium text-zinc-100')}>{n.title}</span>
              <span className="shrink-0 text-[10px] text-zinc-500">{timeAgo(n.ts)}</span>
            </div>
            <p className="truncate text-[11.5px] text-zinc-500">{n.body}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
