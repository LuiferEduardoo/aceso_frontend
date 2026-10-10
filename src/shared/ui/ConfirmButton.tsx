import { useState } from 'react'
import { Button, type ButtonProps } from './Button'

interface ConfirmButtonProps extends Omit<ButtonProps, 'onClick'> {
  onConfirm: () => void
  confirmLabel?: string
}

/** A button that asks for an inline confirmation before running a destructive action. */
export function ConfirmButton({
  onConfirm,
  confirmLabel = 'Confirmar',
  children,
  variant = 'danger',
  size = 'sm',
  ...props
}: ConfirmButtonProps) {
  const [asking, setAsking] = useState(false)

  if (!asking) {
    return (
      <Button variant={variant} size={size} onClick={() => setAsking(true)} {...props}>
        {children}
      </Button>
    )
  }

  return (
    <span className="inline-flex items-center gap-1">
      <Button
        variant="danger"
        size={size}
        onClick={() => {
          setAsking(false)
          onConfirm()
        }}
      >
        {confirmLabel}
      </Button>
      <Button variant="ghost" size={size} onClick={() => setAsking(false)}>
        Cancelar
      </Button>
    </span>
  )
}
