// OpenAI adapter (Chat Completions). Server-side only.
import type { ChatTurn, LLMAdapter } from '../types';

export function createOpenAIAdapter(apiKey: string, model = 'gpt-4.1'): LLMAdapter {
  return {
    id: 'openai',
    async complete({ system, messages, maxTokens = 1024 }: { system: string; messages: ChatTurn[]; maxTokens?: number }) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'system', content: system }, ...messages] }),
      });
      if (!res.ok) throw new Error(`OpenAI API ${res.status}: ${await res.text()}`);
      const data = (await res.json()) as { choices: { message: { content: string } }[] };
      return data.choices[0]?.message.content?.trim() ?? '';
    },
  };
}
