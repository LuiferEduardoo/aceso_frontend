import { useId, type ComponentProps } from 'react'

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  label: string
}

export function Checkbox({ label, id, ...props }: CheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <label htmlFor={inputId} className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
      <input id={inputId} type="checkbox" className="size-4 accent-emerald-600" {...props} />
      {label}
    </label>
  )
}
