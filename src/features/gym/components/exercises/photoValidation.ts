import { MAX_PHOTO_BYTES, PHOTO_TYPES } from '../../api/types'

export function validatePhoto(file: File): string | null {
  if (!(PHOTO_TYPES as readonly string[]).includes(file.type)) return 'Usa una imagen JPEG, PNG o WebP.'
  if (file.size > MAX_PHOTO_BYTES) return 'La foto debe pesar 5 MB o menos.'
  return null
}
