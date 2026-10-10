import { PageHeader } from '@/shared/ui'
import { HealthDashboardContainer } from '../components/HealthDashboardContainer'

export function HealthDashboardPage() {
  return (
    <>
      <PageHeader title="Salud" description="Resúmenes diarios, sueño y muestras de tus dispositivos." />
      <HealthDashboardContainer />
    </>
  )
}
