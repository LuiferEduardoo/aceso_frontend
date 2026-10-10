import { api, unwrap } from '@/shared/api/client'
import type { DateRange } from '@/shared/lib/dates'
import type {
  ExerciseSet,
  ExerciseSetInput,
  ExerciseSetUpdate,
  SessionExercise,
  WorkoutSession,
  WorkoutSessionCreate,
  WorkoutSessionUpdate,
} from './types'

const byId = (id: number) => ({ params: { path: { session_id: id } } })

export const sessionsApi = {
  list: ({ from, to }: DateRange): Promise<WorkoutSession[]> =>
    unwrap(api.GET('/gym/sessions', { params: { query: { from, to } } })),
  get: (id: number): Promise<WorkoutSession> => unwrap(api.GET('/gym/sessions/{session_id}', byId(id))),
  create: (body: WorkoutSessionCreate): Promise<WorkoutSession> => unwrap(api.POST('/gym/sessions', { body })),
  update: (id: number, body: WorkoutSessionUpdate): Promise<WorkoutSession> =>
    unwrap(api.PATCH('/gym/sessions/{session_id}', { ...byId(id), body })),
  remove: async (id: number): Promise<void> => {
    await unwrap(api.DELETE('/gym/sessions/{session_id}', byId(id)))
  },
  addExercise: (id: number, body: { exercise_id: number; notes?: string | null }): Promise<SessionExercise> =>
    unwrap(api.POST('/gym/sessions/{session_id}/exercises', { ...byId(id), body })),
  removeExercise: async (sessionExerciseId: number): Promise<void> => {
    await unwrap(
      api.DELETE('/gym/session-exercises/{session_exercise_id}', {
        params: { path: { session_exercise_id: sessionExerciseId } },
      }),
    )
  },
  addSet: (sessionExerciseId: number, body: ExerciseSetInput): Promise<ExerciseSet> =>
    unwrap(
      api.POST('/gym/session-exercises/{session_exercise_id}/sets', {
        params: { path: { session_exercise_id: sessionExerciseId } },
        body,
      }),
    ),
  updateSet: (setId: number, body: ExerciseSetUpdate): Promise<ExerciseSet> =>
    unwrap(api.PATCH('/gym/sets/{set_id}', { params: { path: { set_id: setId } }, body })),
  removeSet: async (setId: number): Promise<void> => {
    await unwrap(api.DELETE('/gym/sets/{set_id}', { params: { path: { set_id: setId } } }))
  },
}
