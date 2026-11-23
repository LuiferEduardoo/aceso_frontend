import { cn } from '@/shared/lib/cn'
import type { AgendaDay } from '../../api/types'
import { agendaItems, type AgendaItemKind } from './agendaItems'

const KIND_STYLES: Record<AgendaItemKind, string> = {
  event: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100',
  task: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  habit: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
}

const MAX_VISIBLE = 3

/** Compact list of a day's items for the month grid. */
export function AgendaDayChips({ day }: { day: AgendaDay }) {
  const items = agendaItems(day)
  const hidden = items.length - MAX_VISIBLE
  return (
    <>
      {items.slice(0, MAX_VISIBLE).map((item) => (
        <span
          key={item.key}
          className={cn('truncate rounded px-1.5 py-0.5 text-xs', KIND_STYLES[item.kind], item.done && 'line-through opacity-70')}
        >
          {item.kind === 'habit' && (item.done ? '✓ ' : '○ ')}
          {item.label}
        </span>
      ))}
      {hidden > 0 && <span className="px-1.5 text-xs text-slate-500">+{hidden} más</span>}
    </>
  )
}
