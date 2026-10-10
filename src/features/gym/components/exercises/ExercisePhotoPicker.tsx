import { useState, type ChangeEvent } from 'react'
import { BlobImage, Button } from '@/shared/ui'
import { PHOTO_TYPES } from '../../api/types'
import { validatePhoto } from './photoValidation'

interface ExercisePhotoPickerProps {
  file: File | null
  onChange: (file: File | null) => void
}

/** Picks a photo for an exercise that does not exist yet; it is uploaded after the exercise is created. */
export function ExercisePhotoPicker({ file, onChange }: ExercisePhotoPickerProps) {
  const [error, setError] = useState<string | null>(null)

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0]
    event.target.value = ''
    if (!picked) return
    const problem = validatePhoto(picked)
    setError(problem)
    if (!problem) onChange(picked)
  }

  return (
    <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
      <p className="text-sm font-medium">Foto</p>
      {file ? (
        <BlobImage blob={file} alt="Vista previa de la foto" className="max-h-48 w-fit rounded-md object-contain" />
      ) : (
        <p className="text-sm text-slate-500">Opcional. JPEG, PNG o WebP de hasta 5 MB.</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">
          {file ? 'Cambiar foto' : 'Elegir foto'}
          <input type="file" accept={PHOTO_TYPES.join(',')} className="sr-only" onChange={onFile} />
        </label>
        {file && (
          <Button size="sm" variant="ghost" onClick={() => onChange(null)}>
            Quitar foto
          </Button>
        )}
      </div>
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
