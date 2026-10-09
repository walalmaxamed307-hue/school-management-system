import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import { api, getToken } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useClasses } from '@/hooks/useClasses'
import { useSubjects } from '@/hooks/useSubjects'
import { useToast } from '@/hooks/useToast'
import { Button, Card } from '@/components/ui'

const EMPTY = { title: '', description: '', classId: '', subjectId: '', sectionId: '', dueDate: '', file: null }

function AssignmentForm({ form, set, classOptions, subjectOptions, selectedClass, editingId, busy, onSubmit }) {
  const sections = Array.isArray(selectedClass?.sectionItems) ? selectedClass.sectionItems : []
  return (
    <Card className="overflow-hidden p-4 sm:p-5">
      <div className="mb-4"><h2 className="font-medium text-ink">{editingId ? 'Update post-ka' : 'Post cusub'}</h2><p className="mt-1 text-xs text-ink-muted">Buuxi xogta hoose. Faylku waa ikhtiyaari.</p></div>
      <form onSubmit={onSubmit} className="grid min-w-0 gap-3 md:grid-cols-2">
        <input required placeholder="Cinwaan" value={form.title} onChange={(event) => set('title', event.target.value)} className="w-full min-w-0 rounded-lg border border-border bg-canvas p-3 text-base text-ink" />
        <select required value={form.classId} onChange={(event) => { set('classId', event.target.value); set('subjectId', ''); set('sectionId', '') }} className="w-full min-w-0 rounded-lg border border-border bg-canvas p-3 text-base text-ink"><option value="">Fasal dooro</option>{classOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <select required value={form.subjectId} onChange={(event) => set('subjectId', event.target.value)} className="w-full min-w-0 rounded-lg border border-border bg-canvas p-3 text-base text-ink"><option value="">Maado dooro</option>{subjectOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        {selectedClass?.hasSections && <select value={form.sectionId} onChange={(event) => set('sectionId', event.target.value)} className="w-full min-w-0 rounded-lg border border-border bg-canvas p-3 text-base text-ink"><option value="">Dhammaan sections</option>{sections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}
        <input type="date" value={form.dueDate} onChange={(event) => set('dueDate', event.target.value)} className="w-full min-w-0 rounded-lg border border-border bg-canvas p-3 text-base text-ink" />
        <textarea placeholder="Faahfaahin (ikhtiyaari)" value={form.description} onChange={(event) => set('description', event.target.value)} className="min-h-28 w-full min-w-0 rounded-lg border border-border bg-canvas p-3 text-base text-ink md:col-span-2" />
        <div className="min-w-0 md:col-span-2"><label className="block text-sm font-medium text-ink">Fayl ku lifaaq (ikhtiyaari)</label><input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg" onChange={(event) => set('file', event.target.files?.[0] || null)} className="mt-2 block w-full min-w-0 text-sm text-ink" />{editingId && <p className="mt-1 text-xs text-ink-muted">Fayl cusub dooro keliya haddii aad rabto inaad beddesho kii hore.</p>}</div>
        <Button type="submit" disabled={busy} className="min-h-12 w-full md:col-span-2"><Upload size={16}/>{busy ? 'Waa la keydinayaa...' : editingId ? 'Update' : 'Post'}</Button>
      </form>
    </Card>
  )
}

export default function AssignmentsPage() {
  const { user } = useAuth(); const { classes } = useClasses(); const { subjectItems } = useSubjects(); const { showToast } = useToast()
  const [view, setView] = useState('lesson'); const [items, setItems] = useState([]); const [open, setOpen] = useState(false); const [editingId, setEditingId] = useState(null); const [form, setForm] = useState(EMPTY); const [busy, setBusy] = useState(false)
  const safeClasses = useMemo(() => Array.isArray(classes) ? classes : [], [classes]); const safeSubjects = useMemo(() => Array.isArray(subjectItems) ? subjectItems : [], [subjectItems]); const teaching = useMemo(() => Array.isArray(user?.assignments) ? user.assignments : [], [user?.assignments])
  const classOptions = useMemo(() => user?.role === 'admin' ? safeClasses : safeClasses.filter((item) => teaching.some((assignment) => assignment?.classId === item.id)), [safeClasses, teaching, user?.role])
  const subjectOptions = useMemo(() => user?.role === 'admin' ? safeSubjects : safeSubjects.filter((item) => teaching.some((assignment) => assignment?.classId === form.classId && assignment?.subjectId === item.id)), [safeSubjects, teaching, user?.role, form.classId])
  const selectedClass = safeClasses.find((item) => item.id === form.classId)
  const load = useCallback(async () => { try { const result = await api.get('/assignments'); setItems(Array.isArray(result?.items) ? result.items : []) } catch (err) { showToast(err.message, 'error') } }, [showToast])
  useEffect(() => { load() }, [load])
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const closeForm = () => { setOpen(false); setEditingId(null); setForm(EMPTY) }
  function startEdit(item) { setView(item.kind === 'lesson' ? 'lesson' : 'questions'); setForm({ title: item.title || '', description: item.description || '', classId: String(item.classId || ''), subjectId: String(item.subjectId || ''), sectionId: item.sectionId ? String(item.sectionId) : '', dueDate: item.dueDate || '', file: null }); setEditingId(item.id); setOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  async function save(event) { event.preventDefault(); setBusy(true); try { const data = new FormData(); Object.entries({ ...form, kind: view }).forEach(([key, value]) => { if (value) data.append(key, value) }); const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/assignments${editingId ? `/${editingId}` : ''}`, { method: editingId ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: data }); const saved = await response.json(); if (!response.ok) throw new Error(saved.error || 'Post-ka lama keydin'); setItems((current) => editingId ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]); showToast(editingId ? 'Post-ka waa la cusboonaysiiyay' : 'Waa la post-gareeyay', 'success'); closeForm() } catch (err) { showToast(err.message, 'error') } finally { setBusy(false) } }
  async function download(id) { try { window.open((await api.get(`/assignments/${id}/download`)).url, '_blank', 'noopener,noreferrer') } catch (err) { showToast(err.message, 'error') } }
  async function remove(id) { if (!window.confirm('Ma tirtiraysaa post-kan?')) return; try { await api.delete(`/assignments/${id}`); setItems((current) => current.filter((item) => item.id !== id)); showToast('Post-ka waa la tirtiray', 'success') } catch (err) { showToast(err.message, 'error') } }
  const shown = items.filter((item) => view === 'lesson' ? item.kind === 'lesson' : item.kind !== 'lesson')
  return <div className="space-y-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-xl font-medium text-ink">Lessons & Assignments</h1><p className="mt-1 text-sm text-ink-muted">File waa ikhtiyaari; qoraal keliya waad post-gareyn kartaa.</p></div><Button onClick={() => open ? closeForm() : setOpen(true)} className="min-h-11">{open ? <X size={16}/> : <Plus size={16}/>}{open ? 'Xir' : 'Post cusub'}</Button></div><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setView('lesson')} className={`min-h-24 rounded-xl border p-4 text-left ${view === 'lesson' ? 'border-primary-500 bg-primary-50' : 'border-border bg-surface'}`}><b>Casharro</b><p className="mt-1 text-xs text-ink-muted">Cashar iyo sharaxaad.</p></button><button type="button" onClick={() => setView('questions')} className={`min-h-24 rounded-xl border p-4 text-left ${view === 'questions' ? 'border-primary-500 bg-primary-50' : 'border-border bg-surface'}`}><b>Assignments</b><p className="mt-1 text-xs text-ink-muted">Su'aalo iyo shaqo-guri.</p></button></div>{open && <AssignmentForm form={form} set={set} classOptions={classOptions} subjectOptions={subjectOptions} selectedClass={selectedClass} editingId={editingId} busy={busy} onSubmit={save}/>}<div className="grid gap-3">{shown.map((item) => <Card key={item.id}><div className="flex flex-col justify-between gap-3 sm:flex-row"><div className="min-w-0"><b className="break-words">{item.title}</b><p className="break-words text-sm text-ink-muted">{item.className} · {item.subjectName}{item.fileName ? ` · ${item.fileName}` : ''}</p>{item.description && <p className="mt-1 break-words text-sm">{item.description}</p>}</div><div className="flex shrink-0 gap-2">{item.fileName && <Button size="sm" onClick={() => download(item.id)} title="Download"><Download size={16}/></Button>}{item.canDelete && <><Button size="sm" variant="secondary" onClick={() => startEdit(item)} title="Update"><Pencil size={16}/></Button><Button size="sm" variant="danger" onClick={() => remove(item.id)} title="Delete"><Trash2 size={16}/></Button></>}</div></div></Card>)}{!shown.length && <Card>Weli wax lama post-gareyn.</Card>}</div></div>
}
