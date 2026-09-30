import { createContext, useCallback, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { useStaffResource } from '@/lib/useStaffResource'
import { useToast } from '@/hooks/useToast'

// eslint-disable-next-line react-refresh/only-export-components
export const RoomsContext = createContext(null)

const EMPTY = []

async function loadRooms() {
  const list = await api.get('/rooms')
  return list.map((r) => ({ id: r._id, name: r.name }))
}

// Room-yada liiskooda waa list guud (school-wide), laakiin qaybinta ardayda
// (split) waa mid EXAM-GAAR AH — arday kastaa wuxuu heli karaa room kala duwan
// exam kasta (backend: RoomAssignment keyed by examId+enrollmentId).
export function RoomsProvider({ children }) {
  const { data: roomItems, loading, run } = useStaffResource(loadRooms, EMPTY)
  const rooms = useMemo(() => roomItems.map((r) => r.name), [roomItems])
  const [split, setSplit] = useState({}) // { roomName: [{ studentId, name, studentCode, enrollmentId, examStatus }] }
  const [splitLoading, setSplitLoading] = useState(false)
  const [examId, setExamId] = useState(null)
  const { showToast } = useToast()

  async function addRoom(name) {
    const trimmed = name.trim()
    if (!trimmed || rooms.includes(trimmed)) return false
    return run(() => api.post('/rooms', { name: trimmed }))
  }

  async function removeRoom(name) {
    const room = roomItems.find((r) => r.name === name)
    if (!room) return false
    return run(() => api.delete(`/rooms/${room.id}`))
  }

  const loadSplit = useCallback(
    async (forExamId) => {
      setExamId(forExamId)
      if (!forExamId) {
        setSplit({})
        return
      }
      setSplitLoading(true)
      try {
        setSplit(await api.get(`/exams/${forExamId}/room-split`))
      } catch (err) {
        showToast(err.message, 'error')
        setSplit({})
      } finally {
        setSplitLoading(false)
      }
    },
    [showToast]
  )

  // Kaliya fasalada la doortay (classIds) ayaa la kala qaybinayaa room-yada
  // la doortay (roomIds), round-robin — backend-ku ayaa qabta xisaabinta.
  async function splitClasses(classIds, roomIds) {
    if (!examId) return false
    try {
      await api.post(`/exams/${examId}/room-split`, { classIds, roomIds })
      await loadSplit(examId)
      return true
    } catch (err) {
      showToast(err.message, 'error')
      return false
    }
  }

  async function updateAssignment(enrollmentId, patch) {
    if (!examId) return false
    try {
      await api.patch(`/exams/${examId}/room-split/${enrollmentId}`, patch)
      await loadSplit(examId)
      return true
    } catch (err) {
      showToast(err.message, 'error')
      return false
    }
  }

  const assignedEnrollmentIds = useMemo(
    () => new Set(Object.values(split).flat().map((s) => s.enrollmentId)),
    [split]
  )

  return (
    <RoomsContext.Provider
      value={{
        rooms,
        roomItems,
        loading,
        addRoom,
        removeRoom,
        split,
        splitLoading,
        loadSplit,
        splitClasses,
        updateAssignment,
        assignedEnrollmentIds,
      }}
    >
      {children}
    </RoomsContext.Provider>
  )
}
