import { Link, useLocation, useNavigate } from 'react-router'
import { AuthForm } from '../components/AuthForm'
import { AuthLayout } from '../components/AuthLayout'
import { useLogin } from '../hooks/useAuthMutations'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/gym'
  const login = useLogin()

  return (
    <AuthLayout title="Iniciar sesión" footer={<>¿Aún no tienes cuenta? <Link className="text-emerald-700 underline" to="/register">Crea una</Link></>}>
      <AuthForm
        mode="login"
        pending={login.isPending}
        error={login.error}
        onSubmit={(values) => login.mutate(values, { onSuccess: () => navigate(from, { replace: true }) })}
      />
    </AuthLayout>
  )
}
