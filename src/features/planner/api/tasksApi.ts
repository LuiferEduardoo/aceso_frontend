import { api, unwrap } from '@/shared/api/client'
import type { Task, TaskCreate, TaskFilters, TaskUpdate } from './types'

const byId = (id: number) => ({ params: { path: { task_id: id } } })

export const tasksApi = {
  list: (filters: TaskFilters = {}): Promise<Task[]> => unwrap(api.GET('/planner/tasks', { params: { query: filters } })),
  get: (id: number): Promise<Task> => unwrap(api.GET('/planner/tasks/{task_id}', byId(id))),
  create: (body: TaskCreate): Promise<Task> => unwrap(api.POST('/planner/tasks', { body })),
  update: (id: number, body: TaskUpdate): Promise<Task> =>
    unwrap(api.PATCH('/planner/tasks/{task_id}', { ...byId(id), body })),
  remove: async (id: number): Promise<void> => {
    await unwrap(api.DELETE('/planner/tasks/{task_id}', byId(id)))
  },
  complete: (id: number): Promise<Task> => unwrap(api.POST('/planner/tasks/{task_id}/complete', byId(id))),
  reopen: (id: number): Promise<Task> => unwrap(api.POST('/planner/tasks/{task_id}/reopen', byId(id))),
}
