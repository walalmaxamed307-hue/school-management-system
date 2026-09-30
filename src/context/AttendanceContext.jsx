import { createContext, useCallback, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { SESSION_CODES } from '@/data/sessions'

// eslint-disable-next-line react-refresh/only-export-components
export const AttendanceContext = createContext(null)

// `rows`: xogta backend-ku soo celiyay wicitaanka ugu dambeeyay ee
// loadAttendance — hal fasal+section+taariikh+session ayay soo qaadaan
// mar kasta (ma aha xusuusta guud ee dhammaan fasallada, sida hore).
// SMS: waxaa la joojiyay MVP-gan (V1) — mustaqbalka marka la dib-u-daayo,
// sendAbsenceNotification (lib/notifications.js) ayaa la wici doonaa halkan.
export function AttendanceProvider({ children }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState(null) // { classId, sectionId, date, session }
  const { showToast } = useToast()

  const loadAttendance = useCallback(
    async (classId, sectionId, date, session) => {
      if (!classId || !date || !session) {
        setRows([])
        setCurrent(null)
        return
      }
      setCurrent({ classId, sectionId, date, session })
      setLoading(true)
      try {
        const list = await api.get('/attendance', {
          classId,
          sectionId: sectionId || undefined,
          date,
          session: SESSION_CODES[session],
        })
        setRows(list)
      } catch (err) {
        showToast(err.message, 'error')
        setRows([])
      } finally {
        setLoading(false)
      }
    },
    [showToast]
  )

  function getStatus(enrollmentId) {
    return rows.find((r) => r.enrollmentId === enrollmentId)?.status ?? null
  }

  function getPreviousDayStatus(enrollmentId) {
    return rows.find((r) => r.enrollmentId === enrollmentId)?.previousDayStatus ?? null
  }

  // Isbeddel ku dhaqma (optimistic) marka la calaamadinayo; haddii backend-ku
  // fashilmo, waxaa dib loo soo qaadayaa xogtii dhabta ahayd si UI-gu aanu
  // been sheegin.
  async function mark(enrollmentId, status) {
    if (!current) return
    setRows((prev) => prev.map((r) => (r.enrollmentId === enrollmentId ? { ...r, status } : r)))
    try {
      await api.post('/attendance', {
        enrollmentId,
        date: current.date,
        session: SESSION_CODES[current.session],
        status,
      })
    } catch (err) {
      showToast(err.message, 'error')
      loadAttendance(current.classId, current.sectionId, current.date, current.session)
    }
  }

  return (
    <AttendanceContext.Provider
      value={{ rows, loading, loadAttendance, getStatus, getPreviousDayStatus, mark }}
    >
      {children}
    </AttendanceContext.Provider>
  )
}
