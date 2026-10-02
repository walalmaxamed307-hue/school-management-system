import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import { useClasses } from '@/hooks/useClasses'
import { useAttendance } from '@/hooks/useAttendance'
import { useAuth } from '@/hooks/useAuth'
import { useSearch } from '@/hooks/useSearch'
import { SESSIONS } from '@/data/sessions'
import StudentInfoModal from '@/components/StudentInfoModal'
import { Card, Table, Button } from '@/components/ui'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function yesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

const statusStyle = {
  present: 'bg-primary-50 text-primary-600',
  absent: 'bg-danger-50 text-danger-500',
  late: 'bg-warning-50 text-warning-500',
  excused: 'bg-canvas text-ink-muted',
}

const statusLabel = { present: 'Present', absent: 'Absent', late: 'Late', excused: 'Excused' }

function AttendancePage() {
  const { classes } = useClasses()
 const { rows, loading, loadAttendance, getStatus, getPreviousDayStatus, mark, markAllPresent } = useAttendance()
  const { user } = useAuth()
  const { query } = useSearch()
  const isTeacher = user?.role === 'teacher'
  // Macalinku fasalkiisa (iyo sectionkiisa, haddii uu leeyahay) kaliya
  // ayuu attendance u qaadi karaa — dropdown-yadu way xayiran yihiin
  // isaga, admin-ku dhammaan fasallada/sections-ka wuu dooran karaa.
  const [date, setDate] = useState(today())
  const [session, setSession] = useState(SESSIONS[0])
  const [selectedClass, setSelectedClass] = useState(
    isTeacher && user.class ? user.class : (classes[0]?.name ?? '')
  )
  const selectedClassObj = classes.find((c) => c.name === selectedClass)
  const [selectedSection, setSelectedSection] = useState(
    isTeacher && user.section ? user.section : ''
  )
  const selectedSectionId = selectedClassObj?.sectionItems.find((s) => s.name === selectedSection)?.id ?? null
  const [infoStudent, setInfoStudent] = useState(null)

  // Fasallada waxay ka imaanayaan backend-ka si aan degdeg ahayn (async) —
  // marka aan la sugi karin qiimihii koowaad ee useState. Haddii
  // selectedClass uusan (weli) ku jirin liiska (list-ku ma soo bixin ama
  // fasalka la magac-bedelay), waxaa loo beddelaa fasalka koowaad — si
  // aan admin-ku u baahnayn inuu tab ka baxo oo ku soo noqdo si "arday
  // kuma jiro fasalkan" loo saxo.
  useEffect(() => {
    if (isTeacher && user.class) return
    if (classes.length === 0) return
    if (!classes.some((c) => c.name === selectedClass)) {
      setSelectedClass(classes[0].name)
      setSelectedSection('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes])

  function handleClassChange(name) {
    setSelectedClass(name)
    setSelectedSection('')
  }

  const sectionOk = !selectedClassObj?.hasSections || !!selectedSection

  // Marka fasal/section/taariikh/session la beddelo, xogta cusub backend-ka
  // ayaa laga soo qaadaa (ma aha kaydka guud ee browser-ka).
  useEffect(() => {
    if (selectedClassObj && sectionOk) {
      loadAttendance(selectedClassObj.id, selectedSectionId, date, session)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassObj?.id, selectedSectionId, date, session, sectionOk])

  const filteredRows = rows.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
  // Kuwii shalay (ama maalintii ka horreysay taariikhda la eegayo) maqnaa
  // horta ayaa loo geynayaa — si sahal loogu ogaado marka la xaadirinayo.
  const sortedRows = [...filteredRows].sort((a, b) => {
    const aWasAbsent = a.previousDayStatus === 'absent' ? 0 : 1
    const bWasAbsent = b.previousDayStatus === 'absent' ? 0 : 1
    return aWasAbsent - bWasAbsent
  })
const unmarkedCount = rows.filter((r) => !r.status).length

function handleAllPresent() {
  if (!confirm(`${unmarkedCount} arday oo aan weli la calaamadin present ma ka dhigaa? Kuwa hore loo calaamadiyay lama beddelayo.`)) return
  markAllPresent()
}
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-medium text-ink">Attendance</h1>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            disabled={isTeacher && !!user.class}
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500 disabled:opacity-60 sm:flex-none"
          >
            {classes.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {selectedClassObj?.hasSections && (
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={isTeacher && !!user.section}
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500 disabled:opacity-60 sm:flex-none"
            >
              <option value="">-- Dooro Section --</option>
              {selectedClassObj.sections.map((s) => (
                <option key={s} value={s}>
                  Section {s}
                </option>
              ))}
            </select>
          )}
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500 sm:flex-none"
          >
            {SESSIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="flex flex-1 gap-1 sm:flex-none">
            <Button
              size="sm"
              variant={date === today() ? 'primary' : 'secondary'}
              onClick={() => setDate(today())}
            >
              Maanta
            </Button>
            <Button
              size="sm"
              variant={date === yesterday() ? 'primary' : 'secondary'}
              onClick={() => setDate(yesterday())}
            >
              Shalay
            </Button>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-ink outline-none focus:border-primary-500 sm:flex-none"
          />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
  <p className="text-xs text-ink-muted">
    {selectedClass}
    {selectedClassObj?.hasSections && selectedSection ? ` – Section ${selectedSection}` : ''}:{' '}
    <strong>{filteredRows.length}</strong> arday
  </p>
  {sectionOk && (
    <Button
      size="sm"
      onClick={handleAllPresent}
      disabled={loading || unmarkedCount === 0}
    >
      All Present
    </Button>
  )}
</div>
      {!sectionOk ? (
        <p className="rounded-lg bg-canvas px-3 py-6 text-center text-sm text-ink-muted">
          Fasalkan sections buu leeyahay — dooro section marka hore.
        </p>
      ) : (
      <Card className="p-0">
        <Table
          columns={[
            {
              key: 'name',
              label: 'Magaca',
              render: (row) => (
                <span className="flex items-center gap-1.5">
                  {row.name}
                  <button
                    onClick={() => setInfoStudent(row.studentId)}
                    className="text-ink-muted hover:text-primary-600"
                    aria-label="Xogta ardayga"
                  >
                    <Info size={14} />
                  </button>
                </span>
              ),
            },
            { key: 'parentPhone', label: 'Telefoonka waalidka' },
            {
              key: 'status',
              label: 'Xaalad',
              render: (row) => {
                const status = getStatus(row.enrollmentId)
                const wasAbsentPrev = getPreviousDayStatus(row.enrollmentId) === 'absent'
                return (
                  <span className="flex items-center gap-1.5">
                    {wasAbsentPrev && (
                      <span
                        className="h-2 w-2 rounded-full bg-danger-500"
                        title="Maqnaa maalintii hore"
                      />
                    )}
                    {status ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[status]}`}
                      >
                        {statusLabel[status]}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-muted">—</span>
                    )}
                  </span>
                )
              },
            },
            {
              key: 'actions',
              label: '',
              sortable: false,
              render: (row) => (
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" variant="secondary" onClick={() => mark(row.enrollmentId, 'present')}>
                    P
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => mark(row.enrollmentId, 'late')}>
                    L
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => mark(row.enrollmentId, 'excused')}>
                    E
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => mark(row.enrollmentId, 'absent')}>
                    A
                  </Button>
                </div>
              ),
            },
          ]}
          data={sortedRows}
          emptyMessage={loading ? 'Waa la soo rarayaa...' : 'Arday lama helin'}
        />
      </Card>
      )}

      <StudentInfoModal studentId={infoStudent} onClose={() => setInfoStudent(null)} />
    </div>
  )
}

export default AttendancePage
