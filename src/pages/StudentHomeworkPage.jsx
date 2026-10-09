import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ClipboardList, Download } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { Card } from '@/components/ui'

// Ardayga: casharrada iyo assignments-ka macalimiintiisu u direen.
// Fasalka/section-ka backend-ku ayaa ka qaadaya enrollment-ka ardayga
// (token-ka), sidaas darteed ardaygu ma diri karo class ama section.
function StudentHomeworkPage() {
  const { showToast } = useToast()
  const [items, setItems] = useState(undefined) // undefined = loading
  const [section, setSection] = useState('lesson')
  const [subject, setSubject] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .get('/my-assignments')
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

  const sectionItems = (items ?? []).filter((item) =>
    section === 'lesson' ? item.kind === 'lesson' : item.kind !== 'lesson'
  )
  const subjects = useMemo(
    () => [...new Set(sectionItems.map((item) => item.subjectName).filter(Boolean))],
    [sectionItems]
  )
  const visible = sectionItems.filter((item) => !subject || item.subjectName === subject)

  function chooseSection(nextSection) {
    setSection(nextSection)
    setSubject('')
  }

  async function download(item) {
    try {
      const { url } = await api.get(`/my-assignments/${item.id}/download`)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-medium text-ink">Casharradayda & Assignments</h1>
      <p className="mb-4 text-sm text-ink-muted">
        Dooro qaybta aad rabto inaad aragto.
      </p>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => chooseSection('lesson')}
          className={`rounded-xl border p-4 text-left transition-colors ${
            section === 'lesson'
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-border bg-surface text-ink'
          }`}
        >
          <BookOpen size={20} className="mb-2" />
          <p className="font-medium">Lessons</p>
          <p className="mt-1 text-xs text-ink-muted">Casharrada uu macallinku soo dhigay.</p>
        </button>
        <button
          type="button"
          onClick={() => chooseSection('assignment')}
          className={`rounded-xl border p-4 text-left transition-colors ${
            section === 'assignment'
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-border bg-surface text-ink'
          }`}
        >
          <ClipboardList size={20} className="mb-2" />
          <p className="font-medium">Assignments</p>
          <p className="mt-1 text-xs text-ink-muted">Shaqo-guriga iyo su’aalaha laguu diray.</p>
        </button>
      </div>

      <h2 className="mb-3 text-lg font-medium text-ink">
        {section === 'lesson' ? 'Lessons' : 'Assignments'}
      </h2>

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
        {visible.map((item) => (
          <Card key={item.id}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-primary-500 px-2 py-0.5 text-xs text-white">
                  <BookOpen size={12} /> {item.subjectName || 'Maado'}
              </span>
              <span className="text-xs text-ink-muted">
                  {item.uploadedBy || 'Macallin'} · {String(item.createdAt).slice(0, 10)}
              </span>
              </div>
              {item.fileName && (
                <button
                  type="button"
                  onClick={() => download(item)}
                  className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  <Download size={16} /> Fur file-ka
                </button>
              )}
            </div>
            <h3 className="mb-1 font-medium text-ink">{item.title}</h3>
            {item.description && (
              <p className="whitespace-pre-wrap break-words text-sm text-ink">{item.description}</p>
            )}
            {item.dueDate && section !== 'lesson' && (
              <p className="mt-2 text-xs text-ink-muted">Taariikhda kama dambaysta ah: {item.dueDate}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

export default StudentHomeworkPage
