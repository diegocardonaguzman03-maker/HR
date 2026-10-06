// Gmail adapter — stub. Implement with users.messages.list / users.drafts.create.
import type { MailAdapter } from '../types.ts';

export function createGmailAdapter(_accessToken: string): MailAdapter {
  return {
    id: 'gmail',
    async listInbox() {
      throw new Error('gmail adapter not implemented yet');
    },
    async draftReply() {
      throw new Error('gmail adapter not implemented yet');
    },
  };
}
