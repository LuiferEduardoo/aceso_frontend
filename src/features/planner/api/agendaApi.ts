import { api, unwrap } from '@/shared/api/client'
import type { DateRange } from '@/shared/lib/dates'
import type { AgendaDay } from './types'

export const agendaApi = {
  /** One entry per calendar day (America/Bogota) with its events, tasks and expected habits. */
  between: ({ from, to }: DateRange): Promise<AgendaDay[]> =>
    unwrap(api.GET('/planner/agenda', { params: { query: { from, to } } })),
}
