import { useMutation, useQuery } from '@tanstack/react-query'
import { tasksApi } from '../api/tasksApi'
import type { TaskCreate, TaskFilters, TaskUpdate } from '../api/types'
import { plannerKeys } from './queryKeys'
import { useInvalidate } from './useInvalidate'

export function useTasks(filters: TaskFilters) {
  return useQuery({ queryKey: plannerKeys.taskList(filters), queryFn: () => tasksApi.list(filters) })
}

/** Tasks show up in the agenda and scheduled ones own a linked calendar event. */
function useInvalidateTasks() {
  return useInvalidate(plannerKeys.all)
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks()
  return useMutation({ mutationFn: (body: TaskCreate) => tasksApi.create(body), onSuccess: invalidate })
}

export function useUpdateTask() {
  const invalidate = useInvalidateTasks()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: TaskUpdate }) => tasksApi.update(id, body),
    onSuccess: invalidate,
  })
}

export function useDeleteTask() {
  const invalidate = useInvalidateTasks()
  return useMutation({ mutationFn: (id: number) => tasksApi.remove(id), onSuccess: invalidate })
}

export function useCompleteTask() {
  const invalidate = useInvalidateTasks()
  return useMutation({
    mutationFn: ({ id, done }: { id: number; done: boolean }) => (done ? tasksApi.complete(id) : tasksApi.reopen(id)),
    onSuccess: invalidate,
  })
}
