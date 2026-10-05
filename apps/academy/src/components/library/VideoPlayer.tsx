import { useRef, useState } from 'react';
import { idx } from '../../lib/content';
import { useApp } from '../../stores/useApp';
import { Modal } from '../ui/Modal';
import { StatusChip, btn } from '../ui/Status';
import { asset } from '../../lib/download';
import { track } from '../../lib/analytics';

const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

/** Reproductor accesible: controles nativos, subtítulos (VTT), capítulos y pantalla completa. */
export function VideoPlayer() {
  const { videoId, set } = useApp();
  const v = videoId ? idx.video.get(videoId) : null;
  const ref = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0);
  const [failed, setFailed] = useState(false);
  if (!v) return null;
  const chapterIdx = v.chapters.reduce((a, c, i) => (t >= c.t ? i : a), 0);
  return (
    <Modal title={v.title} onClose={() => set({ videoId: null })} wide testid="video-player">
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2"><StatusChip status={v.status} /><span className="text-[12px] text-[var(--color-text-3)]">Video placeholder de demostración generado desde el modelo 3D. No muestra la operación real de la planta.</span></div>
        <div ref={box} className="relative overflow-hidden rounded-lg bg-black">
          <p className="pointer-events-none absolute left-2 top-2 z-10 rounded bg-black/70 px-2 py-0.5 font-mono text-[11px] text-[var(--color-st-demo)]">◇ DEMO · modelo esquemático, no es operación real · no sustituye procedimientos aprobados</p>
          {failed ? (
            <div className="grid aspect-video place-items-center text-center text-[var(--color-text-2)]"><p>Video no disponible en esta versión.<br />Ejecuta <code>npm run video</code> para generarlo.</p></div>
          ) : (
            <video ref={ref} className="aspect-video w-full" controls preload="metadata" crossOrigin="anonymous" onTimeUpdate={(e) => setT(e.currentTarget.currentTime)} onPlay={() => track('played', v.id)} onError={() => setFailed(true)} data-testid="video-element">
              <source src={asset(v.file)} type="video/webm" />
              <track kind="captions" src={asset(v.captions)} srcLang="es" label="Español" default />
            </video>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button className={btn} onClick={() => (box.current?.requestFullscreen ? box.current.requestFullscreen() : undefined)}><span aria-hidden>⛶</span> Pantalla completa</button>
          <span className="font-mono text-[12px] text-[var(--color-text-3)]">{mmss(t)} / {mmss(v.durationSec)}</span>
        </div>
        <h3 className="label mb-2 mt-4">Capítulos</h3>
        <ol className="grid gap-1 sm:grid-cols-2">
          {v.chapters.map((c, i) => (
            <li key={i}>
              <button aria-current={i === chapterIdx} className={`flex w-full items-center gap-3 rounded border px-3 py-2 text-left text-[13px] ${i === chapterIdx ? 'border-[var(--color-accent)] bg-[var(--color-surface-2)]' : 'border-[var(--color-line)] hover:bg-[var(--color-surface-2)]'}`}
                onClick={() => { if (ref.current) { ref.current.currentTime = c.t; void ref.current.play().catch(() => undefined); } }}>
                <span className="font-mono text-[var(--color-accent)]">{mmss(c.t)}</span>{c.title}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </Modal>
  );
}
