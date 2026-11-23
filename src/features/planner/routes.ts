import type { RouteObject } from 'react-router'
import { lazyPage } from '@/shared/lib/lazyRoute'
import { redirectTo } from '@/shared/lib/redirect'
import { PlannerLayout } from './components/PlannerLayout'

export const plannerRoutes: RouteObject = {
  path: 'planner',
  Component: PlannerLayout,
  children: [
    { index: true, Component: redirectTo('/planner/agenda') },
    { path: 'agenda', lazy: lazyPage(() => import('./pages/AgendaPage'), (m) => m.AgendaPage) },
    { path: 'habits', lazy: lazyPage(() => import('./pages/HabitsPage'), (m) => m.HabitsPage) },
    { path: 'habits/:habitId', lazy: lazyPage(() => import('./pages/HabitDetailPage'), (m) => m.HabitDetailPage) },
    { path: 'tasks', lazy: lazyPage(() => import('./pages/TasksPage'), (m) => m.TasksPage) },
    { path: 'events', lazy: lazyPage(() => import('./pages/EventsPage'), (m) => m.EventsPage) },
  ],
}
