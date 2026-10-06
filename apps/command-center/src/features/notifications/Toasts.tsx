'use client';
// High-priority notifications surface briefly in the UI; low-priority ones
// stay in the world (icons over units/buildings) and the notification list.
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useUi } from '@/store/uiStore';
import { useWorld } from '@/store/worldStore';
import type { AppNotification } from '@/types/domain';
import { Icon } from '@/components/ui/Icon';
import { openNotificationTarget } from './NotificationList';

export function Toasts() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const toast = useUi((s) => s.toast);
  const [plain, setPlain] = useState<{ text: string; n: number } | null>(null);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    // Seed notifications are not "new": mark them seen.
    for (const n of useWorld.getState().world.notifications) seen.current.add(n.id);
    return useWorld.getState().onEvent((e) => {
      if (e.type !== 'notification.created') return;
      const n = e.payload.notification;
      if (n.priority !== 'high' || seen.current.has(n.id)) return;
      seen.current.add(n.id);
      setItems((xs) => [n, ...xs].slice(0, 3));
      setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== n.id)), 7000);
    });
  }, []);

  useEffect(() => {
    if (!toast) return;
    setPlain(toast);
    const t = setTimeout(() => setPlain((p) => (p?.n === toast.n ? null : p)), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="pointer-events-none absolute left-1/2 top-16 z-40 flex w-[min(340px,calc(100%-24px))] -translate-x-1/2 flex-col gap-2">
      <AnimatePresence>
        {plain && (
          <motion.div key={`t-${plain.n}`} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-solid pointer-events-auto rounded-lg px-3 py-2 text-[12px] text-zinc-100">
            {plain.text}
          </motion.div>
        )}
        {items.map((n) => (
          <motion.button
            key={n.id}
            type="button"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            onClick={() => { openNotificationTarget(n); setItems((xs) => xs.filter((x) => x.id !== n.id)); }}
            className="glass-solid pointer-events-auto flex gap-2.5 rounded-lg border-l-2 border-l-yellow-400 px-3 py-2 text-left"
          >
            <Icon name={n.kind === 'project_blocked' ? 'alert' : n.kind === 'document_ready' ? 'file' : 'bell'} size={15} className="mt-0.5 text-yellow-300" />
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-zinc-100">{n.title}</div>
              <div className="truncate text-[11px] text-zinc-400">{n.body}</div>
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
