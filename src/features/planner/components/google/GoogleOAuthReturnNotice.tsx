import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Notice } from '@/shared/ui'

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Cancelaste la autorización en Google; Google Calendar no se conectó.',
  authorization_failed: 'Google no completó la autorización. Inténtalo de nuevo.',
  invalid_state: 'El enlace de autorización no es válido o expiró. Vuelve a conectar Google Calendar.',
  missing_scope: 'No se concedió acceso a Google Calendar. Conéctalo de nuevo y acepta el permiso del calendario.',
  exchange_failed: 'No se pudo completar la conexión con Google. Inténtalo de nuevo.',
}
const GENERIC_ERROR = 'No se pudo conectar Google Calendar. Inténtalo de nuevo.'

type OAuthReturn = { ok: true } | { ok: false; message: string } | null

function readOAuthReturn(params: URLSearchParams): OAuthReturn {
  const google = params.get('google')
  if (google === 'connected') return { ok: true }
  if (google === 'error') {
    const reason = params.get('reason') ?? ''
    return { ok: false, message: Object.hasOwn(ERROR_MESSAGES, reason) ? ERROR_MESSAGES[reason] : GENERIC_ERROR }
  }
  return null
}

/** Shows the result of the Google OAuth redirect (`?google=…`) once, then cleans the URL. */
export function GoogleOAuthReturnNotice() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [result] = useState(() => readOAuthReturn(searchParams))

  useEffect(() => {
    if (!searchParams.has('google') && !searchParams.has('reason')) return
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.delete('google')
        next.delete('reason')
        return next
      },
      { replace: true },
    )
  }, [searchParams, setSearchParams])

  if (!result) return null
  return result.ok ? <Notice>Google Calendar conectado</Notice> : <Notice tone="error">{result.message}</Notice>
}
