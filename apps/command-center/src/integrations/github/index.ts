// GitHub adapter — stub (repo search + file content).
import type { StorageAdapter } from '../types';

export function createGitHubAdapter(_token: string): StorageAdapter {
  const todo = async (): Promise<never> => {
    throw new Error('github adapter not implemented yet');
  };
  return { id: 'github', search: todo, read: todo };
}
