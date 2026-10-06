// Integration layer contracts. Business logic depends on these interfaces,
// never on a specific vendor SDK. Adapters live in /integrations/<id>.
//
// IMPORTANT: files in this folder are imported by the Node gateway
// (server/gateway.ts, run with type-stripping), so they must only use
// `import type` between each other and must not use path aliases.

export type IntegrationCategory = 'llm' | 'storage' | 'email' | 'calendar' | 'chat' | 'knowledge' | 'code' | 'internal';

export interface IntegrationDescriptor {
  id: string;
  name: string;
  category: IntegrationCategory;
  /** Environment variables the gateway needs to enable this adapter. */
  env: string[];
  status: 'connected' | 'not_connected';
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/** Any LLM vendor (Claude, OpenAI, local models…) implements this. */
export interface LLMAdapter {
  readonly id: string;
  complete(input: { system: string; messages: ChatTurn[]; maxTokens?: number }): Promise<string>;
}

export interface DocumentRef {
  id: string;
  name: string;
  mimeType: string;
  url?: string;
  updatedAt: number;
}

export interface StorageAdapter {
  readonly id: string;
  search(query: string): Promise<DocumentRef[]>;
  read(id: string): Promise<string>;
}

export interface MailAdapter {
  readonly id: string;
  listInbox(limit: number): Promise<{ id: string; from: string; subject: string; preview: string; ts: number }[]>;
  draftReply(threadId: string, body: string): Promise<{ draftId: string }>;
}

export interface CalendarAdapter {
  readonly id: string;
  listEvents(fromIso: string, toIso: string): Promise<{ id: string; title: string; start: string; durationMin: number }[]>;
}

export interface ChatPlatformAdapter {
  readonly id: string;
  postMessage(channel: string, text: string): Promise<void>;
}
