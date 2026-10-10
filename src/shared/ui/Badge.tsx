import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type Tone = 'neutral' | 'success' | 'warning' | 'info'

const TONES: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  info: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', TONES[tone])}>{children}</span>
}
