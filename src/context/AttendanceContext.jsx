import { createContext, useCallback, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { SESSION_CODES } from '@/data/sessions'

// eslint-disable-next-line react-refresh/only-export-components
export const AttendanceContext = createContext(null)

// Summad gaar ah oo u taagan "fasal+section+taariikh+session" — waxaa loo
// isticmaalaa in la ogaado haddii isbeddel (mark / all present) uu weli
// khuseeyo shaashadda hadda furan, iyo in aan dib loo soo rarin fasal duug ah.
const keyOf = (c) => (c ? `${c.classId}|${c.sectionId ?? ''}|${c.date}|${c.session}` : '')

// `rows`: xogta backend-ku soo celiyay wicitaanka ugu dambeeyay ee
// loadAttendance — hal fasal+section+taariikh+session ayay soo qaadaan
// mar kasta (ma aha xusuusta guud ee dhammaan fasallada, sida hore).
// SMS: waxaa la joojiyay MVP-gan (V1) — mustaqbalka marka la dib-u-daayo,
// sendAbsenceNotification (lib/notifications.js) ayaa la wici doonaa halkan.
export function AttendanceProvider({ children }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const currentRef = useRef(null) // { classId, sectionId, date, session } ee hadda furan
  const reqId = useRef(0) // tirooyin kor u kacaya: kan ugu dambeeya oo keliya ayaa la aqbalaa
  const { showToast } = useToast()

  const loadAttendance = useCallback(
    async (classId, sectionId, date, session, { silent = false } = {}) => {
      const myId = ++reqId.current // wicitaankii hore ee socda wuu "duug" noqonayaa
      if (!classId || !date || !session) {
        currentRef.current = null
        setRows([])
        setLoading(false)
        return
      }
      currentRef.current = { classId, sectionId, date, session }
      if (!silent) {
        setRows([]) // ha tusin ardaydii fasalkii hore intaa la sugayo
        setLoading(true)
      }
      try {
        const data = await api.get('/attendance', {
          classId,
          sectionId: sectionId || undefined,
          date,
          session: SESSION_CODES[session],
        })
        if (myId !== reqId.current) return // jawaab duug ah — iska dhaaf
        const list = Array.isArray(data) ? data : []
        // id = enrollmentId, si Table-ku u helo `key` gaar ah (rows-ka hore id ma laheyn)
        setRows(list.map((r) => ({ ...r, id: r.enrollmentId })))
      } catch (err) {
        if (myId !== reqId.current) return
        showToast(err.message, 'error')
        setRows([])
      } finally {
        if (myId === reqId.current) setLoading(false)
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
  // been sheegin — KALIYA haddii shaashadda aan la beddelin intaa (haddii kale
  // fasalkii hore ayaa dib u soo bixi lahaa oo kan cusub dul-qori lahaa).
  async function mark(enrollmentId, status) {
    const cur = currentRef.current
    if (!cur) return
    const key = keyOf(cur)
    setRows((prev) => prev.map((r) => (r.enrollmentId === enrollmentId ? { ...r, status } : r)))
    try {
      await api.post('/attendance', {
        enrollmentId,
        date: cur.date,
        session: SESSION_CODES[cur.session],
        status,
      })
    } catch (err) {
      showToast(err.message, 'error')
      if (keyOf(currentRef.current) === key) {
        loadAttendance(cur.classId, cur.sectionId, cur.date, cur.session, { silent: true })
      }
    }
  }

  // Ardayda aan weli la calaamadin oo dhan "present" ka dhig (backend-ku
  // kuwa hore loo calaamadiyay ma taabto), kadib xogta dib u soo qaad.
  async function markAllPresent() {
    const cur = currentRef.current
    if (!cur) return
    const key = keyOf(cur)
    try {
      const res = await api.post('/attendance/bulk-present', {
        classId: cur.classId,
        sectionId: cur.sectionId || undefined,
        date: cur.date,
        session: SESSION_CODES[cur.session],
      })
      showToast(
        res.marked === 0
          ? 'Dhammaan ardayda hore ayaa loo calaamadiyay.'
          : `${res.marked} arday present ayaa laga dhigay.`,
        'success'
      )
    } catch (err) {
      showToast(err.message, 'error')
    }
    if (keyOf(currentRef.current) === key) {
      loadAttendance(cur.classId, cur.sectionId, cur.date, cur.session, { silent: true })
    }
  }

  return (
    <AttendanceContext.Provider
      value={{ rows, loading, loadAttendance, getStatus, getPreviousDayStatus, mark, markAllPresent }}
    >
      {children}
    </AttendanceContext.Provider>
  )
}
