import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { cn } from '@/shared/lib/cn'
import { NAV_SECTIONS, sectionForPath, type NavItem, type NavSection, type SectionId } from './navigation'
import { ProfileMenu } from './ProfileMenu'

/**
 * One layout for both form factors:
 *   - mobile: fixed bottom tab bar with the current section's pages;
 *   - `lg:` and up: sticky, collapsible sidebar with every section as an expandable group.
 * On mobile the header's section select switches sections.
 */
export function AppShell() {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 lg:flex dark:bg-slate-950 dark:text-slate-100">
      <SidebarNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-slate-200 bg-slate-50/95 px-4 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-950/95">
          {/* Desktop switches sections from the sidebar groups. */}
          <div className="min-w-0 flex-1 lg:hidden">
            <SectionSwitch />
          </div>
          <div className="ml-auto">
            <ProfileMenu />
          </div>
        </header>
        {/* Bottom padding clears the mobile tab bar (min-h-14 + border + safe area). */}
        <main className="w-full flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-8">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <TabBar />
    </div>
  )
}

function SectionSwitch() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const current = sectionForPath(pathname)

  return (
    <label className="block max-w-64">
      <span className="sr-only">Sección</span>
      <span className="relative block">
        <select
          aria-label="Cambiar sección"
          value={current.id}
          onChange={(event) => {
            const next = NAV_SECTIONS.find((section) => section.id === event.target.value)
            if (next) navigate(next.root)
          }}
          className="min-h-10 w-full appearance-none truncate rounded-lg border border-slate-300 bg-white py-2 pr-10 pl-3 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {NAV_SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
        <ChevronIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
      </span>
    </label>
  )
}

function SidebarNav() {
  const { pathname } = useLocation()
  const current = sectionForPath(pathname)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<ReadonlySet<SectionId>>(() => new Set([current.id]))
  // Entering another section (links, URL) opens its group without closing the others.
  const [lastSection, setLastSection] = useState(current.id)
  if (lastSection !== current.id) {
    setLastSection(current.id)
    setOpenGroups((groups) => new Set(groups).add(current.id))
  }

  const toggleGroup = (id: SectionId) => {
    if (isCollapsed) {
      setIsCollapsed(false)
      setOpenGroups((groups) => new Set(groups).add(id))
      return
    }
    setOpenGroups((groups) => {
      const next = new Set(groups)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <aside
      className={cn(
        'hidden shrink-0 border-r border-slate-200 bg-white transition-[width] lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col dark:border-slate-800 dark:bg-slate-900',
        isCollapsed ? 'w-20' : 'w-60',
      )}
    >
      <div className={cn('flex min-h-20 items-center gap-2', isCollapsed ? 'justify-center px-0' : 'justify-between px-3')}>
        <p className="truncate px-2 text-lg font-bold text-emerald-600 dark:text-emerald-400">
          {isCollapsed ? 'A' : 'Aceso'}
        </p>
        {!isCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            aria-label="Contraer menú lateral"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <PanelIcon className="size-5" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          aria-label="Desplegar menú lateral"
          className="mx-auto mb-3 flex size-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <PanelIcon className="size-5" />
        </button>
      )}

      <nav aria-label="Principal" className="flex flex-1 flex-col overflow-y-auto px-3 pb-4">
        <ul className="flex flex-col gap-1">
          {NAV_SECTIONS.map((section) => (
            <SidebarGroup
              key={section.id}
              section={section}
              isActive={section.id === current.id}
              isOpen={!isCollapsed && openGroups.has(section.id)}
              isCollapsed={isCollapsed}
              onToggle={() => toggleGroup(section.id)}
            />
          ))}
        </ul>
      </nav>
    </aside>
  )
}

interface SidebarGroupProps {
  section: NavSection
  isActive: boolean
  isOpen: boolean
  isCollapsed: boolean
  onToggle: () => void
}

function SidebarGroup({ section, isActive, isOpen, isCollapsed, onToggle }: SidebarGroupProps) {
  const listId = `sidebar-section-${section.id}`
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={isCollapsed ? `Desplegar ${section.label}` : undefined}
        title={isCollapsed ? section.label : undefined}
        className={cn(
          'flex min-h-11 w-full items-center rounded-lg px-3 text-sm font-medium',
          isCollapsed ? 'justify-center' : 'gap-3',
          isActive
            ? 'text-emerald-700 dark:text-emerald-300'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
        )}
      >
        {section.icon}
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{section.label}</span>
            <ChevronIcon className={cn('size-4 transition-transform', isOpen && 'rotate-180')} />
          </>
        )}
      </button>
      {isOpen && (
        <ul id={listId} className="mt-1 flex flex-col gap-1 pl-3">
          {section.items.map((item) => (
            <SidebarItem key={item.to} item={item} />
          ))}
        </ul>
      )}
    </li>
  )
}

function SidebarItem({ item }: { item: NavItem }) {
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          cn(
            'flex min-h-11 items-center gap-3 rounded-lg px-3 text-[0.8125rem] font-medium',
            isActive
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
          )
        }
      >
        {item.icon}
        {item.label}
      </NavLink>
    </li>
  )
}

function TabBar() {
  const { pathname } = useLocation()
  const { items } = sectionForPath(pathname)

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden dark:border-slate-800 dark:bg-slate-900"
    >
      <ul className="flex">
        {items.map((item) => (
          <li key={item.to} className="min-w-0 flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                // min-h-14 keeps the touch target above 44px.
                cn(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 px-0.5 text-[0.625rem]',
                  isActive ? 'font-medium text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400',
                )
              }
            >
              {item.icon}
              {/* Labels must not wrap onto two lines. */}
              <span className="w-full truncate text-center">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function PanelIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  )
}

function ChevronIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  )
}
