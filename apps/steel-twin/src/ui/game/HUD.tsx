import { useEffect, useRef, useState } from 'react';
import { LAYERS, useAppStore } from '../../store/useAppStore';
import { equipmentName } from '../../data/equipment';
import { LAYOUT, CAMERA_PRESETS } from '../../config/layout';
import { steps } from '../../sim/clock';
import { currentPose, heatPosition } from '../../sim/kinematics';
import { MATERIAL_STATE_LABEL } from '../labels';
import { fmt, useSnapshot } from '../useSnapshot';
import { CONTROLS } from './input';
import type { CameraPresetId } from '../../types/process';

const DESKTOP_HINTS = [['Arrastrar', 'girar vista'], ['W A S D', 'moverse'], ['Espacio', 'reproducir / pausa'], ['Clic', 'inspeccionar equipo'], ['X', 'rayos X'], ['H', 'todos los controles']];
const TOUCH_HINTS = [['Arrastrar', 'girar vista'], ['Pellizcar', 'acercar'], ['Dos dedos', 'desplazar'], ['Tocar', 'inspeccionar equipo'], ['RAYOS X', 'ver por dentro'], ['?', 'todos los controles']];

/** True on phones and tablets (coarse pointer). */
export function useTouch() {
  const [touch] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches);
  return touch;
}

/** Title / attract screen. */
export function StartScreen() {
  const started = useAppStore((s) => s.started);
  const startGame = useAppStore((s) => s.startGame);
  const touch = useTouch();
  if (started) return null;
  return (
    <div className="absolute inset-0 z-40 flex items-center bg-gradient-to-r from-[#0b0d11]/95 via-[#0b0d11]/70 to-transparent">
      <div className="mx-4 max-h-full max-w-[620px] animate-[fadeUp_.8s_ease-out] overflow-y-auto py-6 md:ml-[7vw]">
        <div className="font-hud text-xs tracking-[0.5em] text-amber-400">GEMELO DE APRENDIZAJE · ACERÍA</div>
        <h1 className="font-hud mt-3 text-4xl sm:text-5xl font-bold leading-[1.05] tracking-wide text-zinc-50 md:text-6xl">
          DEL PELET
          <br />
          <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 bg-clip-text text-transparent">AL PLANCHÓN</span>
        </h1>
        <p className="mt-4 max-w-[520px] text-sm leading-relaxed text-zinc-400">
          Sigue el hierro de nuestras minas: el pelet se reduce a DRI en las plantas HYL y Midrex, viaja por banda al horno eléctrico, se funde, se afina y se cuela en un planchón. Sin chatarra comprada.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2">
          <button onClick={() => startGame('guided')} className="hud-btn-primary group">
            <span className="font-hud text-lg tracking-[0.2em]">▶ INICIAR MISIÓN</span>
            <span className="text-[11px] font-normal normal-case tracking-normal text-zinc-800">Recorrido guiado · 18 pasos · recomendado</span>
          </button>
          <button onClick={() => startGame('explore')} className="hud-btn-secondary">
            <span className="font-hud tracking-[0.2em]">EXPLORAR LIBRE</span>
            <span className="text-[11px] font-normal normal-case tracking-normal text-zinc-400">Recorre la planta y abre cualquier equipo</span>
          </button>
          <button onClick={() => startGame('follow')} className="hud-btn-secondary">
            <span className="font-hud tracking-[0.2em]">SEGUIR EL ACERO</span>
            <span className="text-[11px] font-normal normal-case tracking-normal text-zinc-400">La cámara acompaña a una colada</span>
          </button>
          <button onClick={() => { startGame('explore'); useAppStore.getState().setQuizOpen(true); }} className="hud-btn-secondary">
            <span className="font-hud tracking-[0.2em]">EVALUACIÓN</span>
            <span className="text-[11px] font-normal normal-case tracking-normal text-zinc-400">13 preguntas · aprueba con 80%</span>
          </button>
        </div>
        <div className="mt-6 grid max-w-[560px] grid-cols-2 gap-2 text-[11px] text-zinc-400 sm:mt-8 sm:grid-cols-3">
          {(touch ? TOUCH_HINTS : DESKTOP_HINTS).map(([k, v]) => (
            <div key={k} className="hud-chip"><span className="font-hud text-zinc-100">{k}</span> {v}</div>
          ))}
        </div>
        <div className="mt-6 text-[10px] uppercase tracking-[0.25em] text-zinc-600">{touch ? 'Toca un modo para empezar' : 'Presiona Enter para empezar'} · Datos simulados de capacitación</div>
      </div>
    </div>
  );
}

