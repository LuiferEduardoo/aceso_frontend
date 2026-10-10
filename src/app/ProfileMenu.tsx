import { useEffect, useId, useRef, useState } from 'react'
import { useAuth } from '@/features/auth'

/** Avatar button with a dropdown holding the user email and sign-out. */
export function ProfileMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const initial = user?.email.charAt(0).toUpperCase()

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeWithEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeWithEscape)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Abrir menú de perfil"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {initial ?? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-6"
          >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20a7 7 0 0 1 14 0" />
          </svg>
        )}
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute top-[calc(100%+0.5rem)] right-0 z-40 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {user?.email && (
            <div className="border-b border-slate-200 px-3 py-2.5 dark:border-slate-700">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{user.email}</p>
            </div>
          )}
          <div className="mt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                signOut()
              }}
              className="flex min-h-11 w-full items-center rounded-md px-3 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
