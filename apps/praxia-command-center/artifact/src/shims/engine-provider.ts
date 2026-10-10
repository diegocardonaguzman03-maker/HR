/**
 * Artifact build of the engine provider: the agents' work runs on the viewer's own Claude (`claude.use("sample")`).
 * The first run asks the viewer to allow it; usage is billed to the viewer's Claude plan, not to an API key.
 */
import type { EngineProvider } from "@/server/engine/types";

type Sample = ((input: string, opts?: { modelTier?: "quick" | "default" | "complex"; cache?: boolean }) => Promise<{ text: string; truncated: boolean }>) | null;
declare global { interface Window { claude?: { use(name: string): Promise<unknown> } } }

let sample: Sample | undefined;
let pending: Promise<Sample> | null = null;
/** Resolves once at load; the provider stays "unavailable" until the viewer's Claude answers. */
export function prepareEngineProvider(): Promise<Sample> {
  pending ??= (window.claude ? (window.claude.use("sample") as Promise<Sample>) : Promise.resolve(null)).then((s) => (sample = s ?? null)).catch(() => (sample = null));
  return pending;
}

const CODES: Record<string, string> = {
  not_granted: "You declined Claude for this page — allow it from the artifact's permissions to run the engine.",
  rate_limited: "Claude is busy for this viewer — try again in a minute.",
};

export function getEngineProvider(): EngineProvider {
  if (sample === undefined) void prepareEngineProvider();
  const available = !!sample;
  return {
    name: "claude-viewer",
    model: "Claude (your claude.ai account)",
    available,
    reason: available ? undefined : sample === null ? "Claude is not available in this view (open the artifact in claude.ai)." : "Connecting to Claude…",
    async complete({ system, prompt }) {
      if (!sample) throw new Error("Claude is not available in this view.");
      try {
        const { text, truncated } = await sample(`${system}\n\n---\n\n${prompt}`, { modelTier: "default", cache: false });
        if (!text.trim()) throw new Error("Empty answer.");
        return { text: truncated ? `${text}\n\n[Truncated]` : text, costUsdMicros: 0, model: "claude.ai (viewer plan)" };
      } catch (e) {
        const code = (e as { code?: string }).code;
        throw new Error(code ? (CODES[code] ?? `Claude error: ${code}`) : e instanceof Error ? e.message : String(e));
      }
    },
  };
}
