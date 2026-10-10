import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

const CLOSE_ANIMATION_MS = 180

/**
 * Native `<dialog>`: bottom sheet on mobile, centered modal from `sm:`.
 * The browser provides focus trapping, Escape handling and an inert backdrop.
 * Children stay mounted until the close animation ends, then unmount so forms reset.
 */
export function Modal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [rendered, setRendered] = useState(open)
  const [closing, setClosing] = useState(false)

  if (open && !rendered) setRendered(true)
  if (open && closing) setClosing(false)
  if (!open && rendered && !closing) setClosing(true)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
      return
    }
    if (!dialog.open) return
    const timer = window.setTimeout(() => {
      dialog.close()
      setClosing(false)
      setRendered(false)
    }, CLOSE_ANIMATION_MS)
    return () => window.clearTimeout(timer)
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      data-closing={closing || undefined}
      // Escape fires `cancel`; let the parent drive state so the close animation runs.
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="modal m-0 mt-auto max-h-[90dvh] w-full max-w-none rounded-t-2xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-[2px] sm:m-auto sm:max-w-lg sm:rounded-2xl dark:bg-slate-900 dark:text-slate-100"
    >
      {rendered && (
        <div className="flex max-h-[90dvh] flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
            <h2 className="text-base font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="-mr-2 flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                className="size-5"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {children}
          </div>
        </div>
      )}
    </dialog>
  )
}
