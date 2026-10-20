import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { KeyRound, LockKeyhole } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui'

function StudentPinSetupPage() {
  const { user, setStudentPin, logout } = useAuth()
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!user || user.role !== 'student') return <Navigate to="/login" replace />
  if (!user.needsPinSetup) return <Navigate to="/my-results" replace />

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    const result = await setStudentPin(pin, confirmPin)
    setBusy(false)
    if (!result.success) return setError(result.error)
    navigate('/my-results', { replace: true })
  }

  return <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-8"><section className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-xl sm:p-8"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600"><LockKeyhole size={22} /></span><h1 className="mt-5 text-2xl font-semibold text-ink">Samee PIN-kaaga</h1><p className="mt-2 text-sm leading-6 text-ink-muted">Ku soo dhawoow, {user.name}. PIN-kan ayaad mar kasta ku raacinaysaa Student ID-gaaga marka aad soo galayso.</p><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-medium text-ink">PIN cusub (4–6 lambar)<div className="mt-1.5 flex items-center rounded-xl border border-border px-3"><KeyRound size={17} className="mr-2 text-primary-600" /><input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="new-password" className="min-h-12 w-full bg-transparent text-ink outline-none" /></div></label><label className="block text-sm font-medium text-ink">Ku celi PIN-ka<div className="mt-1.5 flex items-center rounded-xl border border-border px-3"><KeyRound size={17} className="mr-2 text-primary-600" /><input value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="new-password" className="min-h-12 w-full bg-transparent text-ink outline-none" /></div></label>{error && <p className="rounded-xl bg-danger-50 px-3 py-2 text-sm text-danger-500">{error}</p>}<Button type="submit" className="min-h-12 w-full rounded-xl" disabled={busy || pin.length < 4 || confirmPin.length < 4}>{busy ? 'Waa la keydinayaa...' : 'Keydi PIN-ka'}</Button></form><button type="button" onClick={() => { logout(); navigate('/login') }} className="mt-4 w-full text-sm text-ink-muted hover:text-ink">Ka noqo login-ka</button></section></main>
}

export default StudentPinSetupPage
