/**
 * LLM provider for the autonomous engine (server build). Uses the Anthropic API when credentials are configured
 * (ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN). The Artifact build swaps this module for one that runs on the
 * viewer's own Claude (`claude.use("sample")`).
 */
import Anthropic from "@anthropic-ai/sdk";
import type { EngineProvider } from "./types";

const MODEL = "claude-opus-5-5";
// Claude Opus 5.5 list price: USD 4 / 1M input tokens, USD 20 / 1M output tokens → micro-dollars per token.
const MICROS_PER_INPUT_TOKEN = 4;
const MICROS_PER_OUTPUT_TOKEN = 20;

export function getEngineProvider(): EngineProvider {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return {
      name: "anthropic",
      model: MODEL,
      available: false,
      reason: "No Anthropic credentials on the server (set ANTHROPIC_API_KEY). Nothing runs until you configure them.",
      complete: async () => { throw new Error("Engine provider not configured."); },
    };
  }
  const client = new Anthropic();
  return {
    name: "anthropic",
    model: MODEL,
    available: true,
    async complete({ system, prompt, maxTokens = 16000 }) {
      const stream = client.beta.messages.stream({
        model: MODEL,
        max_tokens: maxTokens,
        output_config: { effort: "medium" },
        betas: ["server-side-fallback-2026-07-01"],
        // Re-runs a safety-declined request on Anthropic's recommended fallback model.
        ...({ fallbacks: "default" } as object),
        system,
        messages: [{ role: "user", content: prompt }],
      });
      const msg = await stream.finalMessage();
      if (msg.stop_reason === "refusal") throw new Error("The model declined this task (refusal). Review the instructions.");
      const text = msg.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
      if (!text) throw new Error(`Empty response (stop reason: ${msg.stop_reason}).`);
      const cost = msg.usage.input_tokens * MICROS_PER_INPUT_TOKEN + msg.usage.output_tokens * MICROS_PER_OUTPUT_TOKEN;
      return { text, costUsdMicros: cost, model: msg.model };
    },
  };
}
