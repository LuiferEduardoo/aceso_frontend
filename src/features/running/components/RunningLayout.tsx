import { Outlet } from 'react-router'
import { PageHeader } from '@/shared/ui'

export function RunningLayout() {
  return (
    <>
      <PageHeader title="Running" description="Planes de entrenamiento, carreras programadas y actividades de Strava." />
      <Outlet />
    </>
  )
}
