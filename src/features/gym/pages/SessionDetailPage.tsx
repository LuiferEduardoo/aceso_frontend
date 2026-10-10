import { useParams } from 'react-router'
import { SessionDetailContainer } from '../components/sessions/SessionDetailContainer'

export function SessionDetailPage() {
  const { sessionId } = useParams()
  return <SessionDetailContainer key={sessionId} sessionId={Number(sessionId)} />
}
