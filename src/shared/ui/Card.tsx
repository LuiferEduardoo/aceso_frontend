import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface CardProps extends Omit<ComponentProps<'section'>, 'title'> {
  title?: ReactNode
  actions?: ReactNode
}

export function Card({ title, actions, className, children, ...props }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900',
        className,
      )}
      {...props}
    >
      {(title || actions) && (
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>}
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}
