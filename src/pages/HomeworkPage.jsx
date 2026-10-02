import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useClasses } from '@/hooks/useClasses'
import { useToast } from '@/hooks/useToast'
import { Card, Button } from '@/components/ui'

const selectClass =
  'rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500 disabled:opacity-60'

const EMPTY_FORM = { classId: '', subjectId: '', sectionId: '', question: '' }

// Macalinka: qor assignment (su'aal) fasalkiisa iyo maadadiisa. Doorashooyinka
// (fasal / maado / section) waxay ka yimaadaan xilsaarkiisa (user.assignments,
// laga helo /auth/me), sidaas darteed ma dooran karo wax aan loo xilsaarin —
// backend-kuna wuu mar kale hubiyaa.
function HomeworkPage() {
  const { user } = useAuth()
  const { classes } = useClasses()
  const { showToast } = useToast()

  const assignments = useMemo(() => user?.assignments ?? [], [user])

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .get('/homework')
      .then((list) => {
        if (!cancelled) setItems(list)
      })
      .catch((err) => {
        if (!cancelled) showToast(err.message, 'error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fasallada macalinku dhigo (unique).
  const classOptions = useMemo(() => {
    const seen = new Map()
    assignments.forEach((a) => {
      if (a.classId && !seen.has(a.classId)) seen.set(a.classId, a.class)
    })
    return [...seen].map(([id, name]) => ({ id, name }))
  }, [assignments])

  // Maadooyinka uu fasalkaas ku dhigo.
  const subjectOptions = useMemo(() => {
    const seen = new Map()
    assignments
      .filter((a) => a.classId === form.classId)
      .forEach((a) => {
        if (a.subjectId && !seen.has(a.subjectId)) seen.set(a.subjectId, a.subject)
      })
    return [...seen].map(([id, name]) => ({ id, name }))
  }, [assignments, form.classId])

  // Sections-ka la doran karo: haddii xilsaarku yahay fasalka oo dhan, dhammaan
  // sections-ka fasalka; haddii kale kuwa gaarka ah oo kaliya.
  const sectionInfo = useMemo(() => {
    const rows = assignments.filter(
      (a) => a.classId === form.classId && a.subjectId === form.subjectId
    )
    const klass = classes.find((c) => c.id === form.classId)
    if (!klass?.hasSections || rows.length === 0) return { show: false, options: [] }
    const wholeClass = rows.some((r) => !r.sectionId)
    const options = wholeClass
      ? klass.sectionItems
      : rows.map((r) => ({ id: r.sectionId, name: r.section })).filter((s) => s.id)
    return { show: true, wholeClass, options }
  }, [assignments, classes, form.classId, form.subjectId])

  function setField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'classId') {
        next.subjectId = ''
        next.sectionId = ''
      }
      if (field === 'subjectId') next.sectionId = ''
      return next
    })
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFormError('')
  }

  function startEdit(item) {
    setEditingId(item.id)
    setForm({
      classId: item.classId ?? '',
      subjectId: item.subjectId ?? '',
      sectionId: item.sectionId ?? '',
      question: item.question,
    })
    setFormError('')
    window.scrollTo?.({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.classId || !form.subjectId || !form.question.trim()) {
      setFormError('Dooro fasalka, maadada, oo qor su’aasha ka hor intaanad dirin')
      return
    }
    if (sectionInfo.show && !sectionInfo.wholeClass && !form.sectionId) {
      setFormError('Dooro section-ka')
      return
    }
    setSaving(true)
    setFormError('')
    const body = {
      classId: form.classId,
      subjectId: form.subjectId,
      sectionId: form.sectionId || null,
      question: form.question.trim(),
    }
    try {
      if (editingId) {
        const saved = await api.put(`/homework/${editingId}`, body)
        setItems((prev) => prev.map((i) => (i.id === editingId ? saved : i)))
        showToast('Assignment-ka waa la cusboonaysiiyay', 'success')
      } else {
        const saved = await api.post('/homework', body)
        setItems((prev) => [saved, ...prev])
        showToast('Assignment-ka waa la diray', 'success')
      }
      resetForm()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item) {
    if (!window.confirm('Ma hubtaa inaad tirtirto assignment-kan?')) return
    try {
      await api.delete(`/homework/${item.id}`)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      if (editingId === item.id) resetForm()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-medium text-ink">Assignments (Shaqo-guri)</h1>

      {assignments.length === 0 ? (
        <Card className="text-sm text-ink-muted">
          Wali lama xilsaarin fasal iyo maado. Weydii admin-ka inuu ku daro xilsaarkaaga (Teachers).
        </Card>
      ) : (
        <Card className="mb-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <select
                value={form.classId}
                onChange={(e) => setField('classId', e.target.value)}
                className={`${selectClass} flex-1 sm:flex-none`}
              >
                <option value="">-- Dooro fasal --</option>
                {classOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={form.subjectId}
                onChange={(e) => setField('subjectId', e.target.value)}
                disabled={!form.classId}
                className={`${selectClass} flex-1 sm:flex-none`}
              >
                <option value="">-- Dooro maado --</option>
                {subjectOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {sectionInfo.show && (
                <select
                  value={form.sectionId}
                  onChange={(e) => setField('sectionId', e.target.value)}
                  className={`${selectClass} flex-1 sm:flex-none`}
                >
                  {sectionInfo.wholeClass ? (
                    <option value="">Fasalka oo dhan</option>
                  ) : (
                    <option value="">-- Dooro section --</option>
                  )}
                  {sectionInfo.options.map((s) => (
                    <option key={s.id} value={s.id}>
                      Section {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <textarea
              placeholder="Qor su’aasha / shaqada ardayga..."
              value={form.question}
              onChange={(e) => setField('question', e.target.value)}
              rows={5}
              maxLength={4000}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
            />
            <p className="text-xs text-ink-muted">
              Ardaygu wuxuu arkaa su’aashan bogiisa, wuxuuna buugiisa uga shaqeysanayaa.
              ({form.question.length}/4000)
            </p>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saving}>
                {editingId ? <Save size={16} /> : <Plus size={16} />}
                {saving ? 'Waa la keydinayaa...' : editingId ? 'Keydi isbeddelka' : 'Dir assignment'}
              </Button>
              {editingId && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  <X size={16} /> Jooji
                </Button>
              )}
            </div>
            {formError && <p className="text-sm text-danger-500">{formError}</p>}
          </form>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {items.length === 0 && (
          <Card className="text-center text-sm text-ink-muted">
            {loading ? 'Waa la soo rarayaa...' : 'Wali assignment lama dirin'}
          </Card>
        )}
        {items.map((h) => (
          <Card key={h.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs text-white">
                  {h.subject}
                </span>
                <span className="text-sm font-medium text-ink">
                  {h.class}
                  {h.section ? ` — Section ${h.section}` : ' — dhammaan sections-ka'}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm text-ink">{h.question}</p>
              <p className="mt-2 text-xs text-ink-muted">{String(h.createdAt).slice(0, 10)}</p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                onClick={() => startEdit(h)}
                className="text-ink-muted hover:text-primary-600"
                aria-label="Wax ka beddel"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(h)}
                className="text-ink-muted hover:text-danger-500"
                aria-label="Tirtir"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default HomeworkPage
