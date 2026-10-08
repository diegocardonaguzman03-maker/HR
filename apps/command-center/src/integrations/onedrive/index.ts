// OneDrive adapter — stub (Graph API drive items).
import type { StorageAdapter } from '../types';

export function createOneDriveAdapter(_token: string): StorageAdapter {
  const todo = async (): Promise<never> => {
    throw new Error('onedrive adapter not implemented yet');
  };
  return { id: 'onedrive', search: todo, read: todo };
}
