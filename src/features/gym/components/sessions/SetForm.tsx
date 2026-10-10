import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { Button, Checkbox, ErrorMessage, Input } from '@/shared/ui'
import type { ExerciseSet, ExerciseSetInput } from '../../api/types'
import { emptyInterval, formToSet, setSchema, setToForm, type SetFormInput, type SetFormOutput } from './setSchema'

interface SetFormProps {
  initial?: ExerciseSet
  pending: boolean
  error: unknown
  onSubmit: (body: ExerciseSetInput) => void
  onCancel: () => void
}

/** Presentational set editor, including an intervals sub-editor for cardio work. */
export function SetForm({ initial, pending, error, onSubmit, onCancel }: SetFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SetFormInput, unknown, SetFormOutput>({
    resolver: zodResolver(setSchema),
    defaultValues: setToForm(initial),
  })
  const intervals = useFieldArray({ control, name: 'intervals' })

  return (
    <form noValidate className="flex flex-col gap-3" onSubmit={handleSubmit((values) => onSubmit(formToSet(values)))}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Input label="Repeticiones" inputMode="numeric" error={errors.reps?.message} {...register('reps')} />
        <Input label="Peso (kg)" inputMode="decimal" error={errors.weight_kg?.message} {...register('weight_kg')} />
        <Input label="Peso añadido (kg)" inputMode="decimal" error={errors.added_weight_kg?.message} {...register('added_weight_kg')} />
        <Input label="Duración (s)" inputMode="numeric" error={errors.duration_s?.message} {...register('duration_s')} />
        <Input label="Distancia (m)" inputMode="decimal" error={errors.distance_m?.message} {...register('distance_m')} />
        <Input label="RPE (1–10)" inputMode="decimal" error={errors.rpe?.message} {...register('rpe')} />
      </div>
      <Input label="Notas" {...register('notes')} />
      <Checkbox label="Completada" {...register('completed')} />

      <fieldset className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
        <legend className="px-1 text-sm font-semibold">Intervalos</legend>
        {intervals.fields.length === 0 && <p className="text-sm text-slate-500">Sin intervalos.</p>}
        {intervals.fields.map((field, index) => {
          const rowErrors = errors.intervals?.[index]
          return (
            <div key={field.id} className="grid grid-cols-2 items-end gap-2 sm:grid-cols-6">
              <Input label={`#${index + 1} Duración (s)`} error={rowErrors?.duration_s?.message} {...register(`intervals.${index}.duration_s`)} />
              <Input label="Distancia (m)" error={rowErrors?.distance_m?.message} {...register(`intervals.${index}.distance_m`)} />
              <Input label="Velocidad" error={rowErrors?.speed?.message} {...register(`intervals.${index}.speed`)} />
              <Input label="Inclinación (%)" error={rowErrors?.incline_pct?.message} {...register(`intervals.${index}.incline_pct`)} />
              <Input label="Nivel" error={rowErrors?.level?.message} {...register(`intervals.${index}.level`)} />
              <Button size="sm" variant="ghost" onClick={() => intervals.remove(index)}>
                Quitar
              </Button>
            </div>
          )
        })}
        <Button size="sm" variant="secondary" className="self-start" onClick={() => intervals.append({ ...emptyInterval })}>
          Añadir intervalo
        </Button>
      </fieldset>

      <ErrorMessage error={error} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {initial ? 'Guardar serie' : 'Añadir serie'}
        </Button>
      </div>
    </form>
  )
}
