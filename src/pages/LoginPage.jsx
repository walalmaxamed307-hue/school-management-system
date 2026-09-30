import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getHomeRoute } from '@/lib/routes'
import WhatsAppButton from '@/components/WhatsAppButton'
import ThemeToggle from '@/components/ThemeToggle'
import { Button, Input, Card } from '@/components/ui'

function StaffLoginForm() {
  const [authError, setAuthError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  async function onSubmit(values) {
    setAuthError('')
    const result = await login(values.email, values.password)
    if (result.success) {
      navigate('/')
      return
    }
    setAuthError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        placeholder="admin@iskuul.so"
        error={errors.email?.message}
        {...register('email', { required: 'Email waa loo baahan yahay' })}
      />
      <Input
        label="Password"
        type="password"
        error={errors.password?.message}
        {...register('password', { required: 'Password waa loo baahan yahay' })}
      />
      {authError && <p className="text-sm text-danger-500">{authError}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Waa la galayaa...' : 'Gal'}
      </Button>
    </form>
  )
}

function StudentLoginForm() {
  const [authError, setAuthError] = useState('')
  const { loginAsStudent } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  async function onSubmit(values) {
    setAuthError('')
    const result = await loginAsStudent(values.studentId, values.dob)
    if (result.success) {
      navigate('/my-results')
      return
    }
    setAuthError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Student ID"
        placeholder="STU-000123"
        error={errors.studentId?.message}
        {...register('studentId', { required: 'Student ID waa loo baahan yahay' })}
      />
      <Input
        label="Taariikhda dhalashada"
        type="date"
        error={errors.dob?.message}
        {...register('dob', { required: 'Taariikhda dhalashada waa loo baahan yahay' })}
      />
      {authError && <p className="text-sm text-danger-500">{authError}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Waa la galayaa...' : 'Gal'}
      </Button>
    </form>
  )
}

function LoginPage() {
  const [tab, setTab] = useState('staff')
  const { user } = useAuth()

  // Login kadib providers-ka waa la dib-u-furaa (go'doomin iskuul kasta),
  // sidaas darteed halkan ayaa user-ka loo gudbiyaa gurigiisa.
  if (user) return <Navigate to={getHomeRoute(user.role)} replace />

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-10">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white sm:h-10 sm:w-10">
              <GraduationCap size={22} />
            </div>
            <span className="text-base font-medium text-ink sm:text-sm">
              Maamulka Iskuulka
            </span>
          </div>
          <ThemeToggle />
        </div>

        <p className="mb-4 rounded-lg bg-canvas px-3 py-2 text-xs text-ink-muted">
          Haddii uusan akoon ku lahayn iskuulkaaga, systemka ma geli kartid. Nagala soo xariir
          chatka hoose si aan akoon iskuulkaaga u sameyno.
        </p>

        <div className="mb-6 flex rounded-lg border border-border p-1">
          <button
            onClick={() => setTab('staff')}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors sm:py-1.5 ${
              tab === 'staff' ? 'bg-primary-50 text-primary-600' : 'text-ink-muted'
            }`}
          >
            Admin / Macalin
          </button>
          <button
            onClick={() => setTab('student')}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors sm:py-1.5 ${
              tab === 'student' ? 'bg-primary-50 text-primary-600' : 'text-ink-muted'
            }`}
          >
            Arday
          </button>
        </div>

        {tab === 'staff' ? <StaffLoginForm /> : <StudentLoginForm />}
      </Card>
      <p className="mt-6 text-center text-xs text-ink-muted">
        Owner / Mohamed Ahmed Ali / Fullstack Developer
      </p>
      <WhatsAppButton />
    </div>
  )
}

export default LoginPage
