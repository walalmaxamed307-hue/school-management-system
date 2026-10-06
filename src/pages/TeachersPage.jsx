import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, Settings2 } from 'lucide-react'
import { useTeachers } from '@/hooks/useTeachers'
import { useClasses } from '@/hooks/useClasses'
import { useSubjects } from '@/hooks/useSubjects'
import { useTeacherAttendance } from '@/hooks/useTeacherAttendance'
import { useSearch } from '@/hooks/useSearch'
import { Button, Modal } from '@/components/ui'
import TeacherForm from '@/features/teachers/TeacherForm'
import ManageSubjectsModal from '@/features/subjects/ManageSubjectsModal'

function today() {
  return new Date().toISOString().slice(0, 10)
}

const statusStyle = {
  present: 'bg-primary-50 text-primary-600',
  absent: 'bg-danger-50 text-danger-500',
  late: 'bg-warning-50 text-warning-500',
  excused: 'bg-canvas text-ink-muted',
}

// [status, xarafka badhanka, magaca buuxa, hover style]
const ATTENDANCE_BUTTONS = [
  ['present', 'P', 'Present', 'hover:bg-primary-50 hover:text-primary-600'],
  ['late', 'L', 'Late', 'hover:bg-warning-50 hover:text-warning-500'],
  ['excused', 'E', 'Excused', 'hover:bg-canvas'],
  ['absent', 'A', 'Absent', 'hover:bg-danger-50 hover:text-danger-500'],
]

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function homeroomLabel(t) {
  if (!t.class) return null
  return t.section ? `${t.class} · ${t.section}` : t.class
}

// "Xisaab · Fasalka 5 A"
function assignmentLabel(a) {
  return `${a.subject} · ${a.class}${a.section ? ` ${a.section}` : ''}`
}

