import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { DateRange } from '@/shared/lib/dates'
import { sessionsApi } from '../api/sessionsApi'
import type { ExerciseSetInput, ExerciseSetUpdate, WorkoutSessionCreate, WorkoutSessionUpdate } from '../api/types'
import { gymKeys } from './queryKeys'

export function useSessionsInRange(range: DateRange) {
  return useQuery({ queryKey: gymKeys.sessionRange(range), queryFn: () => sessionsApi.list(range) })
}

export function useSession(id: number) {
  return useQuery({ queryKey: gymKeys.session(id), queryFn: () => sessionsApi.get(id) })
}

function useInvalidateSessions() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: gymKeys.sessions() })
}

export function useCreateSession() {
  const invalidate = useInvalidateSessions()
  return useMutation({ mutationFn: (body: WorkoutSessionCreate) => sessionsApi.create(body), onSuccess: invalidate })
}

export function useDeleteSession() {
  const invalidate = useInvalidateSessions()
  return useMutation({ mutationFn: (id: number) => sessionsApi.remove(id), onSuccess: invalidate })
}

/** Every mutation that changes a session's content refreshes all session queries. */
export function useSessionMutations(sessionId: number) {
  const invalidate = useInvalidateSessions()
  const opts = { onSuccess: invalidate }
  return {
    update: useMutation({ mutationFn: (body: WorkoutSessionUpdate) => sessionsApi.update(sessionId, body), ...opts }),
    addExercise: useMutation({
      mutationFn: (body: { exercise_id: number; notes?: string | null }) => sessionsApi.addExercise(sessionId, body),
      ...opts,
    }),
    removeExercise: useMutation({ mutationFn: (id: number) => sessionsApi.removeExercise(id), ...opts }),
    addSet: useMutation({
      mutationFn: ({ sessionExerciseId, body }: { sessionExerciseId: number; body: ExerciseSetInput }) =>
        sessionsApi.addSet(sessionExerciseId, body),
      ...opts,
    }),
    updateSet: useMutation({
      mutationFn: ({ setId, body }: { setId: number; body: ExerciseSetUpdate }) => sessionsApi.updateSet(setId, body),
      ...opts,
    }),
    removeSet: useMutation({ mutationFn: (setId: number) => sessionsApi.removeSet(setId), ...opts }),
  }
}
