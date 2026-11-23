import { Outlet } from 'react-router'
import { PageHeader } from '@/shared/ui'

export function PlannerLayout() {
  return (
    <>
      <PageHeader title="Planificador" description="Agenda, hábitos, tareas y eventos sincronizados con Google Calendar." />
      <Outlet />
    </>
  )
}
