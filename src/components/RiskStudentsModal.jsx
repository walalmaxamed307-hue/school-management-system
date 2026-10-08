import { useState } from 'react'
import { CalendarX, Wallet, FileX, Phone } from 'lucide-react'
import { Modal } from '@/components/ui'

const reasonMeta = {
  attendance: { label: 'Attendance', icon: CalendarX },
  fees: { label: 'Lacag', icon: Wallet },
  results: { label: 'Natiijo', icon: FileX },
}

const levelMeta = {
  high: { label: 'Khatar sare', cls: 'bg-danger-50 text-danger-500' },
  medium: { label: 'Khatar dhexe', cls: 'bg-warning-50 text-warning-500' },
}

const filters = [
  { key: 'all', label: 'Dhammaan' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'fees', label: 'Lacag' },
  { key: 'results', label: 'Natiijo' },
]

// data = jawaabta GET /dashboard/risk-students. Liiska waa la filter-gareyn
// karaa nooca sababta (attendance / lacag / natiijo).
function RiskStudentsModal({ open, onClose, data }) {
  const [filter, setFilter] = useState('all')

  const students = data?.students ?? []
  const shown = filter === 'all' ? students : students.filter((s) => s.reasons.some((r) => r.type === filter))
  const t = data?.thresholds

  return (
    <Modal open={open} onClose={onClose} title={`Ardayda khatarta ah (${students.length})`} size="lg">
      {t && (
        <p className="mb-3 text-xs text-ink-muted">
          Xeerarka: attendance &lt; {t.attendanceMinRatePercent}% ({t.attendanceWindowDays} maalmood) · lacag{' '}
          {t.feeMinUnpaidMonths}+ bilood oo aan la bixin · {t.resultMinFailedExams}+ imtixaan oo uu dhacay.
        </p>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.key
                ? 'border-primary-500 bg-primary-50 text-primary-600'
                : 'border-border text-ink-muted hover:text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">
          {students.length === 0 ? 'Arday khatar ah ma jiro — hambalyo!' : 'Arday nooca ku jira ma jiro.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((s) => (
            <li key={s.enrollmentId} className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{s.name}</p>
                  <p className="text-xs text-ink-muted">
                    {s.className}
                    {s.sectionName ? ` · ${s.sectionName}` : ''} · {s.studentCode}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${levelMeta[s.level].cls}`}>
                  {levelMeta[s.level].label}
                </span>
              </div>

              <ul className="mt-2 flex flex-col gap-1">
                {s.reasons.map((r) => {
                  const Icon = reasonMeta[r.type].icon
                  return (
                    <li key={r.type} className="flex items-start gap-2 text-sm text-ink">
                      <Icon size={14} className="mt-0.5 shrink-0 text-ink-muted" />
                      <span>{r.text}</span>
                    </li>
                  )
                })}
              </ul>

              {s.parentPhone && (
                <a
                  href={`tel:${s.parentPhone}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary-600 hover:underline"
                >
                  <Phone size={12} />
                  {s.parentName ? `${s.parentName} — ` : ''}
                  {s.parentPhone}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}

export default RiskStudentsModal
