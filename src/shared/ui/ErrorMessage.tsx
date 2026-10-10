import { errorMessage } from '@/shared/api/errors'

interface ErrorMessageProps {
  error: unknown
  title?: string
}

export function ErrorMessage({ error, title }: ErrorMessageProps) {
  if (!error) return null
  return (
    <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      {title && <p className="font-medium">{title}</p>}
      <p>{errorMessage(error)}</p>
    </div>
  )
}
