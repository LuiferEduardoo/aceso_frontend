import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { tokenStore } from '@/shared/auth/tokenStore'
import { fetchCurrentUser } from '../api/authApi'
import { AuthContext, type AuthState } from '../hooks/authContext'

const ME_KEY = ['auth', 'me'] as const

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(tokenStore.subscribe, tokenStore.get)
  const queryClient = useQueryClient()

  const me = useQuery({
    queryKey: [...ME_KEY, token],
    queryFn: fetchCurrentUser,
    enabled: token !== null,
    staleTime: 5 * 60_000,
  })

  // Drop every cached resource once the session ends (logout or 401).
  useEffect(() => {
    if (token === null) queryClient.clear()
  }, [token, queryClient])

  const signIn = useCallback((newToken: string) => tokenStore.set(newToken), [])
  const signOut = useCallback(() => tokenStore.clear(), [])

  const value = useMemo<AuthState>(
    () => ({ token, isAuthenticated: token !== null, user: me.data, signIn, signOut }),
    [token, me.data, signIn, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
