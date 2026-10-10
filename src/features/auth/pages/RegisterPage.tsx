import { Link, useNavigate } from 'react-router'
import { AuthForm } from '../components/AuthForm'
import { AuthLayout } from '../components/AuthLayout'
import { useRegister } from '../hooks/useAuthMutations'

export function RegisterPage() {
  const navigate = useNavigate()
  const registration = useRegister()

  return (
    <AuthLayout title="Crear cuenta" footer={<>¿Ya tienes cuenta? <Link className="text-emerald-700 underline" to="/login">Inicia sesión</Link></>}>
      <AuthForm
        mode="register"
        pending={registration.isPending}
        error={registration.error}
        onSubmit={(values) => registration.mutate(values, { onSuccess: () => navigate('/gym', { replace: true }) })}
      />
    </AuthLayout>
  )
}
