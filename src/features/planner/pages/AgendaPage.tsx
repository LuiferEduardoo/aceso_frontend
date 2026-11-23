import { AgendaContainer } from '../components/agenda/AgendaContainer'
import { GoogleCalendarPanel } from '../components/google/GoogleCalendarPanel'
import { GoogleOAuthReturnNotice } from '../components/google/GoogleOAuthReturnNotice'

export function AgendaPage() {
  return (
    <div className="flex flex-col gap-4">
      <GoogleOAuthReturnNotice />
      <AgendaContainer />
      <GoogleCalendarPanel />
    </div>
  )
}
