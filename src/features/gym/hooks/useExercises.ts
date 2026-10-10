import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { exercisesApi } from '../api/exercisesApi'
import type { Exercise, ExerciseCreate, ExerciseUpdate } from '../api/types'
import { gymKeys } from './queryKeys'

export function useExercises() {
  return useQuery({ queryKey: gymKeys.exercises(), queryFn: exercisesApi.list })
}

function useInvalidateExercises() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: gymKeys.exercises() })
}

export function useCreateExercise() {
  const invalidate = useInvalidateExercises()
  return useMutation({ mutationFn: (body: ExerciseCreate) => exercisesApi.create(body), onSuccess: invalidate })
}

export function useUpdateExercise() {
  const invalidate = useInvalidateExercises()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ExerciseUpdate }) => exercisesApi.update(id, body),
    onSuccess: invalidate,
  })
}

export function useDeleteExercise() {
  const invalidate = useInvalidateExercises()
  return useMutation({ mutationFn: (id: number) => exercisesApi.remove(id), onSuccess: invalidate })
}

export function useUploadExercisePhoto() {
  const invalidate = useInvalidateExercises()
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => exercisesApi.uploadPhoto(id, file),
    onSuccess: invalidate,
  })
}

export function useRemoveExercisePhoto() {
  const invalidate = useInvalidateExercises()
  return useMutation({ mutationFn: (id: number) => exercisesApi.removePhoto(id), onSuccess: invalidate })
}

/** Loads an authenticated exercise photo as a Blob (only when the exercise has one). */
export function useExercisePhoto(exercise: Pick<Exercise, 'id' | 'image_url'>) {
  return useQuery({
    queryKey: gymKeys.exercisePhoto(exercise.id, exercise.image_url),
    queryFn: () => exercisesApi.fetchPhoto(exercise.id),
    enabled: exercise.image_url !== null,
    staleTime: Infinity,
  })
}
