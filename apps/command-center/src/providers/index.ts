import type { AgentProvider, ProviderKind } from './AgentProvider';
import { MockAgentProvider } from './mock/MockAgentProvider';
import { RealAgentProvider } from './real/RealAgentProvider';
import { ClaudeAgentProvider } from './claude/ClaudeAgentProvider';
import { claudeRuntime } from './claude/runtime';
import { getStoredApiKey } from './claude/browserBackend';

export type { AgentProvider, ProviderKind, ConnectionStatus, ProviderContext } from './AgentProvider';

export const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_AGENT_WS_URL || 'ws://localhost:8787';
/** Inside a claude.ai artifact the page can use Claude itself; elsewhere use the env setting. */
export const inClaudeViewer = (): boolean => claudeRuntime() !== null;

export function defaultProvider(): ProviderKind {
  if (inClaudeViewer() || getStoredApiKey()) return 'claude';
  return process.env.NEXT_PUBLIC_AGENT_PROVIDER === 'real' ? 'real' : 'mock';
}

export function createProvider(kind: ProviderKind, wsUrl = DEFAULT_WS_URL): AgentProvider {
  if (kind === 'real') return new RealAgentProvider(wsUrl);
  if (kind === 'claude') return new ClaudeAgentProvider();
  return new MockAgentProvider();
}
