import { useState } from 'react'
import { lastDays } from '@/shared/lib/dates'
import { DateRangePicker, Select } from '@/shared/ui'
import { HEALTH_SOURCE_LABELS, HEALTH_SOURCES, MAX_DAILY_RANGE_DAYS, type HealthSource } from '../api/types'
import { GarminPanel } from './GarminPanel'
import { IngestPanel } from './IngestPanel'
import { SamplesSection } from './SamplesSection'
import { SleepSection } from './SleepSection'
import { SummariesSection } from './SummariesSection'

const SOURCE_OPTIONS = HEALTH_SOURCES.map((value) => ({ value, label: HEALTH_SOURCE_LABELS[value] }))

export function HealthDashboardContainer() {
  const [range, setRange] = useState(() => lastDays(14))
  const [source, setSource] = useState<HealthSource | ''>('')
  const sourceFilter = source || undefined

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <DateRangePicker value={range} onChange={setRange} maxDays={MAX_DAILY_RANGE_DAYS} />
        <div className="w-48">
          <Select
            label="Origen"
            placeholder="Todos los orígenes"
            options={SOURCE_OPTIONS}
            value={source}
            onChange={(e) => setSource(e.target.value as HealthSource | '')}
          />
        </div>
      </div>
      <SummariesSection range={range} source={sourceFilter} />
      <SleepSection range={range} source={sourceFilter} />
      <SamplesSection source={sourceFilter} />
      <div className="grid gap-4 lg:grid-cols-2">
        <GarminPanel />
        <IngestPanel />
      </div>
    </div>
  )
}
