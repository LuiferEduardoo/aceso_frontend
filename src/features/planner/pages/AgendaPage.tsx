import { AgendaContainer } from '../components/agenda/AgendaContainer'
import { GoogleCalendarPanel } from '../components/google/GoogleCalendarPanel'

export function AgendaPage() {
  return (
    <div className="flex flex-col gap-4">
      <AgendaContainer />
      <GoogleCalendarPanel />
    </div>
  )
}
