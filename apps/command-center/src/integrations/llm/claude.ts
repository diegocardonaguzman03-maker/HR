// Claude adapter (official Anthropic SDK). Used by the gateway, never by the
// browser: the API key must stay server-side.
// Refusal fallbacks are enabled ("default" routing) — a policy decline is
// retried server-side on a suitable fallback model inside the same call.
import Anthropic from '@anthropic-ai/sdk';
import type { ChatTurn, LLMAdapter } from '../types';

export function createClaudeAdapter(apiKey?: string, model = 'claude-opus-5-5'): LLMAdapter {
  // No key → the SDK resolves ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN / `ant auth login` profile.
  const client = apiKey ? new Anthropic({ apiKey }) : new Anthropic();
  return {
    id: 'claude',
    async complete({ system, messages, maxTokens = 16000 }: { system: string; messages: ChatTurn[]; maxTokens?: number }) {
      const response = await client.beta.messages.create({
        model,
        max_tokens: maxTokens,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'medium' },
        system,
        messages,
      });
      if (response.stop_reason === 'refusal') {
        return 'I can’t help with that request.';
      }
      return response.content
        .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
    },
  };
}
