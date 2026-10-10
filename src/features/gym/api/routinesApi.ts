import { api, unwrap } from '@/shared/api/client'
import type { Routine, RoutineCreate, RoutineUpdate, WorkoutSession } from './types'

const byId = (id: number) => ({ params: { path: { routine_id: id } } })

export const routinesApi = {
  list: (): Promise<Routine[]> => unwrap(api.GET('/gym/routines')),
  get: (id: number): Promise<Routine> => unwrap(api.GET('/gym/routines/{routine_id}', byId(id))),
  create: (body: RoutineCreate): Promise<Routine> => unwrap(api.POST('/gym/routines', { body })),
  /** Sending `exercises` replaces the whole ordered list. */
  update: (id: number, body: RoutineUpdate): Promise<Routine> =>
    unwrap(api.PATCH('/gym/routines/{routine_id}', { ...byId(id), body })),
  remove: async (id: number): Promise<void> => {
    await unwrap(api.DELETE('/gym/routines/{routine_id}', byId(id)))
  },
  apply: (id: number, body: { scheduled_date: string; notes?: string | null }): Promise<WorkoutSession> =>
    unwrap(api.POST('/gym/routines/{routine_id}/apply', { ...byId(id), body })),
}
