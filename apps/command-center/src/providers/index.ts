import type { AgentProvider, ProviderKind } from './AgentProvider';
import { MockAgentProvider } from './mock/MockAgentProvider';
import { RealAgentProvider } from './real/RealAgentProvider';

export type { AgentProvider, ProviderKind, ConnectionStatus, ProviderContext } from './AgentProvider';

export const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_AGENT_WS_URL || 'ws://localhost:8787';
export const DEFAULT_PROVIDER: ProviderKind = process.env.NEXT_PUBLIC_AGENT_PROVIDER === 'real' ? 'real' : 'mock';

export function createProvider(kind: ProviderKind, wsUrl = DEFAULT_WS_URL): AgentProvider {
  return kind === 'real' ? new RealAgentProvider(wsUrl) : new MockAgentProvider();
}
