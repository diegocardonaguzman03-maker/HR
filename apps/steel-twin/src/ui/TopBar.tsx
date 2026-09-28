import { useState } from 'react';
import { useAppStore, type AppMode } from '../store/useAppStore';
import { CAMERA_PRESETS } from '../config/layout';
import type { CameraPresetId } from '../types/process';
import type { LearningLevel } from '../types/equipment';
import { dataProvider } from './useSnapshot';

const MODES: { id: AppMode; label: string; short: string; hint: string }[] = [
  { id: 'explore', label: 'Explore', short: 'Explore', hint: 'Free navigation and equipment inspection' },
  { id: 'guided', label: 'Guided process', short: 'Guided', hint: 'Automatic step-by-step tour' },
  { id: 'follow', label: 'Follow the steel', short: 'Follow', hint: 'Camera follows one heat' },
];

export const LEVELS: { id: LearningLevel; label: string }[] = [
  { id: 1, label: 'What is this?' },
  { id: 2, label: 'How does it work?' },
  { id: 3, label: 'Process variables' },
  { id: 4, label: 'What can go wrong?' },
  { id: 5, label: 'Safety · quality · reliability · productivity' },
];

const VIEWS: CameraPresetId[] = ['overview', 'rawMaterials', 'eaf', 'secondary', 'caster', 'tundish', 'mold', 'strand', 'straightener', 'cutting', 'slab'];

function Menu({ label, children, active }: { label: string; children: React.ReactNode; active?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="hud-icon-btn" data-on={!!active}
      >
        {label} ▾
      </button>
      {open && (
        <div className="hud-panel absolute right-0 top-10 z-50 min-w-[230px] p-1.5">{children}</div>
      )}
    </div>
  );
}

export function TopBar() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const layers = useAppStore((s) => s.layers);
  const xray = useAppStore((s) => s.xray);
  const setXray = useAppStore((s) => s.setXray);
  const level = useAppStore((s) => s.level);
  const setLevel = useAppStore((s) => s.setLevel);
  const requestCamera = useAppStore((s) => s.requestCamera);
  const sectionOpen = useAppStore((s) => s.sectionOpen);
  const setSection = useAppStore((s) => s.setSection);
  const sectionS = useAppStore((s) => s.sectionS);
  const activeLayers = Object.values(layers).filter(Boolean).length;
  const panels = useAppStore((s) => s.panels);
  const togglePanel = useAppStore((s) => s.togglePanel);

  return (
    <header className="pointer-events-auto flex min-h-14 shrink-0 flex-wrap items-center gap-1.5 bg-gradient-to-b from-[#0b0d11]/95 via-[#0b0d11]/60 to-transparent px-3 py-2 md:flex-nowrap md:gap-2 md:px-4 md:py-0">
      <div className="flex shrink-0 items-center gap-2.5 whitespace-nowrap">
        <div className="h-6 w-1 rounded-sm bg-gradient-to-b from-amber-400 to-orange-600" />
        <div className="leading-tight">
          <div className="font-hud text-[14px] font-semibold tracking-[0.12em] text-zinc-100">STEEL LEARNING TWIN</div>
          <div className="hidden text-[10px] uppercase tracking-[0.18em] text-zinc-500 2xl:block">Learning Twin · EAF → LF → Slab caster</div>
        </div>
      </div>
      <span
        title={`Data source: ${dataProvider.label}. Values are educational, not plant operating limits.`}
        className="rounded-sm border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-amber-300 md:ml-2"
      >
        SIMULATED<span className="hidden 2xl:inline"> TRAINING DATA</span>
      </span>

      <nav className="hud-panel order-last flex w-full items-center gap-1 p-1 md:order-none md:ml-auto md:w-auto md:shrink-0" aria-label="Mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            title={m.hint}
            onClick={() => setMode(m.id)}
            className={`font-hud h-8 flex-1 px-2 text-[11px] uppercase md:h-7 md:flex-none md:px-3 md:text-xs tracking-[0.12em] transition ${mode === m.id ? 'bg-amber-400 font-semibold text-zinc-900' : 'text-zinc-300 hover:bg-white/5'}`}
          >
            <span className="xl:hidden">{m.short}</span>
            <span className="hidden xl:inline">{m.label}</span>
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-1.5 overflow-x-auto md:ml-0 md:gap-2 md:overflow-visible">
      <button className="hud-icon-btn" data-on={panels.layers} onClick={() => togglePanel('layers')} title="Layers (L)">LAYERS {activeLayers}</button>
      <button className="hud-icon-btn" data-on={panels.navigator} onClick={() => togglePanel('navigator')} title="Stage list (Tab)">STAGES</button>
      <Menu label="View">
        {VIEWS.map((v) => (
          <button key={v} onClick={() => requestCamera({ kind: 'preset', preset: v })} className="block w-full rounded-sm px-2 py-1.5 text-left text-xs text-zinc-200 hover:bg-white/5">
            {CAMERA_PRESETS[v].label}
          </button>
        ))}
        <div className="my-1 border-t border-white/10" />
        <button onClick={() => requestCamera({ kind: 'fit' })} className="block w-full rounded-sm px-2 py-1.5 text-left text-xs text-zinc-200 hover:bg-white/5">Fit process</button>
        <button onClick={() => requestCamera({ kind: 'preset', preset: 'overview' })} className="block w-full rounded-sm px-2 py-1.5 text-left text-xs text-zinc-200 hover:bg-white/5">Reset camera</button>
        <button onClick={() => setMode(mode === 'follow' ? 'explore' : 'follow')} className="block w-full rounded-sm px-2 py-1.5 text-left text-xs text-amber-200 hover:bg-white/5">
          {mode === 'follow' ? 'Stop following material' : 'Follow material'}
        </button>
      </Menu>

      <button
        onClick={() => setXray(!xray)}
        title="X-ray / process view: see liquid steel inside the equipment and the strand"
        className="hud-icon-btn" data-on={xray}
      >
        X-RAY
      </button>
      <button
        onClick={() => setSection(sectionS, !sectionOpen)}
        title="Strand cross-section and solidification profile"
        className="hud-icon-btn" data-on={sectionOpen}
      >
        <span className="xl:hidden">SOLID.</span><span className="hidden xl:inline">SOLIDIFICATION</span>
      </button>

      <Menu label={`Depth L${level}`}>
        <div className="px-2 pb-1 pt-0.5 text-[10px] uppercase tracking-widest text-zinc-500">Learning depth</div>
        {LEVELS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLevel(l.id)}
            className={`block w-full rounded-sm px-2 py-1.5 text-left text-xs hover:bg-white/5 ${level === l.id ? 'text-amber-200' : 'text-zinc-200'}`}
          >
            L{l.id} · {l.label}
          </button>
        ))}
      </Menu>
      <button className="hud-icon-btn" data-on={panels.help} onClick={() => togglePanel('help')} title="Controls (H)">?</button>
      </div>
    </header>
  );
}
