"use client";

/**
 * PRAXIA World v0 — isometric HQ view of the Command Center.
 *
 * Renders a PixiJS 8 canvas (loaded with a dynamic import, client only) plus a small DOM legend and camera
 * controls. The host page owns the agent detail panel; this component only reports selection changes.
 * It renders exactly the statuses it receives: no simulated activity.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { Application } from "pixi.js";
import type { PraxiaWorldProps } from "./types";
import type { WorldScene } from "./scene";
import { STATUS_ORDER, STATUS_VISUALS, TONE_COLORS, statusVisual, toCssHex } from "./layout";

const FALLBACK_MONO = `"Space Mono", Consolas, ui-monospace, monospace`;

/** Picks up the app's next/font Space Mono family when present; falls back to the plain family name. */
function resolveMonoFont(el: HTMLElement): string {
  const css = getComputedStyle(el);
  const nextFont = css.getPropertyValue("--font-space-mono").trim();
  return nextFont ? `${nextFont}, ${FALLBACK_MONO}` : FALLBACK_MONO;
}

/** Waits (briefly) for the mono font so canvas labels do not render with the fallback face. */
async function waitForFont(family: string): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, 1500));
  const load = Promise.all([document.fonts.load(`400 10px ${family}`), document.fonts.load(`700 10px ${family}`)])
    .then(() => undefined)
    .catch(() => undefined);
  await Promise.race([load, timeout]);
}

