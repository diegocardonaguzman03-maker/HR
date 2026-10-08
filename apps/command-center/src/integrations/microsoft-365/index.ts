// Microsoft 365 adapter — stub (Graph API: mail, calendar, OneDrive/SharePoint).
import type { CalendarAdapter, MailAdapter } from '../types';

export function createMicrosoft365Adapters(_accessToken: string): { mail: MailAdapter; calendar: CalendarAdapter } {
  const todo = async (): Promise<never> => {
    throw new Error('microsoft-365 adapter not implemented yet');
  };
  return { mail: { id: 'microsoft-365-mail', listInbox: todo, draftReply: todo }, calendar: { id: 'microsoft-365-calendar', listEvents: todo } };
}
