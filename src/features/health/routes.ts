import type { RouteObject } from 'react-router'
import { lazyPage } from '@/shared/lib/lazyRoute'

/** Lazy-loaded: the charts library is only downloaded when Health is opened. */
export const healthRoutes: RouteObject = {
  path: 'health',
  lazy: lazyPage(() => import('./pages/HealthDashboardPage'), (m) => m.HealthDashboardPage),
}
