import { Link } from 'react-router'
import { EmptyState } from '@/shared/ui'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <EmptyState
        title="Página no encontrada"
        description="La página que buscas no existe."
        action={
          <Link to="/" className="text-sm text-emerald-700 underline">
            Ir al inicio
          </Link>
        }
      />
    </div>
  )
}
