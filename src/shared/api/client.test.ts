import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { tokenStore } from '@/shared/auth/tokenStore'
import { apiUrl, server } from '@/test/server'
import { api, unwrap } from './client'
import { ApiError } from './errors'

describe('api client', () => {
  it('sends the bearer token on authenticated calls', async () => {
    tokenStore.set('abc')
    let authorization: string | null = null
    server.use(
      http.get(apiUrl('/gym/exercises'), ({ request }) => {
        authorization = request.headers.get('Authorization')
        return HttpResponse.json([])
      }),
    )
    await unwrap(api.GET('/gym/exercises'))
    expect(authorization).toBe('Bearer abc')
  })

  it('clears the token when an authenticated call returns 401', async () => {
    tokenStore.set('expired')
    server.use(
      http.get(apiUrl('/gym/exercises'), () => HttpResponse.json({ detail: 'Invalid or expired token' }, { status: 401 })),
    )
    await expect(unwrap(api.GET('/gym/exercises'))).rejects.toMatchObject({ status: 401 })
    expect(tokenStore.get()).toBeNull()
  })

  it('keeps the session on a failed login (401 from /auth/login)', async () => {
    tokenStore.set('still-valid')
    server.use(
      http.post(apiUrl('/auth/login'), () => HttpResponse.json({ detail: 'Incorrect email or password' }, { status: 401 })),
    )
    const call = unwrap(
      api.POST('/auth/login', {
        body: { username: 'a@b.co', password: 'x', scope: '' },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    )
    await expect(call).rejects.toThrow('Incorrect email or password')
    expect(tokenStore.get()).toBe('still-valid')
  })

  it('turns network failures into an ApiError with status 0', async () => {
    server.use(http.get(apiUrl('/gym/exercises'), () => HttpResponse.error()))
    const error = await unwrap(api.GET('/gym/exercises')).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(0)
  })
})
