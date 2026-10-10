import { useState } from 'react'
import { Button, Card, EmptyState, ErrorMessage, Modal, QueryBoundary } from '@/shared/ui'
import type { Exercise, ExerciseCreate } from '../../api/types'
import {
  useCreateExercise,
  useDeleteExercise,
  useExercises,
  useUpdateExercise,
  useUploadExercisePhoto,
} from '../../hooks/useExercises'
import { ExerciseForm } from './ExerciseForm'
import { ExerciseList } from './ExerciseList'
import { ExercisePhotoManager } from './ExercisePhotoManager'
import { ExercisePhotoPicker } from './ExercisePhotoPicker'

type Editing = { mode: 'create' } | { mode: 'edit'; id: number } | null

export function ExercisesContainer() {
  const exercises = useExercises()
  const create = useCreateExercise()
  const update = useUpdateExercise()
  const remove = useDeleteExercise()
  const upload = useUploadExercisePhoto()
  const [editing, setEditing] = useState<Editing>(null)
  const [newPhoto, setNewPhoto] = useState<File | null>(null)

  // Always read the latest version from the list so photo changes show up in the modal.
  const current = editing?.mode === 'edit' ? exercises.data?.find((e) => e.id === editing.id) : undefined
  const mutation = editing?.mode === 'edit' ? update : create

  const close = () => {
    setEditing(null)
    setNewPhoto(null)
    create.reset()
    update.reset()
    upload.reset()
  }

  const submit = (values: ExerciseCreate) => {
    if (editing?.mode === 'edit') {
      update.mutate({ id: editing.id, body: values }, { onSuccess: close })
    } else {
      create.mutate(values, {
        onSuccess: (created) => {
          if (!newPhoto) return close()
          // The exercise already exists: if the upload fails, stay in edit mode so it can be retried.
          setEditing({ mode: 'edit', id: created.id })
          upload.mutate({ id: created.id, file: newPhoto }, { onSuccess: close })
          setNewPhoto(null)
        },
      })
    }
  }

  return (
    <Card
      title="Ejercicios"
      actions={<Button onClick={() => setEditing({ mode: 'create' })}>Nuevo ejercicio</Button>}
    >
      <ErrorMessage error={remove.error} title="No se pudo eliminar el ejercicio" />
      <QueryBoundary query={exercises}>
        {(list) =>
          list.length === 0 ? (
            <EmptyState title="Aún no hay ejercicios" description="Crea tu primer ejercicio para armar rutinas." />
          ) : (
            <ExerciseList
              exercises={list}
              onEdit={(exercise: Exercise) => setEditing({ mode: 'edit', id: exercise.id })}
              onDelete={(exercise) => remove.mutate(exercise.id)}
            />
          )
        }
      </QueryBoundary>
      <Modal open={editing !== null} title={current ? 'Editar ejercicio' : 'Nuevo ejercicio'} onClose={close}>
        <ExerciseForm
          key={current?.id ?? 'new'}
          initial={current}
          pending={mutation.isPending || upload.isPending}
          error={mutation.error}
          onSubmit={submit}
          onCancel={close}
        >
          {current ? (
            <ExercisePhotoManager exercise={current} />
          ) : (
            <ExercisePhotoPicker file={newPhoto} onChange={setNewPhoto} />
          )}
          <ErrorMessage error={upload.error} title="El ejercicio se creó, pero no se pudo subir la foto" />
        </ExerciseForm>
      </Modal>
    </Card>
  )
}
