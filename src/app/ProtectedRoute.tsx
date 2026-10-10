import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/features/auth'

/** Renders child routes only with a session; otherwise sends the user to /login. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}

/** Keeps signed-in users away from the login/register screens. */
export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/gym" replace /> : <Outlet />
}
