import { formatDistance, formatDuration, formatNumber } from '@/shared/lib/format'
import { Button, ConfirmButton, DataTable, type Column } from '@/shared/ui'
import type { ExerciseSet } from '../../api/types'

interface SetTableProps {
  sets: ExerciseSet[]
  onEdit: (set: ExerciseSet) => void
  onDelete: (set: ExerciseSet) => void
}

export function SetTable({ sets, onEdit, onDelete }: SetTableProps) {
  const columns: Column<ExerciseSet>[] = [
    { header: 'Serie', cell: (s) => s.set_number },
    { header: 'Reps.', cell: (s) => formatNumber(s.reps) },
    {
      header: 'Peso',
      cell: (s) =>
        s.weight_kg == null && s.added_weight_kg == null
          ? '—'
          : `${formatNumber(s.weight_kg, ' kg')}${s.added_weight_kg != null ? ` (+${s.added_weight_kg} kg)` : ''}`,
    },
    { header: 'Duración', cell: (s) => formatDuration(s.duration_s) },
    { header: 'Distancia', cell: (s) => formatDistance(s.distance_m) },
    { header: 'RPE', cell: (s) => formatNumber(s.rpe) },
    { header: 'Intervalos', cell: (s) => s.intervals.length || '—' },
    { header: 'Hecha', cell: (s) => (s.completed ? '✓' : '') },
    {
      header: 'Acciones',
      cell: (s) => (
        <span className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => onEdit(s)}>
            Editar
          </Button>
          <ConfirmButton onConfirm={() => onDelete(s)}>Eliminar</ConfirmButton>
        </span>
      ),
    },
  ]
  return <DataTable rows={sets} columns={columns} rowKey={(s) => s.id} caption="Series" />
}
