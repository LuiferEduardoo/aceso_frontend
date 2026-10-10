import type { ReactNode } from 'react'

export interface NavItem {
  to: string
  label: string
  icon: ReactNode
  /** Only active on the exact path (needed when `to` is a section root). */
  end?: boolean
}

export type SectionId = 'gym' | 'running' | 'health'

export interface NavSection {
  id: SectionId
  label: string
  /** Section root: the section switcher navigates here. */
  root: string
  icon: ReactNode
  items: readonly NavItem[]
}

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  className: 'size-6 shrink-0',
} as const

const calendarIcon = (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)

/** Single source of truth for the app sections (in display order) and their pages. */
export const NAV_SECTIONS: readonly NavSection[] = [
  {
    id: 'health',
    label: 'Salud',
    root: '/health',
    icon: (
      <svg {...iconProps}>
        <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" />
      </svg>
    ),
    items: [
      {
        to: '/health',
        label: 'Resumen',
        end: true,
        icon: (
          <svg {...iconProps}>
            <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" />
            <path d="M7 12h2.5l1.5-2.5 2 4 1.5-2.5H17" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'gym',
    label: 'Gimnasio',
    root: '/gym',
    icon: (
      <svg {...iconProps}>
        <path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12" />
      </svg>
    ),
    items: [
      { to: '/gym/sessions', label: 'Sesiones', icon: calendarIcon },
      {
        to: '/gym/routines',
        label: 'Rutinas',
        icon: (
          <svg {...iconProps}>
            <path d="M9 6h11M9 12h11M9 18h11" />
            <path d="M4 6h.01M4 12h.01M4 18h.01" />
          </svg>
        ),
      },
      {
        to: '/gym/exercises',
        label: 'Ejercicios',
        icon: (
          <svg {...iconProps}>
            <path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'running',
    label: 'Running',
    root: '/running',
    icon: (
      <svg {...iconProps}>
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </svg>
    ),
    items: [
      {
        to: '/running/plans',
        label: 'Planes',
        icon: (
          <svg {...iconProps}>
            <rect x="5" y="4" width="14" height="17" rx="2" />
            <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" />
          </svg>
        ),
      },
      { to: '/running/schedule', label: 'Calendario', icon: calendarIcon },
      {
        to: '/running/activities',
        label: 'Actividades',
        icon: (
          <svg {...iconProps}>
            <path d="M3 12h4l3-8 4 16 3-8h4" />
          </svg>
        ),
      },
    ],
  },
]

function isWithin(pathname: string, root: string): boolean {
  return pathname === root || pathname.startsWith(`${root}/`)
}

/** Section owning `pathname`; falls back to Gimnasio, where `/` redirects. */
export function sectionForPath(pathname: string): NavSection {
  return (
    NAV_SECTIONS.find((section) => isWithin(pathname, section.root)) ??
    NAV_SECTIONS.find((section) => section.id === 'gym')!
  )
}
