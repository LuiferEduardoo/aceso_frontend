import { api, unwrap } from '@/shared/api/client'
import type { DateRange } from '@/shared/lib/dates'
import type { Habit, HabitCreate, HabitLog, HabitLogInput, HabitStats, HabitUpdate } from './types'

const byId = (id: number) => ({ params: { path: { habit_id: id } } })
const byDay = (id: number, day: string) => ({ params: { path: { habit_id: id, day } } })

export const habitsApi = {
  list: (includeArchived = false): Promise<Habit[]> =>
    unwrap(api.GET('/planner/habits', { params: { query: { include_archived: includeArchived } } })),
  get: (id: number): Promise<Habit> => unwrap(api.GET('/planner/habits/{habit_id}', byId(id))),
  create: (body: HabitCreate): Promise<Habit> => unwrap(api.POST('/planner/habits', { body })),
  update: (id: number, body: HabitUpdate): Promise<Habit> =>
    unwrap(api.PATCH('/planner/habits/{habit_id}', { ...byId(id), body })),
  remove: async (id: number): Promise<void> => {
    await unwrap(api.DELETE('/planner/habits/{habit_id}', byId(id)))
  },
  archive: (id: number): Promise<Habit> => unwrap(api.POST('/planner/habits/{habit_id}/archive', byId(id))),
  unarchive: (id: number): Promise<Habit> => unwrap(api.POST('/planner/habits/{habit_id}/unarchive', byId(id))),
  logs: (id: number, { from, to }: DateRange): Promise<HabitLog[]> =>
    unwrap(api.GET('/planner/habits/{habit_id}/logs', { params: { path: { habit_id: id }, query: { from, to } } })),
  /** Checks in a day; replaces any existing log of that day. */
  log: (id: number, day: string, body: HabitLogInput): Promise<HabitLog> =>
    unwrap(api.POST('/planner/habits/{habit_id}/logs/{day}', { ...byDay(id, day), body })),
  unlog: async (id: number, day: string): Promise<void> => {
    await unwrap(api.DELETE('/planner/habits/{habit_id}/logs/{day}', byDay(id, day)))
  },
  stats: (id: number, { from, to }: DateRange): Promise<HabitStats> =>
    unwrap(api.GET('/planner/habits/{habit_id}/stats', { params: { path: { habit_id: id }, query: { from, to } } })),
}