/** Mission objective card — answers the six critical UX questions at a glance. */
export function MissionCard() {
  const { step, stepIndex, total, progress, snap, next } = useSnapshot();
  const [open, setOpen] = useState(() => typeof window === 'undefined' || !!window.matchMedia?.('(min-width: 768px) and (min-height: 560px)').matches);
  const select = useAppStore((s) => s.select);
  return (
    <div className="hud-panel pointer-events-auto w-full p-3 md:w-[370px] md:p-3.5">
      <div className="flex items-center justify-between">
        <span className="font-hud text-[11px] tracking-[0.3em] text-amber-400">MISIÓN {String(stepIndex + 1).padStart(2, '0')}/{total}</span>
        <button onClick={() => setOpen((o) => !o)} className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-200">{open ? 'Ocultar' : 'Ver'}</button>
      </div>
      <div className="font-hud mt-0.5 text-lg font-semibold md:text-xl uppercase tracking-wide text-zinc-50">{step.title}</div>
      <div className="mt-2 h-1 overflow-hidden bg-white/10">
        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-[width] duration-200" style={{ width: `${progress * 100}%` }} />
      </div>
      {open && (
        <div className="mt-3 space-y-2 text-[12px] leading-snug">
          <div className="grid grid-cols-3 gap-1.5">
            <Stat k="Acero en" v={snap.location} />
            <Stat k="Estado" v={MATERIAL_STATE_LABEL[snap.materialState]} />
            <Stat k="Temp." v={`${fmt(snap.steelTemperature.value)} °C`} mono />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Objetivo · </span>
            <span className="text-zinc-200">{step.whatHappens}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Por qué · </span>
            <span className="text-zinc-400">{step.why}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">En operación</span>
            {step.activeEquipment.map((id) => (
              <button key={id} onClick={() => select(id)} className="hud-chip hover:border-amber-400/70 hover:text-amber-200">
                {equipmentName(id)}
              </button>
            ))}
          </div>
          {next && (
            <div className="text-[11px] text-zinc-500">
              SIGUE ▸ <span className="text-zinc-300">{next.title}</span> <span className="text-zinc-600">(N)</span>
            </div>
          )}
          <div className="text-[10px] text-zinc-600">{snap.heatId}</div>
        </div>
      )}
    </div>
  );
}

function Stat({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="border border-white/[0.08] bg-white/[0.03] px-2 py-1">
      <div className="text-[9px] uppercase tracking-widest text-zinc-500">{k}</div>
      <div className={`truncate text-[11.5px] font-semibold text-zinc-100 ${mono ? 'font-hud' : ''}`} title={v}>{v}</div>
    </div>
  );
}

/** Animated banner when a new step starts. */
export function StepBanner() {
  const stepIndex = useAppStore((s) => s.stepIndex);
  const started = useAppStore((s) => s.started);
  const [show, setShow] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setShow(true);
    const t = setTimeout(() => setShow(false), 1900);
    return () => clearTimeout(t);
  }, [stepIndex]);
  if (!started || !show) return null;
  const s = steps()[stepIndex];
  return (
    <div key={stepIndex} className="pointer-events-none absolute left-1/2 top-[22%] z-30 -translate-x-1/2 animate-[banner_1.9s_ease-in-out] text-center">
      <div className="font-hud text-sm tracking-[0.5em] text-amber-400">PASO {String(stepIndex + 1).padStart(2, '0')}</div>
      <div className="font-hud mt-1 px-4 text-2xl font-bold md:text-4xl uppercase tracking-wider text-zinc-50 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">{s.title}</div>
      <div className="mx-auto mt-2 h-px w-64 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
    </div>
  );
}

