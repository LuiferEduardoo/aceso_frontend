import type { RouteObject } from 'react-router'
import { lazyPage } from '@/shared/lib/lazyRoute'
import { redirectTo } from '@/shared/lib/redirect'
import { GymLayout } from './components/GymLayout'

export const gymRoutes: RouteObject = {
  path: 'gym',
  Component: GymLayout,
  children: [
    { index: true, Component: redirectTo('/gym/sessions') },
    { path: 'sessions', lazy: lazyPage(() => import('./pages/SessionsCalendarPage'), (m) => m.SessionsCalendarPage) },
    { path: 'sessions/:sessionId', lazy: lazyPage(() => import('./pages/SessionDetailPage'), (m) => m.SessionDetailPage) },
    { path: 'routines', lazy: lazyPage(() => import('./pages/RoutinesPage'), (m) => m.RoutinesPage) },
    { path: 'routines/new', lazy: lazyPage(() => import('./pages/RoutineEditorPage'), (m) => m.RoutineEditorPage) },
    { path: 'routines/:routineId', lazy: lazyPage(() => import('./pages/RoutineEditorPage'), (m) => m.RoutineEditorPage) },
    { path: 'exercises', lazy: lazyPage(() => import('./pages/ExercisesPage'), (m) => m.ExercisesPage) },
  ],
}
