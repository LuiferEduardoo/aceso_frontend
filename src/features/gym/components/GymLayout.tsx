import { Outlet } from 'react-router'
import { PageHeader } from '@/shared/ui'

export function GymLayout() {
  return (
    <>
      <PageHeader title="Gimnasio" description="Ejercicios, rutinas y tu calendario de entrenamientos." />
      <Outlet />
    </>
  )
}
