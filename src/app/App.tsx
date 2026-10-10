import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { createQueryClient } from '@/shared/lib/queryClient'
import { AppProviders } from './AppProviders'
import { routes } from './routes'

const router = createBrowserRouter(routes)

export function App() {
  const [client] = useState(createQueryClient)
  return (
    <AppProviders client={client}>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
