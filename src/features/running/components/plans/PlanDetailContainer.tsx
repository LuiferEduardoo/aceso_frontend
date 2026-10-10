import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { formatDate } from '@/shared/lib/format'
import { Button, Card, ConfirmButton, EmptyState, ErrorMessage, Modal, QueryBoundary } from '@/shared/ui'
import type { PlannedRun, PlannedRunInput } from '../../api/types'
import {
  useAddPlannedRun,
  useDeletePlan,
  useDeletePlannedRun,
  usePlan,
  useUpdatePlan,
  useUpdatePlannedRun,
} from '../../hooks/usePlans'
import { LinkActivityContainer } from './LinkActivityContainer'
import { PlanForm } from './PlanForm'
import { PlannedRunForm } from './PlannedRunForm'
import { PlannedRunList } from './PlannedRunList'

type Dialog = { kind: 'plan' } | { kind: 'run'; run?: PlannedRun } | { kind: 'link'; run: PlannedRun } | null

export function PlanDetailContainer({ planId }: { planId: number }) {
  const navigate = useNavigate()
  const plan = usePlan(planId)
  const updatePlan = useUpdatePlan()
  const removePlan = useDeletePlan()
  const addRun = useAddPlannedRun()
  const updateRun = useUpdatePlannedRun()
  const removeRun = useDeletePlannedRun()
  const [dialog, setDialog] = useState<Dialog>(null)

  const close = () => {
    setDialog(null)
    updatePlan.reset()
    addRun.reset()
    updateRun.reset()
  }

  const saveRun = (body: PlannedRunInput) => {
    if (dialog?.kind !== 'run') return
    if (dialog.run) updateRun.mutate({ id: dialog.run.id, body }, { onSuccess: close })
    else addRun.mutate({ planId, body }, { onSuccess: close })
  }

  const runMutation = dialog?.kind === 'run' && dialog.run ? updateRun : addRun

  return (
    <QueryBoundary query={plan}>
      {(data) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link to="/running/plans" className="text-sm text-emerald-700 underline">
                ← Planes
              </Link>
              <h2 className="text-xl font-semibold">{data.name}</h2>
              <p className="text-sm text-slate-500">
                {formatDate(data.start_date)} → {formatDate(data.end_date)}
              </p>
              {data.goal && <p className="mt-1 text-sm">{data.goal}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setDialog({ kind: 'plan' })}>
                Editar plan
              </Button>
              <ConfirmButton
                confirmLabel="Eliminar plan"
                onConfirm={() => removePlan.mutate(planId, { onSuccess: () => navigate('/running/plans') })}
              >
                Eliminar
              </ConfirmButton>
            </div>
          </div>

          <ErrorMessage error={removePlan.error ?? removeRun.error ?? (dialog === null ? updateRun.error : null)} />

          <Card title="Carreras planificadas" actions={<Button onClick={() => setDialog({ kind: 'run' })}>Añadir carrera</Button>}>
            {data.runs.length === 0 ? (
              <EmptyState title="Aún no hay carreras planificadas" />
            ) : (
              <PlannedRunList
                runs={data.runs}
                onEdit={(run) => setDialog({ kind: 'run', run })}
                onLink={(run) => setDialog({ kind: 'link', run })}
                onUnlink={(run) => updateRun.mutate({ id: run.id, body: { completed_activity_id: null } })}
                onDelete={(run) => removeRun.mutate(run.id)}
              />
            )}
          </Card>

          <Modal open={dialog?.kind === 'plan'} title="Editar plan" onClose={close}>
            <PlanForm
              initial={data}
              pending={updatePlan.isPending}
              error={updatePlan.error}
              onCancel={close}
              onSubmit={(body) => updatePlan.mutate({ id: planId, body }, { onSuccess: close })}
            />
          </Modal>
          <Modal open={dialog?.kind === 'run'} title={dialog?.kind === 'run' && dialog.run ? 'Editar carrera' : 'Añadir carrera'} onClose={close}>
            {dialog?.kind === 'run' && (
              <PlannedRunForm
                key={dialog.run?.id ?? 'new'}
                planStart={data.start_date}
                planEnd={data.end_date}
                initial={dialog.run}
                pending={runMutation.isPending}
                error={runMutation.error}
                onCancel={close}
                onSubmit={saveRun}
              />
            )}
          </Modal>
          <Modal open={dialog?.kind === 'link'} title="Vincular actividad" onClose={close}>
            {dialog?.kind === 'link' && <LinkActivityContainer run={dialog.run} onDone={close} />}
          </Modal>
        </div>
      )}
    </QueryBoundary>
  )
}
