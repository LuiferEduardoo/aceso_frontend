import { useId, type ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'
import { controlClass, Field } from './Field'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends ComponentProps<'select'> {
  label: string
  options: readonly SelectOption[]
  error?: string
  placeholder?: string
}

export function Select({ label, options, error, placeholder, id, className, ...props }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  return (
    <Field id={selectId} label={label} error={error}>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={cn(controlClass, className)}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
