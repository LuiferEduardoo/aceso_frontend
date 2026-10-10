import type { RouteObject } from 'react-router'
import { lazyPage } from '@/shared/lib/lazyRoute'
import { redirectTo } from '@/shared/lib/redirect'
import { RunningLayout } from './components/RunningLayout'

export const runningRoutes: RouteObject = {
  path: 'running',
  Component: RunningLayout,
  children: [
    { index: true, Component: redirectTo('/running/plans') },
    { path: 'plans', lazy: lazyPage(() => import('./pages/PlansPage'), (m) => m.PlansPage) },
    { path: 'plans/:planId', lazy: lazyPage(() => import('./pages/PlanDetailPage'), (m) => m.PlanDetailPage) },
    { path: 'schedule', lazy: lazyPage(() => import('./pages/SchedulePage'), (m) => m.SchedulePage) },
    { path: 'activities', lazy: lazyPage(() => import('./pages/ActivitiesPage'), (m) => m.ActivitiesPage) },
    {
      path: 'activities/:activityId',
      lazy: lazyPage(() => import('./pages/ActivityDetailPage'), (m) => m.ActivityDetailPage),
    },
  ],
}
