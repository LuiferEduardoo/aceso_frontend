import type { RouteObject } from 'react-router'
import { LoginPage, RegisterPage } from '@/features/auth'
import { gymRoutes } from '@/features/gym/routes'
import { healthRoutes } from '@/features/health/routes'
import { runningRoutes } from '@/features/running/routes'
import { redirectTo } from '@/shared/lib/redirect'
import { AppShell } from './AppShell'
import { NotFoundPage } from './NotFoundPage'
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute'

export const routes: RouteObject[] = [
  {
    Component: PublicOnlyRoute,
    children: [
      { path: '/login', Component: LoginPage },
      { path: '/register', Component: RegisterPage },
    ],
  },
  {
    Component: ProtectedRoute,
    children: [
      {
        path: '/',
        Component: AppShell,
        children: [{ index: true, Component: redirectTo('/gym') }, gymRoutes, runningRoutes, healthRoutes],
      },
    ],
  },
  { path: '*', Component: NotFoundPage },
]
