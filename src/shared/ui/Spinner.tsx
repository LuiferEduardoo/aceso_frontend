export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 py-6 text-sm text-slate-500">
      <span className="size-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      {label}
    </div>
  )
}
