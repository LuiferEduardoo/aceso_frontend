import type { ReactNode } from 'react'

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
      {children}
    </div>
  )
}
