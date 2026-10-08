// Google Drive adapter — stub. Implement with the Drive v3 API (files.list / files.get)
// using OAuth credentials held by the gateway.
import type { StorageAdapter } from '../types';

export function createGoogleDriveAdapter(_accessToken: string): StorageAdapter {
  return {
    id: 'google-drive',
    async search() {
      throw new Error('google-drive adapter not implemented yet');
    },
    async read() {
      throw new Error('google-drive adapter not implemented yet');
    },
  };
}
