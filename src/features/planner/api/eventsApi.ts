import { api, unwrap } from '@/shared/api/client'
import type { DateRange } from '@/shared/lib/dates'
import type { CalendarEvent, CalendarEventCreate, CalendarEventUpdate } from './types'

const byId = (id: number) => ({ params: { path: { event_id: id } } })

export const eventsApi = {
  list: ({ from, to }: DateRange): Promise<CalendarEvent[]> =>
    unwrap(api.GET('/planner/events', { params: { query: { from, to } } })),
  create: (body: CalendarEventCreate): Promise<CalendarEvent> => unwrap(api.POST('/planner/events', { body })),
  /** Fails with 422 for events linked to a task or habit. */
  update: (id: number, body: CalendarEventUpdate): Promise<CalendarEvent> =>
    unwrap(api.PATCH('/planner/events/{event_id}', { ...byId(id), body })),
  remove: async (id: number): Promise<void> => {
    await unwrap(api.DELETE('/planner/events/{event_id}', byId(id)))
  },
}
