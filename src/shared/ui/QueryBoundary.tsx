import type { ReactNode } from 'react'
import { ErrorMessage } from './ErrorMessage'
import { Spinner } from './Spinner'

interface QueryBoundaryProps<T> {
  query: { isPending: boolean; error: unknown; data: T | undefined }
  children: (data: T) => ReactNode
}

/** Renders loading / error states of a query and delegates the data to `children`. */
export function QueryBoundary<T>({ query, children }: QueryBoundaryProps<T>) {
  if (query.error) return <ErrorMessage error={query.error} />
  if (query.isPending || query.data === undefined) return <Spinner />
  return <>{children(query.data)}</>
}
