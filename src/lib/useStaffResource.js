import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

// Hook la wadaago oo dhammaan contexts-ka xogta backend-ka ka soo qaada:
// - Xogta waxaa la soo qaadaa KALIYA marka admin/macalin login yahay
//   (ardaygu endpoints-kan uma oggola — 403).
// - Marka user-ku ka baxo ama isbeddelo, xogta waa la nadiifiyaa (iskuul
//   kale xogtiisa ha la arkin).
// - `load` iyo `initial` waa in ay noqdaan qiimo go'an (module-level ama
//   useCallback), si aanan u soo celin xogta si aan dhammaad lahayn.
// - `run(fn)` wuxuu fuliyaa isbeddel (POST/PATCH/DELETE), kadibna xogta dib
//   ayuu u soo qaadaa (backend ayaa runta haya), khaladka wuxuu ka dhigaa toast.
export function useStaffResource(load, initial) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const isStaff = user?.role === 'admin' || user?.role === 'teacher'
  const userId = user?.id
  const [data, setData] = useState(initial)
  const [loading, setLoading] = useState(false)

  const reload = useCallback(async () => {
    try {
      setData(await load())
    } catch (err) {
      showToast(err.message, 'error')
    }
  }, [load, showToast])

  useEffect(() => {
    if (!isStaff) {
      setData(initial)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    load()
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((err) => {
        if (!cancelled) showToast(err.message, 'error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStaff, userId, load])

  const run = useCallback(
    async (fn) => {
      try {
        await fn()
        await reload()
        return true
      } catch (err) {
        showToast(err.message, 'error')
        return false
      }
    },
    [reload, showToast]
  )

  return { data, loading, reload, run }
}
