import { createContext, useCallback, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'

// eslint-disable-next-line react-refresh/only-export-components
export const TeacherAttendanceContext = createContext(null)

// `rows`: xogta taariikhda la doortay (`date`) — status maalintaas +
// absentDaysThisMonth (bisha `date` ku jirto), sida backend-ku soo celiyo.
export function TeacherAttendanceProvider({ children }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState(null)
  const { showToast } = useToast()

  const loadTeacherAttendance = useCallback(
    async (forDate) => {
      setDate(forDate)
      setLoading(true)
      try {
        setRows(await api.get('/teacher-attendance', { date: forDate }))
      } catch (err) {
        showToast(err.message, 'error')
        setRows([])
      } finally {
        setLoading(false)
      }
    },
    [showToast]
  )

  function getStatus(teacherId) {
    return rows.find((r) => r.teacherId === teacherId)?.status ?? null
  }

  function getMonthlyAbsenceCount(teacherId) {
    return rows.find((r) => r.teacherId === teacherId)?.absentDaysThisMonth ?? 0
  }

  async function mark(teacherId, status) {
    if (!date) return
    setRows((prev) =>
      prev.map((r) => {
        if (r.teacherId !== teacherId) return r
        const wasAbsent = r.status === 'absent'
        const isAbsent = status === 'absent'
        const delta = isAbsent && !wasAbsent ? 1 : !isAbsent && wasAbsent ? -1 : 0
        return { ...r, status, absentDaysThisMonth: r.absentDaysThisMonth + delta }
      })
    )
    try {
      await api.post('/teacher-attendance', { teacherId, date, status })
    } catch (err) {
      showToast(err.message, 'error')
      loadTeacherAttendance(date)
    }
  }

  return (
    <TeacherAttendanceContext.Provider
      value={{ rows, loading, loadTeacherAttendance, getStatus, getMonthlyAbsenceCount, mark }}
    >
      {children}
    </TeacherAttendanceContext.Provider>
  )
}
