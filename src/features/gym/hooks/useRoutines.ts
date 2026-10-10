import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { routinesApi } from '../api/routinesApi'
import type { RoutineCreate, RoutineUpdate } from '../api/types'
import { gymKeys } from './queryKeys'

export function useRoutines() {
  return useQuery({ queryKey: gymKeys.routines(), queryFn: routinesApi.list })
}

export function useRoutine(id: number | undefined) {
  return useQuery({
    queryKey: gymKeys.routine(id ?? 0),
    queryFn: () => routinesApi.get(id!),
    enabled: id !== undefined,
  })
}

export function useSaveRoutine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id?: number; body: RoutineCreate & RoutineUpdate }) =>
      id === undefined ? routinesApi.create(body) : routinesApi.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gymKeys.routines() }),
  })
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => routinesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gymKeys.routines() }),
  })
}

export function useApplyRoutine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, scheduledDate, notes }: { id: number; scheduledDate: string; notes?: string }) =>
      routinesApi.apply(id, { scheduled_date: scheduledDate, notes: notes ?? null }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gymKeys.sessions() }),
  })
}
