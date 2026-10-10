import { useState, type FormEvent } from 'react'
import { Button, Input, Select, type SelectOption } from '@/shared/ui'

interface AddExerciseFormProps {
  options: SelectOption[]
  pending: boolean
  onAdd: (values: { exercise_id: number; notes: string | null }) => void
}

export function AddExerciseForm({ options, pending, onAdd }: AddExerciseFormProps) {
  const [exerciseId, setExerciseId] = useState('')
  const [notes, setNotes] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!exerciseId) return
    onAdd({ exercise_id: Number(exerciseId), notes: notes.trim() || null })
    setExerciseId('')
    setNotes('')
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2" aria-label="Añadir ejercicio a la sesión">
      <div className="min-w-48 flex-1">
        <Select label="Ejercicio" placeholder="Selecciona…" options={options} value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} />
      </div>
      <div className="min-w-48 flex-1">
        <Input label="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button type="submit" loading={pending} disabled={!exerciseId}>
        Añadir ejercicio
      </Button>
    </form>
  )
}
