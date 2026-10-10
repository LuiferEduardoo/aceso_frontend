import { api, unwrap, type Schemas } from '@/shared/api/client'

export type User = Schemas['UserRead']
export type Credentials = { email: string; password: string }

/** OAuth2 password flow: the backend expects a form-urlencoded body with `username`. */
export function login({ email, password }: Credentials): Promise<Schemas['Token']> {
  return unwrap(
    api.POST('/auth/login', {
      body: { username: email, password, scope: '' },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  )
}

export function register(credentials: Credentials): Promise<User> {
  return unwrap(api.POST('/auth/register', { body: credentials }))
}

export function fetchCurrentUser(): Promise<User> {
  return unwrap(api.GET('/auth/me'))
}
