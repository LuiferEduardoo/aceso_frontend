import { describe, expect, it } from 'vitest'
import { ApiError, normalizeApiError } from './errors'

describe('normalizeApiError', () => {
  it('uses the domain error detail string as the message', () => {
    const error = normalizeApiError(409, { detail: 'Exercise is used by a routine' })
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(409)
    expect(error.message).toBe('Exercise is used by a routine')
    expect(error.fieldErrors).toEqual({})
  })

  it('maps FastAPI validation errors to field errors and a readable message', () => {
    const error = normalizeApiError(422, {
      detail: [
        { loc: ['body', 'password'], msg: 'String should have at least 8 characters', type: 'string_too_short' },
        { loc: ['query', 'from'], msg: 'Value error, range too long', type: 'value_error' },
      ],
    })
    expect(error.fieldErrors).toEqual({
      password: 'String should have at least 8 characters',
      from: 'range too long',
    })
    expect(error.message).toBe('password: String should have at least 8 characters; from: range too long')
  })

  it('joins nested locations with dots', () => {
    const error = normalizeApiError(422, {
      detail: [{ loc: ['body', 'exercises', 0, 'exercise_id'], msg: 'Field required', type: 'missing' }],
    })
    expect(error.fieldErrors).toEqual({ 'exercises.0.exercise_id': 'Field required' })
  })

  it('falls back to a status-based message when the body is unusable', () => {
    expect(normalizeApiError(502, undefined).message).toMatch(/servicio externo/i)
    expect(normalizeApiError(418, { foo: 'bar' }).message).toBe('Error inesperado (418).')
  })
})
