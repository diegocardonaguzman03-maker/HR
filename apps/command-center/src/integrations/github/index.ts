// GitHub adapter — stub (repo search + file content).
import type { StorageAdapter } from '../types.ts';

export function createGitHubAdapter(_token: string): StorageAdapter {
  const todo = async (): Promise<never> => {
    throw new Error('github adapter not implemented yet');
  };
  return { id: 'github', search: todo, read: todo };
}
