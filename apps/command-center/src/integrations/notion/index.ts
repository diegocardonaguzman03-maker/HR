// Notion adapter — stub (search + page content).
import type { StorageAdapter } from '../types';

export function createNotionAdapter(_token: string): StorageAdapter {
  const todo = async (): Promise<never> => {
    throw new Error('notion adapter not implemented yet');
  };
  return { id: 'notion', search: todo, read: todo };
}
