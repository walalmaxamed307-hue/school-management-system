import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui'
import { useStudents } from '@/hooks/useStudents'
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
  const [absence, setAbsence] = useState(null)

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
    </Modal>
  )
}

export default StudentInfoModal
