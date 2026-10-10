import type { ReactNode } from 'react'

export function AuthLayout({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-emerald-600">Aceso</p>
        <h1 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-slate-50">{title}</h1>
        {children}
        <p className="mt-4 text-center text-sm text-slate-500">{footer}</p>
      </div>
    </main>
  )
}
