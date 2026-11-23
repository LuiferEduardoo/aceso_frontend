import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

const toneClass = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200',
} as const

interface NoticeProps {
  children: ReactNode
  tone?: keyof typeof toneClass
}

export function Notice({ children, tone = 'success' }: NoticeProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-md border px-3 py-2 text-sm', toneClass[tone])}
    >
      {children}
    </div>
  )
}
