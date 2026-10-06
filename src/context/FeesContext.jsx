import { createContext, useCallback, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { useSchoolSettings } from '@/hooks/useSchoolSettings'
import { useToast } from '@/hooks/useToast'

// eslint-disable-next-line react-refresh/only-export-components
export const FeesContext = createContext(null)

// `rows`: xogta fasal+section+bil la doortay (GET /fees) — arday aan weli
// lacag la keydin (id: null) waxaa lala socodsiiyaa amountDue "preview" ah
// oo backend-ku xisaabiyay, isla xeerka feeController.computeAmountDue.
export function FeesProvider({ children }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState(null) // { classId, sectionId, month }
  const { settings } = useSchoolSettings()
  const { showToast } = useToast()
  const reqId = useRef(0)
  const standardAmount = settings.standardFeeAmount

  
const loadFees = useCallback(
  async (classId, sectionId, month, { silent = false } = {}) => {
    const myId = ++reqId.current
    if (!classId || !month) { setRows([]); setCurrent(null); return }
    setCurrent({ classId, sectionId, month })
    if (!silent) { setRows([]); setLoading(true) }   // ha tusin fasalkii hore
    try {
      const data = await api.get('/fees', { classId, sectionId: sectionId || undefined, month })
      if (myId !== reqId.current) return              // jawaab duug ah, iska dhaaf
      const list = Array.isArray(data) ? data : []
      setRows(list.map((r) => ({ ...r, feeId: r.id, id: r.enrollmentId }))) // key sax ah
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

  function getFee(enrollmentId) {
    return rows.find((r) => r.enrollmentId === enrollmentId) ?? null
  }

  // amountPaid waa lagu hubiyaa backend-ka (ma dhaafi karo amountDue) — halkan
  // waxaan kaliya hubinaynaa in uu yahay tiro >= 0, si khalad degdeg ah loo
  // muujiyo ka hor intaan server-ka la wicin.
  async function payFee(enrollmentId, amountPaid) {
    if (!current) return false
    if (typeof amountPaid !== 'number' || Number.isNaN(amountPaid) || amountPaid < 0) {
      showToast('Qiimaha waa in uu noqdaa tiro sax ah (0 ama ka badan)', 'error')
      return false
    }
    try {
      await api.post('/fees', { enrollmentId, month: current.month, amountPaid })
      await loadFees(current.classId, current.sectionId, current.month)
      return true
    } catch (err) {
      showToast(err.message, 'error')
      return false
    }
  }

  return (
    <FeesContext.Provider value={{ rows, loading, loadFees, getFee, payFee, standardAmount }}>
      {children}
    </FeesContext.Provider>
  )
}
