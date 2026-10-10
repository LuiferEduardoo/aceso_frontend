import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { DateRange } from '@/shared/lib/dates'
import { plannedRunsApi, plansApi } from '../api/plansApi'
import type { PlannedRunInput, PlannedRunUpdate, TrainingPlanCreate, TrainingPlanUpdate } from '../api/types'
import { runningKeys } from './queryKeys'

export function usePlans() {
  return useQuery({ queryKey: runningKeys.plans(), queryFn: plansApi.list })
}

export function usePlan(id: number) {
  return useQuery({ queryKey: runningKeys.plan(id), queryFn: () => plansApi.get(id) })
}

export function usePlannedRuns(range: DateRange) {
  return useQuery({ queryKey: runningKeys.plannedRunRange(range), queryFn: () => plannedRunsApi.list(range) })
}

/** Plans embed their runs, so every plan/run change refreshes both caches. */
function useInvalidatePlans() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: runningKeys.plans() }),
      queryClient.invalidateQueries({ queryKey: runningKeys.plannedRuns() }),
    ])
}

export function useCreatePlan() {
  const invalidate = useInvalidatePlans()
  return useMutation({ mutationFn: (body: TrainingPlanCreate) => plansApi.create(body), onSuccess: invalidate })
}

export function useUpdatePlan() {
  const invalidate = useInvalidatePlans()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: TrainingPlanUpdate }) => plansApi.update(id, body),
    onSuccess: invalidate,
  })
}

export function useDeletePlan() {
  const invalidate = useInvalidatePlans()
  return useMutation({ mutationFn: (id: number) => plansApi.remove(id), onSuccess: invalidate })
}

export function useAddPlannedRun() {
  const invalidate = useInvalidatePlans()
  return useMutation({
    mutationFn: ({ planId, body }: { planId: number; body: PlannedRunInput }) => plansApi.addRun(planId, body),
    onSuccess: invalidate,
  })
}

export function useUpdatePlannedRun() {
  const invalidate = useInvalidatePlans()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: PlannedRunUpdate }) => plannedRunsApi.update(id, body),
    onSuccess: invalidate,
  })
}

export function useDeletePlannedRun() {
  const invalidate = useInvalidatePlans()
  return useMutation({ mutationFn: (id: number) => plannedRunsApi.remove(id), onSuccess: invalidate })
}
