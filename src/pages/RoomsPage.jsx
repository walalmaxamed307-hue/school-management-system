import { useEffect, useState } from 'react'
import { Plus, X, Shuffle, ArrowRightLeft, ChevronDown, ChevronUp, Phone } from 'lucide-react'
import { useStudents } from '@/hooks/useStudents'
import { useRooms } from '@/hooks/useRooms'
import { useClasses } from '@/hooks/useClasses'
import { useExamResults } from '@/hooks/useExamResults'
import { useAuth } from '@/hooks/useAuth'
import { useSchoolSettings } from '@/hooks/useSchoolSettings'
import { useSearch } from '@/hooks/useSearch'
import { useToast } from '@/hooks/useToast'
import { Card, Button, Input, Modal } from '@/components/ui'

const examStatusStyle = {
  present: 'bg-primary-50 text-primary-600',
  absent: 'bg-danger-50 text-danger-500',
}

function RoomsPage() {
  const { students } = useStudents()
  const { classes } = useClasses()
  const { rooms, roomItems, addRoom, removeRoom, split, splitLoading, loadSplit, splitClasses, updateAssignment, assignedEnrollmentIds } =
    useRooms()
  const { exams, loadExams } = useExamResults()
  const { user } = useAuth()
  const { settings } = useSchoolSettings()
  const { query } = useSearch()
  const { showToast } = useToast()
  const isAdmin = user?.role === 'admin'
  const [newRoom, setNewRoom] = useState('')
  const [expandedRooms, setExpandedRooms] = useState({})
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickedClasses, setPickedClasses] = useState([])
  const [pickedRooms, setPickedRooms] = useState([])
  const [examId, setExamId] = useState('')

  // Qaybinta (split) waa mid exam-gaar ah — waa in la doortaa term/exam
  // marka hore, isla sanadka hadda socda.
  useEffect(() => {
    loadExams(settings.academicYearId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.academicYearId])

  useEffect(() => {
    if (exams.length > 0 && !exams.some((e) => e._id === examId)) setExamId(exams[0]._id)
    if (exams.length === 0) setExamId('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exams])

  useEffect(() => {
    if (examId) loadSplit(examId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId])

  function toggleRoom(room) {
    setExpandedRooms((prev) => ({ ...prev, [room]: !prev[room] }))
  }

  const activeStudents = students.filter((s) => s.status === 'active')
  const filteredActive = activeStudents.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
  const unassigned = filteredActive.filter((s) => !assignedEnrollmentIds.has(s.enrollmentId))

  async function handleAddRoom(e) {
    e.preventDefault()
    const ok = await addRoom(newRoom)
    if (ok) setNewRoom('')
  }

  function openPicker() {
    if (roomItems.length === 0) {
      showToast('Marka hore room ku dar ka hor intaanad qaybinin', 'error')
      return
    }
    setPickedClasses([])
    setPickedRooms(roomItems.map((r) => r.id))
    setPickerOpen(true)
  }

  function toggleClassPick(className) {
    setPickedClasses((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
    )
  }

  function toggleRoomPick(roomId) {
    setPickedRooms((prev) => (prev.includes(roomId) ? prev.filter((r) => r !== roomId) : [...prev, roomId]))
  }

  async function handleSplit() {
    const classIds = classes.filter((c) => pickedClasses.includes(c.name)).map((c) => c.id)
    if (classIds.length === 0) {
      showToast('Dooro ugu yaraan hal fasal', 'error')
      return
    }
    if (pickedRooms.length === 0) {
      showToast('Dooro ugu yaraan hal room', 'error')
      return
    }
    const ok = await splitClasses(classIds, pickedRooms)
    if (ok) {
      setPickerOpen(false)
      showToast('Ardayda waa la kala qaybiyay.', 'success')
    }
  }

  const examName = exams.find((e) => e._id === examId)?.name

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-medium text-ink">Exam Rooms</h1>
        <select
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          disabled={exams.length === 0}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary-500"
        >
          {exams.length === 0 && <option value="">Wali term lama darin</option>}
          {exams.map((e) => (
            <option key={e._id} value={e._id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      {exams.length === 0 ? (
        <Card className="text-center text-sm text-ink-muted">
          Marka hore ku dar term (exam), boggiisa Exam results, kaddibna soo noqo halkan.
        </Card>
      ) : (
        <>
          {isAdmin && (
            <div className="mb-4 flex justify-end">
              <Button onClick={openPicker}>
                <Shuffle size={16} />
                Kala qaybi — {examName}
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {rooms.map((room) => {
              const roomStudents = (split[room] ?? []).filter((s) =>
                s.name.toLowerCase().includes(query.toLowerCase())
              )
              const isOpen = !!expandedRooms[room]
              return (
                <Card key={room} className="p-0">
                  <button
                    onClick={() => toggleRoom(room)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="flex items-center gap-2 font-medium text-ink">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {room}
                      <span className="text-sm font-normal text-ink-muted">({roomStudents.length} arday)</span>
                    </span>
                    {isAdmin && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(`Ma hubtaa inaad tirtirto "${room}"?`)) removeRoom(room)
                        }}
                        className="text-ink-muted hover:text-danger-500"
                        aria-label={`Ka saar ${room}`}
                      >
                        <X size={16} />
                      </span>
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t border-border px-5 py-4">
                      {splitLoading ? (
                        <p className="text-sm text-ink-muted">Waa la soo rarayaa...</p>
                      ) : roomStudents.length === 0 ? (
                        <p className="text-sm text-ink-muted">Wali arday lama gelin room-kan exam-kan</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {roomStudents.map((s) => {
                            const student = activeStudents.find((a) => a.id === s.studentId)
                            return (
                              <div
                                key={s.enrollmentId}
                                className="flex flex-col gap-2 rounded-lg border border-border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div>
                                  <p className="text-ink">
                                    {s.name} <span className="text-ink-muted">— {student?.class ?? ''}</span>
                                  </p>
                                  {student?.parentPhone && (
                                    <p className="flex items-center gap-1 text-xs text-ink-muted">
                                      <Phone size={12} /> {student.parentPhone}
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  {s.examStatus && (
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${examStatusStyle[s.examStatus]}`}>
                                      {s.examStatus === 'present' ? 'Present' : 'Absent'}
                                    </span>
                                  )}
                                  {isAdmin && (
                                    <>
                                      <button
                                        onClick={() => updateAssignment(s.enrollmentId, { examStatus: 'present' })}
                                        className="rounded-md border border-border px-2 py-1 text-xs text-ink hover:bg-primary-50 hover:text-primary-600"
                                      >
                                        Present
                                      </button>
                                      <button
                                        onClick={() => updateAssignment(s.enrollmentId, { examStatus: 'absent' })}
                                        className="rounded-md border border-border px-2 py-1 text-xs text-ink hover:bg-danger-50 hover:text-danger-500"
                                      >
                                        Absent
                                      </button>
                                      <div className="flex items-center gap-1">
                                        <ArrowRightLeft size={14} className="text-ink-muted" />
                                        <select
                                          value={roomItems.find((r) => r.name === room)?.id ?? ''}
                                          onChange={(e) => updateAssignment(s.enrollmentId, { roomId: e.target.value })}
                                          className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink outline-none focus:border-primary-500"
                                        >
                                          {roomItems.map((r) => (
                                            <option key={r.id} value={r.id}>
                                              {r.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {unassigned.length > 0 && (
              <Card>
                <p className="mb-3 font-medium text-ink">
                  Weli lama qaybin <span className="text-sm text-ink-muted">({unassigned.length} arday)</span>
                </p>
                <div className="flex flex-col gap-2">
                  {unassigned.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                      <span className="text-ink">
                        {s.name} <span className="text-ink-muted">— {s.class}</span>
                      </span>
                      {isAdmin && roomItems.length > 0 && (
                        <select
                          value=""
                          onChange={(e) => updateAssignment(s.enrollmentId, { roomId: e.target.value })}
                          className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink outline-none focus:border-primary-500"
                        >
                          <option value="" disabled>
                            Dooro room
                          </option>
                          {roomItems.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </>
      )}

      {isAdmin && (
        <Card className="mt-4">
          <p className="mb-3 text-sm font-medium text-ink">Ku dar Room cusub</p>
          <form onSubmit={handleAddRoom} className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Tusaale: Room 4"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              className="sm:max-w-xs"
            />
            <Button type="submit" variant="secondary" className="sm:w-auto">
              <Plus size={16} />
              Add Room
            </Button>
          </form>
        </Card>
      )}

      {!isAdmin && (
        <p className="mt-3 text-xs text-ink-muted">
          Akhris-kaliya — admin-ka kaliya ayaa room-yada beddeli kara ama qaybin kara.
        </p>
      )}

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title={`Kala qaybi — ${examName}`}>
        <p className="mb-3 text-xs text-ink-muted">
          Dooro fasalada la kala qaybinayo iyo room-yada la isticmaali doono — fasalada aan la doorin waxba
          kama beddelmayaan.
        </p>
        <p className="mb-1.5 text-xs font-medium text-ink">Fasallada</p>
        <div className="mb-3 flex flex-col gap-1.5">
          {classes.map((c) => (
            <label key={c.name} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-canvas">
              <input type="checkbox" checked={pickedClasses.includes(c.name)} onChange={() => toggleClassPick(c.name)} />
              {c.name}
            </label>
          ))}
        </div>
        <p className="mb-1.5 text-xs font-medium text-ink">Room-yada</p>
        <div className="mb-4 flex flex-col gap-1.5">
          {roomItems.map((r) => (
            <label key={r.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-canvas">
              <input type="checkbox" checked={pickedRooms.includes(r.id)} onChange={() => toggleRoomPick(r.id)} />
              {r.name}
            </label>
          ))}
        </div>
        <Button onClick={handleSplit} disabled={pickedClasses.length === 0 || pickedRooms.length === 0} className="w-full">
          Kala qaybi ({pickedClasses.length} fasal, {pickedRooms.length} room)
        </Button>
      </Modal>
    </div>
  )
}

export default RoomsPage
