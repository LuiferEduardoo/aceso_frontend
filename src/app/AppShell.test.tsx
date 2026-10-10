import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderApp } from '@/test/renderApp'
import { apiUrl, server } from '@/test/server'

describe('AppShell navigation', () => {
  beforeEach(() => {
    // Pages fetch their own data; the shell only needs them to settle.
    server.use(http.get(apiUrl('/*'), () => HttpResponse.json([])))
  })

  it('lists every section in the sidebar, with only the current one expanded', async () => {
    renderApp({ route: '/gym/sessions' })
    const sidebar = within(await screen.findByRole('complementary'))

    const groups = ['Salud', 'Gimnasio', 'Running'].map((name) => sidebar.getByRole('button', { name }))
    expect(groups.map((group) => group.getAttribute('aria-expanded'))).toEqual(['false', 'true', 'false'])
    expect(sidebar.getByRole('link', { name: 'Sesiones' })).toHaveAttribute('aria-current', 'page')
    expect(sidebar.queryByRole('link', { name: 'Planes' })).not.toBeInTheDocument()
    // The mobile tab bar shows the current section's pages only.
    const navs = screen.getAllByRole('navigation', { name: 'Principal' })
    const tabBar = within(navs.find((nav) => nav.closest('aside') === null)!)
    expect(tabBar.getAllByRole('link').map((link) => link.textContent)).toEqual(['Sesiones', 'Rutinas', 'Ejercicios'])
  })

  it('expands and collapses other section groups', async () => {
    const { user } = renderApp({ route: '/gym/sessions' })
    const sidebar = within(await screen.findByRole('complementary'))
    const running = sidebar.getByRole('button', { name: 'Running' })

    await user.click(running)
    expect(running).toHaveAttribute('aria-expanded', 'true')
    expect(sidebar.getByRole('link', { name: 'Planes' })).toBeInTheDocument()
    expect(sidebar.getByRole('link', { name: 'Sesiones' })).toBeInTheDocument()

    await user.click(running)
    expect(running).toHaveAttribute('aria-expanded', 'false')
    expect(sidebar.queryByRole('link', { name: 'Planes' })).not.toBeInTheDocument()
  })

  it('switches sections from the header select', async () => {
    const { user, router } = renderApp({ route: '/gym/sessions' })
    const select = await screen.findByRole('combobox', { name: 'Cambiar sección' })
    expect(select).toHaveValue('gym')
    expect(within(select).getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Salud',
      'Gimnasio',
      'Running',
    ])

    await user.selectOptions(select, 'running')

    await waitFor(() => expect(router.state.location.pathname).toBe('/running/plans'))
    const sidebar = within(screen.getByRole('complementary'))
    expect(sidebar.getByRole('button', { name: 'Running' })).toHaveAttribute('aria-expanded', 'true')
    expect(sidebar.getByRole('link', { name: 'Planes' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('combobox', { name: 'Cambiar sección' })).toHaveValue('running')
  })

  it('collapsing the sidebar hides groups; clicking a section re-expands it with that group open', async () => {
    const { user } = renderApp({ route: '/health' })
    const sidebar = within(await screen.findByRole('complementary'))
    expect(sidebar.getByRole('link', { name: 'Resumen' })).toBeInTheDocument()

    await user.click(sidebar.getByRole('button', { name: 'Contraer menú lateral' }))
    expect(sidebar.queryByRole('link', { name: 'Resumen' })).not.toBeInTheDocument()

    await user.click(sidebar.getByRole('button', { name: 'Desplegar Running' }))
    expect(sidebar.getByRole('button', { name: 'Contraer menú lateral' })).toBeInTheDocument()
    expect(sidebar.getByRole('button', { name: 'Running' })).toHaveAttribute('aria-expanded', 'true')
    expect(sidebar.getByRole('link', { name: 'Planes' })).toBeInTheDocument()
  })

  it('opens the profile menu, closes it with Escape and signs out', async () => {
    const { user, router } = renderApp({ route: '/gym/sessions' })
    const trigger = await screen.findByRole('button', { name: 'Abrir menú de perfil' })

    await user.click(trigger)
    expect(await screen.findByText('runner@example.com')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()

    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(window.localStorage.getItem('aceso.accessToken')).toBeNull()
  })
})
