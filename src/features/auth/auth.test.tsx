import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderApp, TEST_USER } from '@/test/renderApp'
import { apiUrl, server } from '@/test/server'

describe('authentication flow', () => {
  it('logs in with a form-urlencoded body, stores the token and redirects to the app', async () => {
    let contentType: string | null = null
    let body: URLSearchParams | null = null
    server.use(
      http.post(apiUrl('/auth/login'), async ({ request }) => {
        contentType = request.headers.get('Content-Type')
        body = new URLSearchParams(await request.text())
        return HttpResponse.json({ access_token: 'jwt-123', token_type: 'bearer' })
      }),
      http.get(apiUrl('/gym/sessions'), () => HttpResponse.json([])),
    )
    const { user, router } = renderApp({ route: '/login', signedIn: false })

    await user.type(await screen.findByLabelText('Correo electrónico'), TEST_USER.email)
    await user.type(screen.getByLabelText('Contraseña'), 'secret-pass')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await user.click(await screen.findByRole('button', { name: 'Abrir menú de perfil' }))
    expect(await screen.findByText(TEST_USER.email)).toBeInTheDocument()
    expect(contentType).toBe('application/x-www-form-urlencoded')
    expect(body!.get('username')).toBe(TEST_USER.email)
    expect(body!.get('password')).toBe('secret-pass')
    expect(window.localStorage.getItem('aceso.accessToken')).toBe('jwt-123')
    await waitFor(() => expect(router.state.location.pathname).toBe('/gym/sessions'))
  })

  it('shows the backend message when credentials are wrong', async () => {
    server.use(
      http.post(apiUrl('/auth/login'), () => HttpResponse.json({ detail: 'Incorrect email or password' }, { status: 401 })),
    )
    const { user } = renderApp({ route: '/login', signedIn: false })

    await user.type(await screen.findByLabelText('Correo electrónico'), TEST_USER.email)
    await user.type(screen.getByLabelText('Contraseña'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Incorrect email or password')).toBeInTheDocument()
    expect(window.localStorage.getItem('aceso.accessToken')).toBeNull()
  })

  it('redirects protected routes to login without a session', async () => {
    const { router } = renderApp({ route: '/running/plans', signedIn: false })
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('clears the token and returns to login when the API answers 401', async () => {
    server.use(
      http.get(apiUrl('/gym/exercises'), () => HttpResponse.json({ detail: 'Invalid or expired token' }, { status: 401 })),
    )
    const { router } = renderApp({ route: '/gym/exercises' })

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(window.localStorage.getItem('aceso.accessToken')).toBeNull()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('logs out from the app shell', async () => {
    server.use(http.get(apiUrl('/gym/sessions'), () => HttpResponse.json([])))
    const { user } = renderApp({ route: '/gym' })
    await user.click(await screen.findByRole('button', { name: 'Abrir menú de perfil' }))
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(window.localStorage.getItem('aceso.accessToken')).toBeNull()
  })
})