function AttendanceButtons({ teacherId }) {
  const { getStatus, mark } = useTeacherAttendance()
  const current = getStatus(teacherId)
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-border">
      {ATTENDANCE_BUTTONS.map(([status, letter, label, hover]) => (
        <button
          key={status}
          type="button"
          title={label}
          onClick={() => mark(teacherId, status)}
          className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
            current === status ? statusStyle[status] : `text-ink-muted ${hover}`
          } border-r border-border last:border-r-0`}
        >
          {letter}
        </button>
      ))}
    </div>
  )
}

function FeeManagerBadge() {
  return (
    <span className="mt-0.5 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600">
      Fee manager
    </span>
  )
}

function SubjectChips({ assignments, max = 3 }) {
  if (assignments.length === 0) return <span className="text-ink-muted">—</span>
  const shown = assignments.slice(0, max)
  const extra = assignments.length - shown.length
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((a, i) => (
        <span
          key={i}
          className="whitespace-nowrap rounded-full bg-canvas px-2 py-0.5 text-xs text-ink"
          title={assignmentLabel(a)}
        >
          {assignmentLabel(a)}
        </span>
      ))}
      {extra > 0 && (
        <span
          className="rounded-full bg-canvas px-2 py-0.5 text-xs text-ink-muted"
          title={assignments.slice(max).map(assignmentLabel).join('\n')}
        >
          +{extra}
        </span>
      )}
    </div>
  )
}

function TeachersPage() {
  const { teachers, loading, addTeacher, updateTeacher, deleteTeacher } = useTeachers()
  const { classes } = useClasses()
  const { subjects, subjectItems, addSubject, updateSubject, removeSubject } = useSubjects()
  const { loadTeacherAttendance, getMonthlyAbsenceCount } = useTeacherAttendance()
  const { query } = useSearch()
  const q = query.toLowerCase()
  const filteredTeachers = teachers.filter(
    (t) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
  )
  const [date, setDate] = useState(today())
  useEffect(() => {
    loadTeacherAttendance(date)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])
  const [modalMode, setModalMode] = useState(null)
  const [activeTeacher, setActiveTeacher] = useState(null)
  const [subjectsModalOpen, setSubjectsModalOpen] = useState(false)

  function openAdd() {
    setActiveTeacher(null)
    setModalMode('add')
  }

  function openEdit(teacher) {
    setActiveTeacher(teacher)
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
    setActiveTeacher(null)
  }

  async function handleSubmit(data) {
    const ok =
      modalMode === 'edit' ? await updateTeacher(activeTeacher.id, data) : await addTeacher(data)
    if (ok) closeModal()
  }

  function handleDelete(teacher) {
    if (
      confirm(
        `Ma hubtaa inaad ka saarto ${teacher.name}? Login-kiisa waa la joojinayaa; taariikhdiisa (attendance, natiijooyin) way sii jirtaa.`
      )
    ) {
      deleteTeacher(teacher.id)
    }
  }

  const actionButtons = (row) => (
    <div className="flex gap-1">
      <button
        onClick={() => openEdit(row)}
        className="rounded-md p-1.5 text-ink-muted hover:bg-canvas hover:text-primary-600"
        aria-label="Wax ka beddel"
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={() => handleDelete(row)}
        className="rounded-md p-1.5 text-ink-muted hover:bg-canvas hover:text-danger-500"
        aria-label="Ka saar"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )

  const absences = (row) => getMonthlyAbsenceCount(row.id)

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-medium text-ink">Teachers</h1>
          <p className="text-xs text-ink-muted">Macallimiinta guud: {teachers.length}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
          />
          <Button variant="secondary" size="sm" onClick={() => setSubjectsModalOpen(true)}>
            <Settings2 size={16} />
            Maamul maadooyinka
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus size={16} />
            Ku dar macalin
          </Button>
        </div>
      </div>

      {/* Desktop/tablet: table nadiif ah, 6 column — magaca + email hal column */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-border bg-canvas text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 font-medium">Macalin</th>
              <th className="px-4 py-3 font-medium">Horjoogaha</th>
              <th className="px-4 py-3 font-medium">Maadooyinka</th>
              <th className="px-4 py-3 text-center font-medium">Maqnaansho (bishan)</th>
              <th className="px-4 py-3 font-medium">Attendance</th>
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-muted">
                  {loading ? 'Waa la soo rarayaa...' : 'Macalin lama helin'}
                </td>
              </tr>
            ) : (
              filteredTeachers.map((row) => (
                <tr key={row.id} className="border-b border-border align-middle last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-medium text-primary-600">
                        {initials(row.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{row.name}</p>
                        <p className="truncate text-xs text-ink-muted">{row.email}</p>
                        {row.isFeeManager && <FeeManagerBadge />}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {homeroomLabel(row) ? (
                      <span className="whitespace-nowrap rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600">
                        {homeroomLabel(row)}
                      </span>
                    ) : (
                      <span className="text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    <SubjectChips assignments={row.assignments} />
                  </td>
                  <td className="px-4 py-3 text-center text-ink">{absences(row)}</td>
                  <td className="px-4 py-3">
                    <AttendanceButtons teacherId={row.id} />
                  </td>
                  <td className="px-4 py-3">{actionButtons(row)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: hal card = hal macalin */}
      <div className="flex flex-col gap-2 md:hidden">
        {filteredTeachers.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface px-4 py-8 text-center text-sm text-ink-muted">
            {loading ? 'Waa la soo rarayaa...' : 'Macalin lama helin'}
          </div>
        ) : (
          filteredTeachers.map((row) => (
            <div key={row.id} className="rounded-xl border border-border bg-surface p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-medium text-primary-600">
                    {initials(row.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{row.name}</p>
                    <p className="truncate text-xs text-ink-muted">{row.email}</p>
                    {row.isFeeManager && <FeeManagerBadge />}
                  </div>
                </div>
                {actionButtons(row)}
              </div>
              <div className="mt-2 flex flex-col gap-2 text-xs">
                {homeroomLabel(row) && (
                  <p className="text-ink-muted">
                    Horjoogaha: <span className="text-ink">{homeroomLabel(row)}</span>
                  </p>
                )}
                <SubjectChips assignments={row.assignments} max={4} />
                <div className="flex items-center justify-between gap-2">
                  <AttendanceButtons teacherId={row.id} />
                  <span className="text-ink-muted">Maqnaansho: {absences(row)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={modalMode !== null}
        onClose={closeModal}
        size="lg"
        title={modalMode === 'edit' ? 'Wax ka beddel macalinka' : 'Ku dar macalin cusub'}
      >
        <TeacherForm
          defaultValues={activeTeacher}
          classes={classes}
          subjects={subjectItems}
          teachers={teachers}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>

      <ManageSubjectsModal
        open={subjectsModalOpen}
        onClose={() => setSubjectsModalOpen(false)}
        subjects={subjects}
        onAdd={addSubject}
        onUpdate={updateSubject}
        onRemove={removeSubject}
      />
    </div>
  )
}

export default TeachersPage
