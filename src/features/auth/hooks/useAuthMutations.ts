import { useMutation } from '@tanstack/react-query'
import { login, register, type Credentials } from '../api/authApi'
import { useAuth } from './authContext'

export function useLogin() {
  const { signIn } = useAuth()
  return useMutation({
    mutationFn: login,
    onSuccess: (token) => signIn(token.access_token),
  })
}

/** Registers the account and signs in right away with the same credentials. */
export function useRegister() {
  const { signIn } = useAuth()
  return useMutation({
    mutationFn: async (credentials: Credentials) => {
      await register(credentials)
      return login(credentials)
    },
    onSuccess: (token) => signIn(token.access_token),
  })
}
