'use client';
import { useUi } from '@/store/uiStore';
import { useWorld } from '@/store/worldStore';
import type { FileDoc } from '@/types/domain';
import { Icon } from '@/components/ui/Icon';
import { timeAgo } from '@/components/ui/primitives';

const KIND_COLOR: Record<FileDoc['kind'], string> = {
  pdf: 'text-red-300', doc: 'text-sky-300', sheet: 'text-emerald-300', deck: 'text-orange-300', image: 'text-pink-300', model: 'text-violet-300', note: 'text-yellow-200', other: 'text-zinc-300',
};

export function FileRow({ file, showProject }: { file: FileDoc; showProject?: boolean }) {
  const agent = useWorld((s) => (file.agentId ? s.world.agents[file.agentId] : undefined));
  const project = useWorld((s) => (file.projectId ? s.world.projects[file.projectId] : undefined));
  return (
    <button type="button" onClick={() => useUi.getState().openModal({ type: 'file', fileId: file.id })} className="flex w-full items-center gap-3 rounded-lg bg-white/[0.035] px-3 py-2.5 text-left hover:bg-white/[0.06]">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/6 text-[9px] font-bold uppercase ${KIND_COLOR[file.kind]}`}>{file.kind}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] text-zinc-100">{file.name}</div>
        <div className="truncate text-[10.5px] text-zinc-500">
          {agent ? agent.name : 'Francisco'} · {timeAgo(file.updatedAt)} · {file.size}
          {showProject && project ? ` · ${project.name}` : ''}
          {file.simulated && <span className="ml-1 text-sky-300/60">· simulated</span>}
        </div>
      </div>
      <Icon name="chevronRight" size={14} className="text-zinc-600" />
    </button>
  );
}
