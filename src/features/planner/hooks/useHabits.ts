import { useMutation, useQuery } from '@tanstack/react-query'
import type { DateRange } from '@/shared/lib/dates'
import { habitsApi } from '../api/habitsApi'
import type { HabitCreate, HabitUpdate } from '../api/types'
import { plannerKeys } from './queryKeys'
import { useInvalidate } from './useInvalidate'

export function useHabits(includeArchived: boolean) {
  return useQuery({ queryKey: plannerKeys.habitList(includeArchived), queryFn: () => habitsApi.list(includeArchived) })
}

export function useHabit(id: number) {
  return useQuery({ queryKey: plannerKeys.habit(id), queryFn: () => habitsApi.get(id) })
}

export function useHabitStats(id: number, range: DateRange) {
  return useQuery({ queryKey: plannerKeys.habitStats(id, range), queryFn: () => habitsApi.stats(id, range) })
}

/** Habits feed the agenda and may own a linked calendar event, so changes refresh everything planner-wide. */
function useInvalidateHabits() {
  return useInvalidate(plannerKeys.all)
}

export function useCreateHabit() {
  const invalidate = useInvalidateHabits()
  return useMutation({ mutationFn: (body: HabitCreate) => habitsApi.create(body), onSuccess: invalidate })
}

export function useUpdateHabit() {
  const invalidate = useInvalidateHabits()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: HabitUpdate }) => habitsApi.update(id, body),
    onSuccess: invalidate,
  })
}

export function useDeleteHabit() {
  const invalidate = useInvalidateHabits()
  return useMutation({ mutationFn: (id: number) => habitsApi.remove(id), onSuccess: invalidate })
}

export function useArchiveHabit() {
  const invalidate = useInvalidateHabits()
  return useMutation({
    mutationFn: ({ id, archived }: { id: number; archived: boolean }) =>
      archived ? habitsApi.archive(id) : habitsApi.unarchive(id),
    onSuccess: invalidate,
  })
}

/** Check-ins change the agenda and the habit's stats. */
export function useToggleHabitDay() {
  const invalidate = useInvalidate(plannerKeys.habits(), plannerKeys.agenda())
  return useMutation({
    mutationFn: async ({ id, day, done, count }: { id: number; day: string; done: boolean; count: number }) => {
      if (done) await habitsApi.log(id, day, { count })
      else await habitsApi.unlog(id, day)
    },
    onSuccess: invalidate,
  })
}