/** Top-down minimap: stations, steel position, camera; click to fly there. */
export function Minimap() {
  const open = useAppStore((s) => s.panels.minimap);
  const requestCamera = useAppStore((s) => s.requestCamera);
  const stepIndex = useAppStore((s) => s.stepIndex);
  useAppStore((s) => s.uiTime);
  if (!open) return null;
  const X0 = -120, X1 = 62, Z0 = -14, Z1 = 14;
  const W = 300, H = 72;
  const sx = (x: number) => ((x - X0) / (X1 - X0)) * W;
  const sz = (z: number) => ((z - Z0) / (Z1 - Z0)) * H;
  const steel = heatPosition(currentPose());
  const stations: { id: CameraPresetId; x: number; label: string }[] = [
    { id: 'reduction', x: LAYOUT.hyl.position[0], label: 'HYL·MIDREX' },
    { id: 'rawMaterials', x: LAYOUT.rawMaterials.position[0] + 4, label: 'SILOS DRI' },
    { id: 'eaf', x: LAYOUT.eaf.position[0], label: 'HAE' },
    { id: 'secondary', x: LAYOUT.ladleFurnace.position[0], label: 'H. OLLA' },
    { id: 'tundish', x: LAYOUT.tundish.position[0] - 3, label: 'COLADA' },
    { id: 'cutting', x: 38.8, label: 'CORTE' },
    { id: 'slab', x: LAYOUT.slabYard[0], label: 'PLANCHÓN' },
  ];
  const activeCam = steps()[stepIndex].camera;
  return (
    <div className="hud-panel pointer-events-auto hidden p-2 md:block">
      <div className="mb-1 flex justify-between text-[9px] uppercase tracking-[0.25em] text-zinc-500">
        <span>Mapa de planta</span>
        <span className="text-amber-400">● acero</span>
      </div>
      <svg width={W} height={H} className="block">
        <rect x={0} y={0} width={W} height={H} fill="#0e1116" />
        <line x1={sx(-115)} y1={sz(0)} x2={sx(60)} y2={sz(0)} stroke="#2b3139" strokeWidth={10} />
        {stations.map((s) => (
          <g key={s.id} className="cursor-pointer" onClick={() => requestCamera({ kind: 'preset', preset: s.id })}>
            <rect x={sx(s.x) - 9} y={sz(0) - 9} width={18} height={18} fill={activeCam === s.id ? '#3a2d12' : '#1c2128'} stroke={activeCam === s.id ? '#ffb020' : '#48505b'} />
            <text x={sx(s.x)} y={sz(0) + 22} textAnchor="middle" fontSize={8} fill={activeCam === s.id ? '#ffcf6b' : '#7c848f'} fontFamily="Oxanium, sans-serif">{s.label}</text>
          </g>
        ))}
        <circle cx={sx(steel[0])} cy={sz(steel[2])} r={4.5} fill="#ffb020">
          <animate attributeName="r" values="3.5;6;3.5" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <text x={4} y={10} fontSize={8} fill="#5d6570" fontFamily="Oxanium, sans-serif">haz clic en una estación para ir</text>
      </svg>
    </div>
  );
}

/** Controls reference overlay. */
export function HelpOverlay() {
  const open = useAppStore((s) => s.panels.help);
  const toggle = useAppStore((s) => s.togglePanel);
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => toggle('help', false)}>
      <div className="hud-panel max-h-[90%] w-[min(640px,calc(100vw-32px))] overflow-y-auto p-5 md:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="font-hud text-lg tracking-[0.3em] text-amber-400">CONTROLES</div>
          <button onClick={() => toggle('help', false)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-1.5 md:grid-cols-2">
          {CONTROLS.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b border-white/[0.06] py-1 text-sm">
              <span className="font-hud text-zinc-100">{k}</span>
              <span className="text-zinc-400">{v}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-zinc-500">Todos los valores del proceso son datos simulados de capacitación, no límites de operación de una planta real.</p>
      </div>
    </div>
  );
}

/** Layer toggles drawer (L). */
export function LayersDrawer() {
  const open = useAppStore((s) => s.panels.layers);
  const layers = useAppStore((s) => s.layers);
  const toggleLayer = useAppStore((s) => s.toggleLayer);
  const toggle = useAppStore((s) => s.togglePanel);
  if (!open) return null;
  return (
    <div className="hud-panel pointer-events-auto w-[230px] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-hud text-[11px] tracking-[0.3em] text-amber-400">CAPAS</span>
        <button onClick={() => toggle('layers', false)} className="text-xs text-zinc-500 hover:text-zinc-200">✕</button>
      </div>
      {LAYERS.map((l) => (
        <button key={l.id} onClick={() => toggleLayer(l.id)} className="flex w-full items-center justify-between py-1 text-left text-xs text-zinc-300 hover:text-white">
          {l.label}
          <span className={`h-3.5 w-7 rounded-full p-0.5 transition ${layers[l.id] ? 'bg-amber-400' : 'bg-zinc-700'}`}>
            <span className={`block h-2.5 w-2.5 rounded-full bg-zinc-900 transition ${layers[l.id] ? 'translate-x-3.5' : ''}`} />
          </span>
        </button>
      ))}
    </div>
  );
}

export function ControlsHint() {
  const started = useAppStore((s) => s.started);
  if (!started) return null;
  return (
    <div className="pointer-events-none hidden text-[10px] uppercase tracking-[0.2em] text-zinc-500 md:block">
      Arrastrar girar · WASD moverse · Rueda acercar · Espacio reproducir · <span className="text-zinc-300">H ayuda</span>
    </div>
  );
}

export const presetLabel = (p: CameraPresetId) => CAMERA_PRESETS[p].label;
