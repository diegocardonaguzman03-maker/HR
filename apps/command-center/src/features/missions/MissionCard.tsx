'use client';
import { focusAgent } from '@/services/actions';
import { useWorld } from '@/store/worldStore';
import type { Mission } from '@/types/domain';
import { Icon } from '@/components/ui/Icon';
import { AgentAvatar, cx, MissionStatusBadge, Progress } from '@/components/ui/primitives';

const LEVEL_STYLE: Record<Mission['level'], string> = {
  mission: 'text-zinc-500',
  objective: 'text-sky-300',
  'sub-mission': 'text-zinc-500',
  milestone: 'text-violet-300',
  critical: 'text-orange-300',
};

export function MissionCard({ mission, showProject }: { mission: Mission; showProject?: boolean }) {
  const world = useWorld((s) => s.world);
  const deps = mission.dependsOn.map((id) => world.missions[id]).filter(Boolean);
  const blockedByDeps = deps.some((d) => d.status !== 'done');
  const days = Math.round((new Date(mission.deadline).getTime() - Date.now()) / 86400000);
  return (
    <div className={cx('rounded-lg border bg-white/[0.03] p-3', mission.level === 'critical' && mission.status !== 'done' ? 'border-orange-400/30' : 'border-white/8')}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
            <span className="text-zinc-500">{mission.code}</span>
            {mission.level !== 'mission' && <span className={LEVEL_STYLE[mission.level]}>{mission.level === 'critical' ? 'Critical mission' : mission.level}</span>}
          </div>
          <h4 className="mt-0.5 text-[13px] font-medium text-zinc-100">{mission.title}</h4>
          {showProject && <p className="text-[11px] text-zinc-500">{world.projects[mission.projectId]?.name}</p>}
        </div>
        <MissionStatusBadge status={mission.status} />
      </div>
      <div className="mt-2.5"><Progress value={mission.progress} tone={mission.status === 'done' ? 'emerald' : 'amber'} /></div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1"><Icon name="clock" size={12} />{mission.status === 'done' ? 'Done' : days < 0 ? `${-days} d overdue` : days === 0 ? 'Due today' : `Due in ${days} d`}</span>
        <span className="flex items-center gap-1">
          {mission.agentIds.length ? mission.agentIds.map((id) => world.agents[id]).filter(Boolean).map((a) => (
            <button key={a.id} type="button" title={`${a.name} — locate`} onClick={() => focusAgent(a.id)}><AgentAvatar agent={a} size={18} /></button>
          )) : <span className="text-zinc-500">Unassigned</span>}
        </span>
        {deps.length > 0 && (
          <span className={cx('flex items-center gap-1', blockedByDeps && mission.status === 'pending' ? 'text-amber-300' : '')}>
            <Icon name="link" size={12} /> Depends on {deps.map((d) => d.code.replace('MISSION ', 'M')).join(', ')}
          </span>
        )}
      </div>
      {mission.outputs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {mission.outputs.map((o) => <span key={o} className="rounded bg-white/6 px-1.5 py-0.5 text-[10px] text-zinc-300">⇢ {o}</span>)}
        </div>
      )}
    </div>
  );
}
