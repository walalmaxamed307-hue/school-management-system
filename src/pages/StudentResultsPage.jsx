import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, Printer } from 'lucide-react'
import { useSchoolSettings } from '@/hooks/useSchoolSettings'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { Card, Button } from '@/components/ui'

// Ardaygu wuxuu arki karaa kaliya exam-yada la publish gareeyay ee sanadka
// HADDA socda (isla xeerka backend-ku, GET /my-results).
function StudentResultsPage() {
  const { settings } = useSchoolSettings()
  const { showToast } = useToast()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [examId, setExamId] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .get('/my-results')
      .then((list) => {
        if (cancelled) return
        setResults(list)
        setExamId((prev) => prev || list[0]?.examId || '')
      })
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const current = results.find((r) => r.examId === examId)

  const picker = (
    <select
      value={examId}
      onChange={(e) => setExamId(e.target.value)}
      className="no-print rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
    >
      {results.map((r) => (
        <option key={r.examId} value={r.examId}>
          {r.examName}
        </option>
      ))}
    </select>
  )

  if (loading) {
    return (
      <div>
        <h1 className="mb-4 text-xl font-medium text-ink">Natiijadayda</h1>
        <p className="text-sm text-ink-muted">Waa la soo rarayaa...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div>
        <h1 className="mb-4 text-xl font-medium text-ink">Natiijadayda</h1>
        <Card className="flex items-center gap-2 text-ink-muted">
          <Clock size={18} />
          Wali term (exam) lama darin sanadkan.
        </Card>
      </div>
    )
  }

  if (!current || !current.published) {
    return (
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-medium text-ink">Natiijadayda</h1>
          <div className="flex flex-wrap gap-2">{picker}</div>
        </div>
        <Card className="flex items-center gap-2 text-ink-muted">
          <Clock size={18} />
          {current?.examName} weli lama daabicin (published). Sug macalinka fasalkaaga.
        </Card>
      </div>
    )
  }

  const subjectRows = Object.entries(current.marks)

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-medium text-ink">Natiijadayda</h1>
        <div className="flex flex-wrap gap-2">
          {picker}
          <Button variant="secondary" size="sm" onClick={() => window.print()} className="no-print">
            <Printer size={16} />
            Print
          </Button>
        </div>
      </div>

      <div className="print-area">
        <div className="mb-4 hidden print:block">
          <p className="text-lg font-medium">{settings.name}</p>
          <p className="text-sm text-ink-muted">Report Card — {current.examName}</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <Card>
            <p className="text-xs text-ink-muted">Total</p>
            <p className="text-lg font-medium text-ink">{current.total}</p>
          </Card>
          <Card>
            <p className="text-xs text-ink-muted">Average</p>
            <p className="text-lg font-medium text-ink">{current.average.toFixed(1)}</p>
          </Card>
          <Card>
            <p className="text-xs text-ink-muted">Kaalinta fasalka</p>
            <p className="text-lg font-medium text-ink">
              #{current.rank} / {current.classSize}
            </p>
          </Card>
          {current.isFinal && (
            <Card>
              <p className="text-xs text-ink-muted">Xaalad</p>
              <p className={`text-lg font-medium ${current.total >= current.passMark ? 'text-primary-600' : 'text-danger-500'}`}>
                {current.total >= current.passMark ? 'Gudbay' : 'Dhacay'}
              </p>
            </Card>
          )}
        </div>

        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas text-left">
                <th className="px-4 py-3 font-medium text-ink-muted">Maadada</th>
                <th className="px-4 py-3 font-medium text-ink-muted">Dhibco</th>
              </tr>
            </thead>
            <tbody>
              {subjectRows.map(([subject, mark]) => (
                <tr key={subject} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-ink">{subject}</td>
                  <td className="px-4 py-2 text-ink">
                    {mark}/{current.maxMark}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <p className="mt-4 flex items-center gap-1 text-xs text-primary-600">
          <CheckCircle2 size={14} /> {current.examName} waa mid la daabacay (published)
        </p>
      </div>
    </div>
  )
}

export default StudentResultsPage
