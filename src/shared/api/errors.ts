export type FieldErrors = Record<string, string>

interface ValidationIssue {
  loc?: Array<string | number>
  msg?: string
  type?: string
}

/** Single error shape for every failed API call. */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldErrors

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

const FALLBACK_MESSAGES: Record<number, string> = {
  400: 'La solicitud no es válida.',
  401: 'Tu sesión ha expirado. Vuelve a iniciar sesión.',
  403: 'No tienes permiso para hacer eso.',
  404: 'No se encontró el recurso solicitado.',
  409: 'Esto entra en conflicto con datos existentes.',
  422: 'Algunos campos no son válidos.',
  502: 'Falló un servicio externo. Inténtalo de nuevo más tarde.',
}

function isValidationIssue(value: unknown): value is ValidationIssue {
  return typeof value === 'object' && value !== null && 'msg' in value
}

/** Drops FastAPI location prefixes such as `body` / `query` to get the field path. */
function fieldName(loc: Array<string | number> = []): string {
  const parts = loc.filter((part) => !['body', 'query', 'path', 'header'].includes(String(part)))
  return parts.length > 0 ? parts.join('.') : 'form'
}

function cleanMessage(msg: string): string {
  return msg.replace(/^Value error, /, '')
}

/**
 * Normalizes both backend error shapes into an ApiError:
 * - domain errors: `{"detail": "message"}`
 * - FastAPI validation errors: `{"detail": [{loc, msg, type}]}`
 */
export function normalizeApiError(status: number, body: unknown): ApiError {
  const fallback = FALLBACK_MESSAGES[status] ?? `Error inesperado (${status}).`
  const detail =
    typeof body === 'object' && body !== null && 'detail' in body
      ? (body as { detail: unknown }).detail
      : undefined

  if (typeof detail === 'string' && detail.trim() !== '') {
    return new ApiError(status, detail)
  }

  if (Array.isArray(detail)) {
    const issues = detail.filter(isValidationIssue)
    const fieldErrors: FieldErrors = {}
    for (const issue of issues) {
      const name = fieldName(issue.loc)
      fieldErrors[name] ??= cleanMessage(issue.msg ?? 'Valor no válido')
    }
    const message = issues
      .map((issue) => `${fieldName(issue.loc)}: ${cleanMessage(issue.msg ?? 'Valor no válido')}`)
      .join('; ')
    return new ApiError(status, message || fallback, fieldErrors)
  }

  if (typeof body === 'string' && body.trim() !== '' && body.length < 300) {
    return new ApiError(status, body)
  }

  return new ApiError(status, fallback)
}

export function toNetworkError(cause: unknown): ApiError {
  const reason = cause instanceof Error ? cause.message : String(cause)
  return new ApiError(0, `No se pudo conectar con el servidor (${reason}).`)
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Algo salió mal.'
}
