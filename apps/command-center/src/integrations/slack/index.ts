// Slack adapter — stub. Implement with chat.postMessage.
import type { ChatPlatformAdapter } from '../types';

export function createSlackAdapter(_botToken: string): ChatPlatformAdapter {
  return {
    id: 'slack',
    async postMessage() {
      throw new Error('slack adapter not implemented yet');
    },
  };
}
