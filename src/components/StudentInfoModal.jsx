import { useEffect, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { Modal } from '@/components/ui'
import { useStudents } from '@/hooks/useStudents'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

const feeCategoryLabel = { paid: 'Paid (caadi)', free: 'Free', discount: 'Discount' }

// Akhris-kaliya — halkan lama beddeli karo. Wax-ka-beddelka (Edit) waxaa
// kaliya loo sameeyaa Students page-ka (admin-only).
// `studentId`: waxaa laga soo qaataa xogta BUUXA ee useStudents() — ma aha
// stub uu caller-ku isagu dhisay (taasi waxay sababi jirtay in xogta badan
// ay muuqan waayaan: dob, waalidka, xaaladda, fee).
function StudentInfoModal({ studentId, onClose }) {
  const { students } = useStudents()
  const student = students.find((s) => s.id === studentId) ?? null
  const { user } = useAuth()
  const [absence, setAbsence] = useState(null)
  const [newPin, setNewPin] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    if (!studentId) {
      setAbsence(null)
      return
    }
    let cancelled = false
    api
      .get(`/students/${studentId}/absences`)
      .then((d) => {
        if (!cancelled) setAbsence(d)
      })
      .catch(() => {
        if (!cancelled) setAbsence({ absentDays: '—', lateDays: '—' })
      })
    return () => {
      cancelled = true
    }
  }, [studentId])

  if (!studentId) return null

  async function resetPin(event) {
    event.preventDefault()
    setResetError('')
    setResetSuccess('')
    if (!/^\d{4,6}$/.test(newPin)) return setResetError('PIN-ku waa inuu noqdaa 4 ilaa 6 lambar')
    setResetting(true)
    try {
      await api.post(`/students/${studentId}/reset-pin`, { pin: newPin })
      setNewPin('')
      setResetSuccess('PIN cusub waa la dejiyay. Si ammaan ah ugu sheeg ardayga.')
    } catch (err) {
      setResetError(err.message)
    } finally {
      setResetting(false)
    }
  }

  const rows = [
    ['Student ID', student?.studentCode ?? '...'],
    ['Magaca', student?.name ?? '...'],
    ['Fasalka', student ? `${student.class}${student.section ? ` · ${student.section}` : ''}` : '...'],
    ['Taariikhda dhalashada', student?.dob || '—'],
    ['Magaca waalidka', student?.parentName || '—'],
    ['Telefoonka waalidka', student?.parentPhone || '—'],
    ['Xaalad', student?.status ?? '...'],
    [
      'Lacagta (fee)',
      student
        ? `${feeCategoryLabel[student.feeCategory]}${student.feeCategory === 'discount' ? ` — discount $${student.discountAmount}` : ''}`
        : '...',
    ],
    ['Maalmaha uu maqnaa sanadkan', absence?.absentDays ?? '...'],
    ['Maalmaha uu soo daahay sanadkan', absence?.lateDays ?? '...'],
  ]

  return (
    <Modal open={studentId !== null} onClose={onClose} title="Xogta ardayga (akhris-kaliya)">
      <div className="flex flex-col gap-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-0"
          >
            <span className="shrink-0 text-ink-muted">{label}</span>
            <span className="text-right text-ink">{value}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Wax-ka-beddelka xogtan waxaa kaliya samayn kara admin-ka, boggiisa Students.
      </p>
      {['admin', 'teacher'].includes(user?.role) && student && (
        <form onSubmit={resetPin} className="mt-4 rounded-xl border border-border bg-canvas p-3">
          <p className="flex items-center gap-2 text-sm font-medium text-ink"><KeyRound size={16} className="text-primary-600" /> Reset Student PIN</p>
          <p className="mt-1 text-xs leading-5 text-ink-muted">PIN-kii hore lama arki karo. Halkan geli PIN cusub oo aad ardayga si ammaan ah ugu sheegto.</p>
          <div className="mt-3 flex gap-2"><input value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="4–6 lambar" className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500" /><button type="submit" disabled={resetting} className="rounded-lg bg-primary-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{resetting ? '...' : 'Deji'}</button></div>
          {resetError && <p className="mt-2 text-xs text-danger-500">{resetError}</p>}
          {resetSuccess && <p className="mt-2 text-xs text-primary-600">{resetSuccess}</p>}
        </form>
      )}
    </Modal>
  )
}

export default StudentInfoModal
