import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button, ErrorMessage, Input } from '@/shared/ui'

const loginSchema = z.object({
  email: z.email('Introduce un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

const registerSchema = z.object({
  email: z.email('Introduce un correo electrónico válido'),
  password: z
    .string()
    .min(8, 'Usa al menos 8 caracteres')
    .max(128, 'Usa como máximo 128 caracteres'),
})

export type AuthFormValues = z.infer<typeof loginSchema>

interface AuthFormProps {
  mode: 'login' | 'register'
  onSubmit: (values: AuthFormValues) => void
  pending: boolean
  error: unknown
}

/** Presentational email/password form shared by login and registration. */
export function AuthForm({ mode, onSubmit, pending, error }: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(mode === 'login' ? loginSchema : registerSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input label="Correo electrónico" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <Input
        label="Contraseña"
        type="password"
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        error={errors.password?.message}
        hint={mode === 'register' ? 'Entre 8 y 128 caracteres.' : undefined}
        {...register('password')}
      />
      <ErrorMessage error={error} />
      <Button type="submit" loading={pending}>
        {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      </Button>
    </form>
  )
}
