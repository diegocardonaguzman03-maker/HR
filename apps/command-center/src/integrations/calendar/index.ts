// Google Calendar adapter — stub. Implement with events.list.
import type { CalendarAdapter } from '../types.ts';

export function createGoogleCalendarAdapter(_accessToken: string): CalendarAdapter {
  return {
    id: 'calendar',
    async listEvents() {
      throw new Error('calendar adapter not implemented yet');
    },
  };
}
