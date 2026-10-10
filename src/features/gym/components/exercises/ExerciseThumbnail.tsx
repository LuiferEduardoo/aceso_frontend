import { BlobImage } from '@/shared/ui'
import type { Exercise } from '../../api/types'
import { useExercisePhoto } from '../../hooks/useExercises'

/** Container: loads the authenticated photo and shows it, or an initial as placeholder. */
export function ExerciseThumbnail({ exercise, size = 48 }: { exercise: Exercise; size?: number }) {
  const photo = useExercisePhoto(exercise)
  const style = { width: size, height: size }
  if (!exercise.image_url || !photo.data) {
    return (
      <div
        style={style}
        className="flex shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-400 dark:bg-slate-800"
      >
        {exercise.name.charAt(0).toUpperCase()}
      </div>
    )
  }
  return <BlobImage blob={photo.data} alt={`Foto de ${exercise.name}`} style={style} className="shrink-0 rounded-md object-cover" />
}
