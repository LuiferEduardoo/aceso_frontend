import { useState, type ChangeEvent } from 'react'
import { BlobImage, Button, ErrorMessage } from '@/shared/ui'
import { PHOTO_TYPES, type Exercise } from '../../api/types'
import { useExercisePhoto, useRemoveExercisePhoto, useUploadExercisePhoto } from '../../hooks/useExercises'
import { validatePhoto } from './photoValidation'

/** Container: preview, upload and removal of an exercise photo. */
export function ExercisePhotoManager({ exercise }: { exercise: Exercise }) {
  const photo = useExercisePhoto(exercise)
  const upload = useUploadExercisePhoto()
  const remove = useRemoveExercisePhoto()
  const [localError, setLocalError] = useState<string | null>(null)

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const problem = validatePhoto(file)
    setLocalError(problem)
    if (!problem) upload.mutate({ id: exercise.id, file })
  }

  return (
    <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
      <p className="text-sm font-medium">Foto</p>
      {exercise.image_url && photo.data ? (
        <BlobImage blob={photo.data} alt={`Foto de ${exercise.name}`} className="max-h-48 w-fit rounded-md object-contain" />
      ) : (
        <p className="text-sm text-slate-500">Aún no hay foto.</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">
          {upload.isPending ? 'Subiendo…' : exercise.image_url ? 'Reemplazar foto' : 'Subir foto'}
          <input type="file" accept={PHOTO_TYPES.join(',')} className="sr-only" onChange={onFile} />
        </label>
        {exercise.image_url && (
          <Button size="sm" variant="ghost" loading={remove.isPending} onClick={() => remove.mutate(exercise.id)}>
            Quitar foto
          </Button>
        )}
      </div>
      {localError && <p role="alert" className="text-xs text-red-600">{localError}</p>}
      <ErrorMessage error={upload.error ?? remove.error ?? photo.error} />
    </div>
  )
}
