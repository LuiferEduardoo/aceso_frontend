import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { formatDate } from '@/shared/lib/format'
import { Button, Card, ConfirmButton, EmptyState, ErrorMessage, Modal, QueryBoundary } from '@/shared/ui'
import { useCreatePlan, useDeletePlan, usePlans } from '../../hooks/usePlans'
import { PlanForm } from './PlanForm'

export function PlansContainer() {
  const navigate = useNavigate()
  const plans = usePlans()
  const create = useCreatePlan()
  const remove = useDeletePlan()
  const [creating, setCreating] = useState(false)

  const close = () => {
    setCreating(false)
    create.reset()
  }

  return (
    <Card title="Planes de entrenamiento" actions={<Button onClick={() => setCreating(true)}>Nuevo plan</Button>}>
      <ErrorMessage error={remove.error} title="No se pudo eliminar el plan" />
      <QueryBoundary query={plans}>
        {(list) =>
          list.length === 0 ? (
            <EmptyState title="Aún no hay planes de entrenamiento" description="Crea un plan y programa sus carreras." />
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {list.map((plan) => (
                <li key={plan.id} className="flex flex-col gap-1 rounded-md border border-slate-200 p-3 dark:border-slate-700">
                  <Link to={`/running/plans/${plan.id}`} className="font-medium text-emerald-700 hover:underline">
                    {plan.name}
                  </Link>
                  {plan.goal && <p className="text-sm text-slate-500">{plan.goal}</p>}
                  <p className="text-sm">
                    {formatDate(plan.start_date)} → {formatDate(plan.end_date)} · {plan.runs.length} carreras
                  </p>
                  <div className="mt-1">
                    <ConfirmButton onConfirm={() => remove.mutate(plan.id)}>Eliminar</ConfirmButton>
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </QueryBoundary>
      <Modal open={creating} title="Nuevo plan de entrenamiento" onClose={close}>
        <PlanForm
          pending={create.isPending}
          error={create.error}
          onCancel={close}
          onSubmit={(values) =>
            create.mutate({ ...values, runs: [] }, { onSuccess: (plan) => navigate(`/running/plans/${plan.id}`) })
          }
        />
      </Modal>
    </Card>
  )
}
