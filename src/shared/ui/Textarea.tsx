import { useId, type ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'
import { controlClass, Field } from './Field'

export interface TextareaProps extends ComponentProps<'textarea'> {
  label: string
  error?: string
}

export function Textarea({ label, error, id, className, rows = 3, ...props }: TextareaProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <Field id={inputId} label={label} error={error}>
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cn(controlClass, className)}
        {...props}
      />
    </Field>
  )
}
