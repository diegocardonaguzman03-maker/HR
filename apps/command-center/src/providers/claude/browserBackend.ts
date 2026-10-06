// Web (non-claude.ai) backend for ClaudeAgentProvider.
//
// • sample(): the Claude Messages API called from the browser with the
//   user's own API key (official SDK, dangerouslyAllowBrowser). Implements the
//   same contract as the artifact runtime's `sample` — streaming text and a
//   page-tool loop — so the provider code is identical in both places.
// • LocalDB: the subset of the artifact `db` API the event log uses, backed by
//   localStorage, with cross-tab sync through the `storage` event.
//
// The key stays in this browser (localStorage) and is sent only to
// api.anthropic.com.
import Anthropic from '@anthropic-ai/sdk';
import type { CollectionRef, DB, DocRef, DocSnap, QuerySnap, SampleFn, SampleOptions } from './runtime';

const KEY_STORAGE = 'fcc.anthropicKey';
export const WEB_MODEL = 'claude-opus-5-5';

export function getStoredApiKey(): string | null {
  try {
    return localStorage.getItem(KEY_STORAGE);
  } catch {
    return null;
  }
}
export function storeApiKey(key: string | null): void {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* storage blocked: the key lasts for this page load only */
  }
}

type Turn = { role: 'user' | 'assistant'; content: string };

export function createBrowserSample(apiKey: string, model = WEB_MODEL): SampleFn {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const fn = (async (input: string | Turn[], opts: SampleOptions = {}): Promise<{ text: string; truncated: boolean }> => {
    // Merge consecutive same-role turns (the page may send two user turns in a row).
    const turns: Turn[] = typeof input === 'string' ? [{ role: 'user', content: input }] : [];
    if (typeof input !== 'string') for (const t of input) {
      const last = turns[turns.length - 1];
      if (last?.role === t.role) last.content += `\n\n${t.content}`;
      else turns.push({ ...t });
    }
    const messages: Anthropic.Beta.BetaMessageParam[] = turns;
    const tools: Anthropic.Beta.BetaTool[] | undefined = opts.tools?.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: (t.inputSchema ?? { type: 'object', properties: {} }) as Anthropic.Beta.BetaTool.InputSchema,
    }));
    let text = '';
    try {
      for (let round = 0; round < 6; round++) {
        const stream = client.beta.messages.stream(
          {
            model,
            max_tokens: 16000,
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default',
            messages,
            ...(tools?.length ? { tools } : {}),
          },
          { signal: opts.signal },
        );
        let roundText = '';
        stream.on('text', (delta) => {
          if (!delta) return;
          const sep = roundText === '' && text !== '' ? '\n\n' : '';
          roundText += delta;
          text += sep + delta;
          opts.onText?.({ text, delta: sep + delta });
        });
        const msg = await stream.finalMessage();
        if (msg.stop_reason === 'refusal') throw { code: 'refused', message: 'Claude declined this request.' };
        const uses = msg.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === 'tool_use');
        if (msg.stop_reason !== 'tool_use' || !uses.length) {
          if (!text.trim()) throw { code: 'empty_completion', message: 'Claude produced no text.' };
          return { text, truncated: msg.stop_reason === 'max_tokens' };
        }
        // Append the whole assistant turn unchanged (thinking blocks included), then the tool results.
        messages.push({ role: 'assistant', content: msg.content });
        const results: Anthropic.Beta.BetaToolResultBlockParam[] = await Promise.all(
          uses.map(async (u) => {
            const tool = opts.tools?.find((t) => t.name === u.name);
            try {
              if (!tool) throw new Error(`Unknown tool ${u.name}`);
              const out = await tool.execute((u.input ?? {}) as Record<string, unknown>, { signal: opts.signal ?? new AbortController().signal });
              return { type: 'tool_result', tool_use_id: u.id, content: typeof out === 'string' ? out : JSON.stringify(out ?? null) };
            } catch (e) {
              return { type: 'tool_result', tool_use_id: u.id, content: `Error: ${(e as Error).message}`, is_error: true };
            }
          }),
        );
        messages.push({ role: 'user', content: results });
      }
      return { text: text || 'Done.', truncated: false };
    } catch (err) {
      if ((err as { code?: string }).code) throw { ...(err as object), text: text || undefined };
      if (err instanceof Anthropic.APIUserAbortError) throw { code: 'cancelled', message: 'Stopped', text: text || undefined };
      if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError)
        throw { code: 'not_granted', message: 'The API key was rejected. Check it in Settings.' };
      if (err instanceof Anthropic.RateLimitError) throw { code: 'rate_limited', message: 'Rate limited', text: text || undefined };
      if (err instanceof Anthropic.APIError) throw { code: 'upstream_error', message: `${err.status ?? ''} ${err.message}`.trim(), text: text || undefined };
      throw { code: 'upstream_error', message: String((err as Error)?.message ?? err), text: text || undefined };
    }
  }) as unknown as SampleFn;
  fn.limits = async () => ({ maxPromptBytes: 262144, tools: { maxCount: 32 } });
  return fn;
}

// ───────────────────────── LocalDB ─────────────────────────

const PREFIX = 'fcc.db/';

function read(path: string): Record<string, unknown> | undefined {
  try {
    const raw = localStorage.getItem(PREFIX + path);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

const snap = (path: string, data: Record<string, unknown> | undefined): DocSnap => ({
  id: path.split('/').pop()!,
  exists: data !== undefined,
  data: () => data,
});

export function storageAvailable(): boolean {
  try {
    localStorage.setItem('fcc.probe', '1');
    localStorage.removeItem('fcc.probe');
    return true;
  } catch {
    return false;
  }
}

export class LocalDB implements DB {
  doc(path: string): DocRef {
    return {
      get: async () => snap(path, read(path)),
      set: async (data) => {
        try {
          localStorage.setItem(PREFIX + path, JSON.stringify(data));
        } catch {
          throw { code: 'quota_exceeded', message: 'Browser storage is full' };
        }
      },
    };
  }

  collection(path: string): CollectionRef {
    const docsIn = (): DocSnap[] => {
      const out: DocSnap[] = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k?.startsWith(`${PREFIX}${path}/`)) continue;
          const docPath = k.slice(PREFIX.length);
          if (docPath.split('/').length !== path.split('/').length + 1) continue;
          out.push(snap(docPath, read(docPath)));
        }
      } catch {
        /* storage blocked */
      }
      return out.sort((a, b) => a.id.localeCompare(b.id));
    };
    return {
      get: async (): Promise<QuerySnap> => {
        const docs = docsIn();
        return { docs, docChanges: () => docs.map((doc) => ({ type: 'added' as const, doc })) };
      },
      doc: (id?: string) => this.doc(`${path}/${id ?? Math.random().toString(36).slice(2)}`),
      onSnapshot: (next) => {
        // Other tabs' writes arrive as `storage` events.
        const onStorage = (e: StorageEvent) => {
          if (!e.key?.startsWith(`${PREFIX}${path}/`) || !e.newValue) return;
          const docPath = e.key.slice(PREFIX.length);
          const doc = snap(docPath, JSON.parse(e.newValue) as Record<string, unknown>);
          next({ docs: [doc], docChanges: () => [{ type: 'modified', doc }] });
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
      },
    };
  }
}
