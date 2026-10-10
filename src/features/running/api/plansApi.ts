import { api, unwrap } from '@/shared/api/client'
import type { DateRange } from '@/shared/lib/dates'
import type {
  PlannedRun,
  PlannedRunInput,
  PlannedRunUpdate,
  TrainingPlan,
  TrainingPlanCreate,
  TrainingPlanUpdate,
} from './types'

const byId = (id: number) => ({ params: { path: { plan_id: id } } })
const byRunId = (id: number) => ({ params: { path: { run_id: id } } })

export const plansApi = {
  list: (): Promise<TrainingPlan[]> => unwrap(api.GET('/running/plans')),
  get: (id: number): Promise<TrainingPlan> => unwrap(api.GET('/running/plans/{plan_id}', byId(id))),
  create: (body: TrainingPlanCreate): Promise<TrainingPlan> => unwrap(api.POST('/running/plans', { body })),
  update: (id: number, body: TrainingPlanUpdate): Promise<TrainingPlan> =>
    unwrap(api.PATCH('/running/plans/{plan_id}', { ...byId(id), body })),
  remove: async (id: number): Promise<void> => {
    await unwrap(api.DELETE('/running/plans/{plan_id}', byId(id)))
  },
  addRun: (planId: number, body: PlannedRunInput): Promise<PlannedRun> =>
    unwrap(api.POST('/running/plans/{plan_id}/runs', { ...byId(planId), body })),
}

export const plannedRunsApi = {
  list: ({ from, to }: DateRange): Promise<PlannedRun[]> =>
    unwrap(api.GET('/running/planned-runs', { params: { query: { from, to } } })),
  /** `completed_activity_id: null` unlinks the activity. */
  update: (id: number, body: PlannedRunUpdate): Promise<PlannedRun> =>
    unwrap(api.PATCH('/running/planned-runs/{run_id}', { ...byRunId(id), body })),
  remove: async (id: number): Promise<void> => {
    await unwrap(api.DELETE('/running/planned-runs/{run_id}', byRunId(id)))
  },
}
