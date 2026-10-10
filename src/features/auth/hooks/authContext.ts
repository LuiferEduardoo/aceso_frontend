import { createContext, useContext } from 'react'
import type { User } from '../api/authApi'

export interface AuthState {
  token: string | null
  isAuthenticated: boolean
  user: User | undefined
  signIn: (token: string) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
