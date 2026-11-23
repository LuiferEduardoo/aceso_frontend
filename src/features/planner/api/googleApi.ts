import { api, unwrap } from '@/shared/api/client'
import type { GoogleCalendar, GoogleCalendarLink, GoogleSyncResult } from './types'

export const googleApi = {
  authorizationUrl: async (): Promise<string> =>
    (await unwrap(api.GET('/planner/google/authorize'))).authorization_url,
  /** 404 when no Google account is connected. */
  calendars: (): Promise<GoogleCalendar[]> => unwrap(api.GET('/planner/google/calendars')),
  selectCalendar: (calendarId: string): Promise<GoogleCalendarLink> =>
    unwrap(api.PUT('/planner/google/calendar', { body: { calendar_id: calendarId } })),
  sync: (): Promise<GoogleSyncResult> => unwrap(api.POST('/planner/google/sync')),
  disconnect: async (): Promise<void> => {
    await unwrap(api.DELETE('/planner/google'))
  },
}
