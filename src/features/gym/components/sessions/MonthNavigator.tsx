import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { Button } from '@/shared/ui'

interface MonthNavigatorProps {
  month: Date
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}

export function MonthNavigator({ month, onPrevious, onNext, onToday }: MonthNavigatorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="secondary" onClick={onPrevious} aria-label="Mes anterior">
        ←
      </Button>
      <span className="min-w-36 text-center font-medium">{format(month, "MMMM 'de' yyyy", { locale: es })}</span>
      <Button size="sm" variant="secondary" onClick={onNext} aria-label="Mes siguiente">
        →
      </Button>
      <Button size="sm" variant="ghost" onClick={onToday}>
        Hoy
      </Button>
    </div>
  )
}
