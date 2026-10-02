import { useEffect, useMemo, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { Card } from '@/components/ui'

// Ardayga: assignments-ka macalimiintiisu u direen. Fasalka/section-ka
// backend-ku ayaa ka qaadaya enrollment-ka ardayga (token-ka), ardaygu waxba
// ma dirsado. Wuxuu akhriyaa su’aasha, buugiisana uga shaqeeyaa.
function StudentHomeworkPage() {
  const { showToast } = useToast()
  const [items, setItems] = useState(undefined) // undefined = loading
  const [subject, setSubject] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .get('/homework/mine')
      .then((list) => {
        if (!cancelled) setItems(list)
      })
      .catch((err) => {
        if (cancelled) return
        setItems([])
        showToast(err.message, 'error')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const subjects = useMemo(
    () => [...new Set((items ?? []).map((h) => h.subject).filter(Boolean))],
    [items]
  )
  const visible = (items ?? []).filter((h) => !subject || h.subject === subject)

  return (
    <div>
      <h1 className="mb-1 text-xl font-medium text-ink">Assignments</h1>
      <p className="mb-4 text-sm text-ink-muted">
        Akhri su’aasha, buugaadana uga shaqee!
      </p>

      {subjects.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {['', ...subjects].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setSubject(s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                subject === s
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-border bg-surface text-ink'
              }`}
            >
              {s || 'Dhammaan'}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {items === undefined && <Card className="text-ink-muted">Waa la soo rarayaa...</Card>}
        {items && visible.length === 0 && (
          <Card className="text-center text-sm text-ink-muted">Wali assignment lagu siin</Card>
        )}
        {visible.map((h) => (
          <Card key={h.id}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-primary-500 px-2 py-0.5 text-xs text-white">
                <BookOpen size={12} /> {h.subject}
              </span>
              <span className="text-xs text-ink-muted">
                {h.teacher} · {String(h.createdAt).slice(0, 10)}
              </span>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm text-ink">{h.question}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default StudentHomeworkPage
