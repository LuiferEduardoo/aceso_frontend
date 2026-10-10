import { api, unwrap } from '@/shared/api/client'
import type { DateRange } from '@/shared/lib/dates'
import type { Activity } from './types'

export const activitiesApi = {
  list: ({ from, to }: DateRange): Promise<Activity[]> =>
    unwrap(api.GET('/running/activities', { params: { query: { from, to } } })),
  get: (id: number): Promise<Activity> =>
    unwrap(api.GET('/running/activities/{activity_id}', { params: { path: { activity_id: id } } })),
}

export const stravaApi = {
  authorizationUrl: async (): Promise<string> =>
    (await unwrap(api.GET('/running/strava/authorize'))).authorization_url,
  /** `after` must be an aware ISO datetime. */
  sync: async (after?: string): Promise<number> =>
    (await unwrap(api.POST('/running/strava/sync', { params: { query: after ? { after } : {} } }))).synced,
  disconnect: async (): Promise<void> => {
    await unwrap(api.DELETE('/running/strava'))
  },
}
