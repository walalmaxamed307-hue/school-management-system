import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import { api, getToken } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useClasses } from '@/hooks/useClasses'
import { useSubjects } from '@/hooks/useSubjects'
import { useToast } from '@/hooks/useToast'
import { Button, Card } from '@/components/ui'

const EMPTY = { title: '', description: '', classId: '', subjectId: '', sectionId: '', dueDate: '', file: null }

export default function AssignmentsPage() {
  const { user } = useAuth()
  const { classes } = useClasses()
  const { subjectItems } = useSubjects()
  const { showToast } = useToast()
  const [view, setView] = useState('lesson')
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)

  const teaching = useMemo(() => user?.assignments || [], [user?.assignments])
  const classOptions = useMemo(() => user?.role === 'admin' ? classes : classes.filter((item) => teaching.some((assignment) => assignment.classId === item.id)), [classes, teaching, user?.role])
  const subjectOptions = useMemo(() => user?.role === 'admin' ? subjectItems : subjectItems.filter((item) => teaching.some((assignment) => assignment.classId === form.classId && assignment.subjectId === item.id)), [subjectItems, teaching, user?.role, form.classId])
  const klass = classes.find((item) => item.id === form.classId)

  const load = useCallback(async () => {
    try { setItems((await api.get('/assignments')).items || []) }
    catch (err) { showToast(err.message, 'error') }
  }, [showToast])
  useEffect(() => { load() }, [load])
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  function closeForm() {
    setOpen(false)
    setEditingId(null)
    setForm(EMPTY)
  }

  function startEdit(item) {
    setView(item.kind === 'lesson' ? 'lesson' : 'questions')
    setForm({ title: item.title, description: item.description || '', classId: String(item.classId), subjectId: String(item.subjectId), sectionId: item.sectionId ? String(item.sectionId) : '', dueDate: item.dueDate || '', file: null })
    setEditingId(item.id)
    setOpen(true)
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const data = new FormData()
      Object.entries({ ...form, kind: view }).forEach(([key, value]) => { if (value) data.append(key, value) })
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/assignments${editingId ? `/${editingId}` : ''}`, { method: editingId ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: data })
      const saved = await response.json()
      if (!response.ok) throw new Error(saved.error || 'Post-ka lama keydin')
      setItems((current) => editingId ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current])
      showToast(editingId ? 'Post-ka waa la cusboonaysiiyay' : 'Waa la post-gareeyay', 'success')
      closeForm()
    } catch (err) { showToast(err.message, 'error') }
    finally { setBusy(false) }
  }

  async function download(id) {
    try { window.open((await api.get(`/assignments/${id}/download`)).url, '_blank', 'noopener,noreferrer') }
    catch (err) { showToast(err.message, 'error') }
  }
  async function remove(id) {
    if (!window.confirm('Ma tirtiraysaa post-kan?')) return
    try { await api.delete(`/assignments/${id}`); setItems((current) => current.filter((item) => item.id !== id)); showToast('Post-ka waa la tirtiray', 'success') }
    catch (err) { showToast(err.message, 'error') }
  }

  const shown = items.filter((item) => view === 'lesson' ? item.kind === 'lesson' : item.kind !== 'lesson')
  return <div className="space-y-4"><div className="flex items-center justify-between"><div><h1 className="text-xl font-medium text-ink">Lessons & Assignments</h1><p className="text-sm text-ink-muted">File waa ikhtiyaari; qoraal keliya waad post-gareyn kartaa.</p></div><Button onClick={() => open ? closeForm() : setOpen(true)}>{open ? <X size={16} /> : <Plus size={16} />}{open ? 'Xir' : 'Post cusub'}</Button></div><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setView('lesson')} className={`rounded-xl border p-4 text-left ${view === 'lesson' ? 'border-primary-500 bg-primary-50' : 'border-border bg-surface'}`}><b>Casharro</b><p className="text-xs text-ink-muted">Cashar iyo sharaxaad.</p></button><button type="button" onClick={() => setView('questions')} className={`rounded-xl border p-4 text-left ${view === 'questions' ? 'border-primary-500 bg-primary-50' : 'border-border bg-surface'}`}><b>Assignments</b><p className="text-xs text-ink-muted">Su'aalo iyo shaqo-guri.</p></button></div>{open && <Card><form onSubmit={save} className="grid gap-3 md:grid-cols-2"><input required placeholder="Cinwaan" value={form.title} onChange={(event) => set('title', event.target.value)} className="rounded border p-2"/><select required value={form.classId} onChange={(event) => { set('classId', event.target.value); set('subjectId', ''); set('sectionId', '') }} className="rounded border p-2"><option value="">Fasal dooro</option>{classOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select required value={form.subjectId} onChange={(event) => set('subjectId', event.target.value)} className="rounded border p-2"><option value="">Maado dooro</option>{subjectOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{klass?.hasSections && <select value={form.sectionId} onChange={(event) => set('sectionId', event.target.value)} className="rounded border p-2"><option value="">Dhammaan sections</option>{klass.sectionItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}<input type="date" value={form.dueDate} onChange={(event) => set('dueDate', event.target.value)} className="rounded border p-2"/><textarea placeholder="Faahfaahin (ikhtiyaari)" value={form.description} onChange={(event) => set('description', event.target.value)} className="rounded border p-2 md:col-span-2"/><div className="md:col-span-2"><input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg" onChange={(event) => set('file', event.target.files?.[0] || null)} className="cursor-pointer"/>{editingId && <p className="mt-1 text-xs text-ink-muted">Fayl cusub dooro keliya haddii aad rabto inaad beddesho kii hore.</p>}</div><Button type="submit" disabled={busy} className="md:col-span-2"><Upload size={16}/>{busy ? 'Waa la keydinayaa...' : editingId ? 'Update' : 'Post'}</Button></form></Card>}<div className="grid gap-3">{shown.map((item) => <Card key={item.id}><div className="flex justify-between gap-3"><div><b>{item.title}</b><p className="text-sm text-ink-muted">{item.className} · {item.subjectName}{item.fileName ? ` · ${item.fileName}` : ''}</p>{item.description && <p className="text-sm">{item.description}</p>}</div><div className="flex gap-2">{item.fileName && <Button size="sm" onClick={() => download(item.id)} title="Download"><Download size={16}/></Button>}{item.canDelete && <><Button size="sm" variant="secondary" onClick={() => startEdit(item)} title="Update"><Pencil size={16}/></Button><Button size="sm" variant="danger" onClick={() => remove(item.id)} title="Delete"><Trash2 size={16}/></Button></>}</div></div></Card>)}{!shown.length && <Card>Weli wax lama post-gareyn.</Card>}</div></div>
}
