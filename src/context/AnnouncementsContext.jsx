import { createContext, useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

// eslint-disable-next-line react-refresh/only-export-components
export const AnnouncementsContext = createContext(null)

// Admin, macalin, iyo arday — saddexdoodaba way arki karaan ogeysiisyada
// iskuulkooda (GET /announcements, authenticateSession). Qoritaanka/tirtirku
// waa arrimo staff-only ah, backend-ku ayaa xaqiijiya.
export function AnnouncementsProvider({ children }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)
  const userId = user?.id

  const reload = useCallback(async () => {
    try {
      setAnnouncements(await api.get('/announcements'))
    } catch (err) {
      showToast(err.message, 'error')
    }
  }, [showToast])

  useEffect(() => {
    if (!userId) {
      setAnnouncements([])
      return
    }
    let cancelled = false
    setLoading(true)
    api
      .get('/announcements')
      .then((list) => {
        if (!cancelled) setAnnouncements(list)
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
  }, [userId])

  async function addAnnouncement({ title, body, date }) {
    try {
      await api.post('/announcements', { title, body, eventDate: date || null })
      await reload()
      return true
    } catch (err) {
      showToast(err.message, 'error')
      return false
    }
  }

  async function deleteAnnouncement(id) {
    try {
      await api.delete(`/announcements/${id}`)
      await reload()
      return true
    } catch (err) {
      showToast(err.message, 'error')
      return false
    }
  }

  return (
    <AnnouncementsContext.Provider value={{ announcements, loading, addAnnouncement, deleteAnnouncement }}>
      {children}
    </AnnouncementsContext.Provider>
  )
}
