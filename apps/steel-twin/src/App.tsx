import { Component, type ReactNode } from 'react';
import { Experience } from './scene/Experience';
import { TopBar } from './ui/TopBar';
import { Navigator } from './ui/Navigator';
import { InfoPanel } from './ui/InfoPanel';
import { Timeline } from './ui/Timeline';
import { HoverTooltip, MaterialStrip, SolidificationPanel, TemperatureLegend } from './ui/ViewportOverlays';
import { ControlsHint, HelpOverlay, LayersDrawer, Minimap, MissionCard, StartScreen, StepBanner } from './ui/game/HUD';
import { useGameInput } from './ui/game/input';
import { MissionCompleteOverlay, Narrator, ProgressChip, QuizOverlay } from './ui/game/Evaluation';
import { useAppStore } from './store/useAppStore';

class SceneErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error)
      return (
        <div className="flex h-full items-center justify-center p-8 text-center text-sm text-zinc-400">
          <div>
            <div className="mb-2 font-semibold text-zinc-200">No se pudo iniciar la vista 3D.</div>
            <div>Puede que WebGL esté desactivado en este navegador. {this.state.error.message}</div>
          </div>
        </div>
      );
    return this.props.children;
  }
}

/** Full-screen 3D viewport with a game-style HUD layered on top. */
export default function App() {
  useGameInput();
  const started = useAppStore((s) => s.started);
  const selected = useAppStore((s) => s.selected);
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#15181d] text-zinc-200">
      <div className="absolute inset-0">
        <SceneErrorBoundary>
          <Experience />
        </SceneErrorBoundary>
      </div>

      {started && (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col">
          <TopBar />
          <div className="relative flex min-h-0 flex-1 flex-col gap-2 px-3 pb-2 md:flex-row md:gap-3">
            {/* left column */}
            <div className={`min-h-0 w-full shrink-0 flex-col gap-2 md:flex md:w-[370px] ${selected ? 'hidden' : 'flex'}`}>
              <MissionCard />
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <Navigator />
              </div>
            </div>
            {/* centre */}
            <div className="hidden min-w-0 flex-1 flex-col items-center md:flex">
              <MaterialStrip />
              <div className="flex-1" />
              <ControlsHint />
            </div>
            {/* right column */}
            <div className="flex min-h-0 flex-1 flex-col items-stretch gap-2 md:flex-none md:shrink-0 md:items-end">
              <ProgressChip />
              <LayersDrawer />
              <InfoPanel />
              <div className="hidden flex-1 md:block" />
              <TemperatureLegend />
              <SolidificationPanel />
              <Minimap />
            </div>
          </div>
          <Timeline />
        </div>
      )}

      <Narrator />
      <StepBanner />
      <MissionCompleteOverlay />
      <QuizOverlay />
      <HoverTooltip />
      <HelpOverlay />
      <StartScreen />
    </div>
  );
}
