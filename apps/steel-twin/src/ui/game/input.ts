/**
 * Game-style keyboard input. Movement keys are polled every frame by the
 * camera rig; action keys dispatch store actions immediately.
 */
import { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { CameraPresetId } from '../../types/process';

export const keys = new Set<string>();

const PRESET_KEYS: Record<string, CameraPresetId> = {
  Digit1: 'overview', Digit2: 'rawMaterials', Digit3: 'eaf', Digit4: 'secondary', Digit5: 'caster',
  Digit6: 'tundish', Digit7: 'mold', Digit8: 'strand', Digit9: 'cutting', Digit0: 'slab',
};

const MOVE = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight']);

export function useGameInput() {
  useEffect(() => {
    const isTyping = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    };
    const down = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      const st = useAppStore.getState();
      if (!st.started && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        st.startGame('guided');
        return;
      }
      if (MOVE.has(e.code)) {
        keys.add(e.code);
        if (e.code.startsWith('Arrow')) e.preventDefault();
        if (st.followCamera && e.code !== 'ShiftLeft' && e.code !== 'ShiftRight') st.setMode('explore');
        return;
      }
      const preset = PRESET_KEYS[e.code];
      if (preset) {
        st.requestCamera({ kind: 'preset', preset });
        return;
      }
      switch (e.code) {
        case 'Space': e.preventDefault(); st.togglePlay(); break;
        case 'KeyN': case 'PageDown': st.next(); break;
        case 'KeyB': case 'PageUp': st.prev(); break;
        case 'KeyG': st.setMode(st.mode === 'guided' ? 'explore' : 'guided'); break;
        case 'KeyF': st.setMode(st.mode === 'follow' ? 'explore' : 'follow'); break;
        case 'KeyX': st.setXray(!st.xray); break;
        case 'KeyT': st.toggleLayer('temperature'); break;
        case 'KeyL': st.togglePanel('layers'); break;
        case 'KeyV': st.setSection(st.sectionS, !st.sectionOpen); break;
        case 'KeyC': if (st.selected) st.setComponentMode(!st.componentMode); break;
        case 'KeyM': st.togglePanel('minimap'); break;
        case 'Tab': e.preventDefault(); st.togglePanel('navigator'); break;
        case 'KeyH': case 'Slash': st.togglePanel('help'); break;
        case 'KeyR': st.requestCamera({ kind: 'preset', preset: 'overview' }); break;
        case 'Escape':
          if (st.panels.help) st.togglePanel('help');
          else if (st.componentMode) st.setComponentMode(false);
          else if (st.selected || st.markerFocus) { st.select(null); st.setMarkerFocus(null); }
          else if (st.mode !== 'explore') st.setMode('explore');
          break;
        default: break;
      }
    };
    const up = (e: KeyboardEvent) => keys.delete(e.code);
    const blur = () => keys.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);
}

export const CONTROLS: [string, string][] = [
  ['Mouse drag', 'Orbit camera'],
  ['Right drag / Shift+drag', 'Pan'],
  ['Wheel', 'Zoom'],
  ['W A S D / arrows', 'Move camera'],
  ['Q / E', 'Down / up'],
  ['Shift', 'Move faster'],
  ['Click machine', 'Inspect equipment'],
  ['Space', 'Play / pause process'],
  ['N / B', 'Next / previous step'],
  ['G', 'Guided tour'],
  ['F', 'Follow the steel'],
  ['X', 'X-ray view'],
  ['V', 'Solidification viewer'],
  ['T', 'Temperature layer'],
  ['L', 'Layers'],
  ['C', 'Explore selected machine'],
  ['1 – 0', 'Camera views'],
  ['R', 'Reset camera'],
  ['Tab', 'Stage list'],
  ['M', 'Minimap'],
  ['H', 'Help'],
  ['Esc', 'Back / close'],
];