export default function PraxiaWorld({ agents, selectedAgentId, onSelectAgent, reducedMotion = false, events, focus }: PraxiaWorldProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<WorldScene | null>(null);
  const latest = useRef({ agents, selectedAgentId, onSelectAgent, reducedMotion });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [legendOpen, setLegendOpen] = useState(true);

  useEffect(() => {
    latest.current = { agents, selectedAgentId, onSelectAgent, reducedMotion };
  });

  // Create / destroy the PixiJS application. Init is async, so an unmount (or a StrictMode double-mount)
  // can happen before it resolves: the `disposed` flag makes the late init tear itself down.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let app: Application | null = null;
    let scene: WorldScene | null = null;
    let observer: ResizeObserver | null = null;

    (async () => {
      try {
        const [{ Application }, { createWorldScene }] = await Promise.all([import("pixi.js"), import("./scene")]);
        if (disposed) return;
        const fontFamily = resolveMonoFont(host);
        await waitForFont(fontFamily);
        if (disposed) return;

        const instance = new Application();
        await instance.init({
          background: "#0C0D12",
          antialias: true,
          resizeTo: host,
          autoDensity: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
        });
        if (disposed) {
          instance.destroy({ removeView: true }, { children: true });
          return;
        }
        app = instance;
        const canvas = instance.canvas;
        canvas.style.position = "absolute";
        canvas.style.inset = "0";
        canvas.style.display = "block";
        canvas.setAttribute("aria-hidden", "true");
        host.appendChild(canvas);

        const current = latest.current;
        scene = createWorldScene(instance, {
          fontFamily,
          reducedMotion: current.reducedMotion,
          onSelect: (id) => latest.current.onSelectAgent(id),
        });
        scene.setAgents(current.agents);
        scene.setSelected(current.selectedAgentId);
        sceneRef.current = scene;
        // `resizeTo` only listens to window resizes; also follow layout changes of the host (e.g. side panels).
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(() => instance.queueResize());
          observer.observe(host);
        }
        setReady(true);
      } catch (error) {
        if (!disposed) {
          console.error("[PraxiaWorld] could not start the renderer", error);
          setFailed(true);
        }
      }
    })();

    return () => {
      disposed = true;
      sceneRef.current = null;
      setReady(false);
      observer?.disconnect();
      scene?.destroy();
      app?.destroy({ removeView: true }, { children: true });
    };
  }, []);

  useEffect(() => {
    if (ready) sceneRef.current?.setAgents(agents);
  }, [agents, ready]);

  useEffect(() => {
    if (ready) sceneRef.current?.setSelected(selectedAgentId);
  }, [selectedAgentId, ready]);

  useEffect(() => {
    if (ready) sceneRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion, ready]);

  // Events play after the agents they refer to are updated (same commit, effects run in order).
  useEffect(() => {
    if (ready && events?.length) sceneRef.current?.playEvents(events);
  }, [events, ready]);

  useEffect(() => {
    if (ready && focus) sceneRef.current?.focusAgent(focus.agentId);
  }, [focus, ready]);

  const counts = useMemo(() => {
    const c = new Map<string, number>();
    for (const a of agents) {
      const key = STATUS_VISUALS[a.status] ? a.status : "offline";
      c.set(key, (c.get(key) ?? 0) + 1);
    }
    return c;
  }, [agents]);

  const sortedAgents = useMemo(() => [...agents].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)), [agents]);

  return (
    <section
      aria-label="PRAXIA World: isometric headquarters"
      className="relative h-full min-h-[420px] w-full overflow-hidden"
      style={{ background: "var(--color-graphite, #0C0D12)" }}
    >
      <div ref={hostRef} className="absolute inset-0" />

      {/* Legend (top-left) */}
      <div
        className="absolute left-3 top-3 max-w-[280px] rounded-md border p-3"
        style={{
          background: "color-mix(in srgb, var(--color-graphite-2, #15161D) 92%, transparent)",
          borderColor: "var(--color-hair, #2a2b33)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--color-indigo, #5B4BFF)" }}>
            Agent status
          </span>
          <button
            type="button"
            onClick={() => setLegendOpen((v) => !v)}
            aria-expanded={legendOpen}
            className="font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color: "var(--color-niebla, #A7AAB5)" }}
          >
            {legendOpen ? "Hide" : "Show"}
          </button>
        </div>
        {legendOpen && (
          <>
            <ul className="mt-2 space-y-1">
              {STATUS_ORDER.map((status) => {
                const v = STATUS_VISUALS[status];
                const color = toCssHex(TONE_COLORS[v.tone]);
                const glyph = v.bubble === "approval" ? "!" : v.bubble === "input" ? "?" : null;
                return (
                  <li key={status} className="flex items-center gap-2 text-[12px]" style={{ color: "var(--color-ivory, #F5F2EC)" }}>
                    <span
                      aria-hidden="true"
                      className="inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full font-mono text-[8px] font-bold"
                      style={{
                        background: color,
                        opacity: status === "offline" ? 0.45 : 1,
                        color: "var(--color-graphite, #0C0D12)",
                      }}
                    >
                      {glyph}
                    </span>
                    <span className="flex-1">{v.label}</span>
                    <span className="font-mono text-[11px]" style={{ color: "var(--color-niebla, #A7AAB5)" }}>
                      {counts.get(status) ?? 0}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-[11px] leading-snug" style={{ color: "var(--color-niebla, #A7AAB5)" }}>
              Statuses, desk inboxes, progress bars and flying documents all come from real task records and events.
              With no execution engine connected, an agent works only on tasks you set to In progress.
            </p>
          </>
        )}
      </div>

      {/* Camera controls (bottom-right) */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1">
        <span className="mr-2 hidden font-mono text-[10px] uppercase tracking-[0.16em] sm:inline" style={{ color: "var(--color-niebla, #A7AAB5)" }}>
          Drag to pan · Scroll to zoom
        </span>
        {[
          { label: "Zoom out", text: "−", run: () => sceneRef.current?.zoomBy(1 / 1.2) },
          { label: "Zoom in", text: "+", run: () => sceneRef.current?.zoomBy(1.2) },
          { label: "Fit the whole HQ", text: "Fit", run: () => sceneRef.current?.fit() },
          ...(selectedAgentId ? [{ label: `Focus ${selectedAgentId}`, text: "Focus", run: () => sceneRef.current?.focusAgent(selectedAgentId) }] : []),
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            aria-label={b.label}
            title={b.label}
            disabled={!ready}
            onClick={b.run}
            className="h-7 min-w-7 rounded border px-2 font-mono text-[11px] uppercase disabled:opacity-40"
            style={{
              background: "var(--color-graphite-2, #15161D)",
              borderColor: "var(--color-hair, #2a2b33)",
              color: "var(--color-ivory, #F5F2EC)",
            }}
          >
            {b.text}
          </button>
        ))}
      </div>

      {failed && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <p className="max-w-sm text-[13px]" style={{ color: "var(--color-niebla, #A7AAB5)" }}>
            PRAXIA World could not start: this browser did not provide WebGL. The same agents and live statuses are available in the <a href="/agents" style={{ textDecoration: "underline" }}>agent registry</a>.
          </p>
        </div>
      )}

      {/* Keyboard and screen-reader access to the same selection the canvas offers. */}
      <ul className="sr-only" aria-label="Agents in PRAXIA World">
        {sortedAgents.map((a) => (
          <li key={a.id}>
            <button type="button" aria-pressed={selectedAgentId === a.id} onClick={() => onSelectAgent(a.id)}>
              {`${a.id}, ${a.role}, ${a.department}: ${statusVisual(a.status).label}`}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
