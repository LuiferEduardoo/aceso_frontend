import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { optionalText } from '@/shared/lib/forms'
import { Button, Checkbox, ErrorMessage, Input, Select, Textarea } from '@/shared/ui'
import {
  EQUIPMENT,
  EQUIPMENT_LABELS,
  EXERCISE_TYPES,
  EXERCISE_TYPE_LABELS,
  MUSCLE_GROUPS,
  MUSCLE_GROUP_LABELS,
  type Exercise,
  type ExerciseCreate,
  type MuscleGroup,
} from '../../api/types'

/** Required select: the empty placeholder value fails with a Spanish message. */
function requiredChoice<const T extends readonly [string, ...string[]]>(values: T, message: string) {
  return z.string().pipe(z.enum(values, { error: message }))
}

const schema = z
  .object({
    name: z.string().trim().min(1, 'El nombre es obligatorio').max(100, 'Usa como máximo 100 caracteres'),
    muscle_group: requiredChoice(MUSCLE_GROUPS, 'Elige el grupo muscular'),
    secondary_muscles: z.array(z.enum(MUSCLE_GROUPS)),
    equipment: requiredChoice(EQUIPMENT, 'Elige el equipamiento'),
    exercise_type: requiredChoice(EXERCISE_TYPES, 'Elige el tipo de ejercicio'),
    instructions: optionalText,
  })
  .refine((values) => new Set(values.secondary_muscles).size === values.secondary_muscles.length, {
    path: ['secondary_muscles'],
    message: 'No repitas músculos secundarios',
  })
  .refine((values) => !values.secondary_muscles.includes(values.muscle_group), {
    path: ['secondary_muscles'],
    message: 'Los músculos secundarios no pueden incluir el grupo muscular principal',
  })

const MUSCLE_GROUP_OPTIONS = MUSCLE_GROUPS.map((value) => ({ value, label: MUSCLE_GROUP_LABELS[value] }))
const EQUIPMENT_OPTIONS = EQUIPMENT.map((value) => ({ value, label: EQUIPMENT_LABELS[value] }))
const EXERCISE_TYPE_OPTIONS = EXERCISE_TYPES.map((value) => ({ value, label: EXERCISE_TYPE_LABELS[value] }))

interface ExerciseFormProps {
  initial?: Exercise
  pending: boolean
  error: unknown
  onSubmit: (values: ExerciseCreate) => void
  onCancel: () => void
  /** Extra fields rendered before the actions, e.g. the photo controls. */
  children?: ReactNode
}

export function ExerciseForm({ initial, pending, error, onSubmit, onCancel, children }: ExerciseFormProps) {
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      muscle_group: initial?.muscle_group ?? '',
      secondary_muscles: initial?.secondary_muscles ?? [],
      equipment: initial?.equipment ?? '',
      exercise_type: initial?.exercise_type ?? '',
      instructions: initial?.instructions ?? '',
    },
  })
  const primary = useWatch({ control, name: 'muscle_group' })
  const secondaryOptions = MUSCLE_GROUPS.filter((muscle) => muscle !== primary)

  // A muscle cannot be both primary and secondary: drop it when it becomes the primary one.
  const muscleGroupField = register('muscle_group', {
    onChange: (event: { target: { value: string } }) => {
      const current = getValues('secondary_muscles')
      if (current.some((muscle) => muscle === event.target.value)) {
        setValue(
          'secondary_muscles',
          current.filter((muscle) => muscle !== event.target.value),
        )
      }
    },
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={handleSubmit((values) => onSubmit({ ...values, instructions: values.instructions ?? null }))}
    >
      <Input label="Nombre" error={errors.name?.message} {...register('name')} />
      <Select
        label="Grupo muscular"
        placeholder="Selecciona…"
        options={MUSCLE_GROUP_OPTIONS}
        error={errors.muscle_group?.message}
        {...muscleGroupField}
      />
      <Controller
        control={control}
        name="secondary_muscles"
        render={({ field }) => {
          const toggle = (muscle: MuscleGroup, checked: boolean) =>
            field.onChange(checked ? [...field.value, muscle] : field.value.filter((m) => m !== muscle))
          return (
            <fieldset className="flex flex-col gap-1" aria-describedby={errors.secondary_muscles ? 'secondary-muscles-error' : undefined}>
              <legend className="text-sm font-medium text-slate-700 dark:text-slate-200">Músculos secundarios</legend>
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                {secondaryOptions.map((muscle) => (
                  <Checkbox
                    key={muscle}
                    label={MUSCLE_GROUP_LABELS[muscle]}
                    checked={field.value.includes(muscle)}
                    onChange={(event) => toggle(muscle, event.target.checked)}
                  />
                ))}
              </div>
              {errors.secondary_muscles && (
                <p id="secondary-muscles-error" role="alert" className="text-xs text-red-600">
                  {errors.secondary_muscles.message}
                </p>
              )}
            </fieldset>
          )
        }}
      />
      <Select
        label="Equipamiento"
        placeholder="Selecciona…"
        options={EQUIPMENT_OPTIONS}
        error={errors.equipment?.message}
        {...register('equipment')}
      />
      <Select
        label="Tipo de ejercicio"
        placeholder="Selecciona…"
        options={EXERCISE_TYPE_OPTIONS}
        error={errors.exercise_type?.message}
        {...register('exercise_type')}
      />
      <Textarea label="Instrucciones" placeholder="Descripción de la técnica" {...register('instructions')} />
      {children}
      <ErrorMessage error={error} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {initial ? 'Guardar cambios' : 'Crear ejercicio'}
        </Button>
      </div>
    </form>
  )
}
