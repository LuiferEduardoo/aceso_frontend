import { useId, type ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'
import { controlClass, Field } from './Field'

export interface InputProps extends ComponentProps<'input'> {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, id, className, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <Field id={inputId} label={label} error={error} hint={hint}>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(controlClass, className)}
        {...props}
      />
    </Field>
  )
}
