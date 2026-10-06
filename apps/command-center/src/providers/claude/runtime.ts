// Minimal typings for the claude.ai artifact runtime (window.claude.use),
// covering only what this app calls. Authoritative contract: sample.d.ts /
// db.d.ts of the artifact runtime.

export interface SampleTool {
  name: string;
  description: string;
  inputSchema?: { type: 'object'; properties?: Record<string, unknown>; required?: string[] };
  execute(input: Record<string, unknown>, ctx: { signal: AbortSignal }): unknown;
}
export interface SampleOptions {
  onText?: (u: { text: string; delta: string }) => void;
  signal?: AbortSignal;
  tools?: SampleTool[];
  modelTier?: 'default' | 'complex' | 'quick';
  cache?: boolean;
}
export interface SampleFn {
  (input: string | { role: 'user' | 'assistant'; content: string }[], opts?: SampleOptions): Promise<{ text: string; truncated: boolean }>;
  limits(): Promise<{ maxPromptBytes: number; tools?: { maxCount: number } }>;
}
export interface SampleError {
  code: string;
  message: string;
  text?: string;
}

export interface DocSnap {
  id: string;
  exists: boolean;
  data(): Record<string, unknown> | undefined;
}
export interface QuerySnap {
  docs: DocSnap[];
  docChanges(): { type: 'added' | 'modified' | 'removed'; doc: DocSnap }[];
}
export interface DocRef {
  get(): Promise<DocSnap>;
  set(data: Record<string, unknown>): Promise<void>;
}
export interface CollectionRef {
  get(): Promise<QuerySnap>;
  doc(id?: string): DocRef;
  onSnapshot(next: (s: QuerySnap) => void, error?: (e: { code: string }) => void): () => void;
}
export interface DB {
  doc(path: string): DocRef;
  collection(path: string): CollectionRef;
}

interface ClaudeRuntime {
  use(name: 'sample'): Promise<SampleFn | null>;
  use(name: 'db'): Promise<DB | null>;
  use(name: 'mcp'): Promise<import('./RemoteOps').McpLike | null>;
  use(name: string): Promise<unknown>;
}

/** The artifact runtime, or null when the page is not running inside a Claude viewer. */
export function claudeRuntime(): ClaudeRuntime | null {
  if (typeof window === 'undefined') return null;
  const c = (window as unknown as { claude?: ClaudeRuntime }).claude;
  return c && typeof c.use === 'function' ? c : null;
}
