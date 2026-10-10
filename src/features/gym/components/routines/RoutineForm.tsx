import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { Button, EmptyState, ErrorMessage, Input, Select, Textarea, type SelectOption } from '@/shared/ui'
import type { RoutineCreate } from '../../api/types'
import {
  emptyRoutineExercise,
  formToRoutine,
  routineSchema,
  type RoutineFormInput,
  type RoutineFormOutput,
} from './routineSchema'

interface RoutineFormProps {
  defaultValues: RoutineFormInput
  exerciseOptions: SelectOption[]
  pending: boolean
  error: unknown
  submitLabel: string
  onSubmit: (routine: RoutineCreate) => void
  onCancel: () => void
}

/** Presentational routine editor with an ordered list of exercises and their targets. */
export function RoutineForm(props: RoutineFormProps) {
  const { defaultValues, exerciseOptions, pending, error, submitLabel, onSubmit, onCancel } = props
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RoutineFormInput, unknown, RoutineFormOutput>({
    resolver: zodResolver(routineSchema),
    defaultValues,
  })
  const { fields, append, remove, move } = useFieldArray({ control, name: 'exercises' })

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit((values) => onSubmit(formToRoutine(values)))}>
      <Input label="Nombre" error={errors.name?.message} {...register('name')} />
      <Textarea label="Descripción" {...register('description')} />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold">Ejercicios (en orden)</legend>
        {fields.length === 0 && <EmptyState title="No hay ejercicios en esta rutina" />}
        {fields.map((field, index) => {
          const rowErrors = errors.exercises?.[index]
          return (
            <div key={field.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">#{index + 1}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" aria-label="Subir" disabled={index === 0} onClick={() => move(index, index - 1)}>
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Bajar"
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    ↓
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(index)}>
                    Quitar
                  </Button>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                <div className="sm:col-span-2 lg:col-span-1">
                  <Select
                    label="Ejercicio"
                    placeholder="Selecciona…"
                    options={exerciseOptions}
                    error={rowErrors?.exercise_id?.message}
                    {...register(`exercises.${index}.exercise_id`)}
                  />
                </div>
                <Input label="Series" inputMode="numeric" error={rowErrors?.target_sets?.message} {...register(`exercises.${index}.target_sets`)} />
                <Input label="Repeticiones" inputMode="numeric" error={rowErrors?.target_reps?.message} {...register(`exercises.${index}.target_reps`)} />
                <Input label="Peso (kg)" inputMode="decimal" error={rowErrors?.target_weight_kg?.message} {...register(`exercises.${index}.target_weight_kg`)} />
                <Input label="Duración (s)" inputMode="numeric" error={rowErrors?.target_duration_s?.message} {...register(`exercises.${index}.target_duration_s`)} />
              </div>
              <div className="mt-2">
                <Input label="Notas" {...register(`exercises.${index}.notes`)} />
              </div>
            </div>
          )
        })}
        <Button variant="secondary" className="self-start" onClick={() => append({ ...emptyRoutineExercise })} disabled={exerciseOptions.length === 0}>
          Añadir ejercicio
        </Button>
        {exerciseOptions.length === 0 && <p className="text-sm text-slate-500">Crea ejercicios primero para añadirlos aquí.</p>}
      </fieldset>

      <ErrorMessage error={error} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
