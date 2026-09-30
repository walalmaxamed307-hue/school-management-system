import { createContext, useCallback, useEffect, useState } from 'react'
import { api, getToken, setToken } from '@/lib/api'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

// Session-ka waa token (JWT) localStorage-ka ku jira + user profile-ka oo
// backend-ku ka soo celiyo GET /auth/me. Marka bogga la refresh gareeyo,
// token-ka ayaa la hubiyaa; haddii uu dhacay/aan sax ahayn, user waa null
// oo loo dhiibayaa /login. `loading` waa run intaa la hubinayo, si
// ProtectedRoute uusan u riixin /login iyadoo user-ku login yahay.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => !!getToken())

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api
      .get('/auth/me')
      .then((data) => {
        if (!cancelled) setUser(data.user)
      })
      .catch(() => {
        // 401 waxaa horey u nadiifiyay api.js; khalad network ah — session-ka
        // ma la tirtirin, laakiin user-ku login ma yahay ilaa server-ka la gaaro.
        if (!cancelled && !getToken()) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Token dhacay marka user-ku shaqeynayo (401 meel kasta) => ka bax.
  useEffect(() => {
    function onExpired() {
      setUser(null)
    }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const data = await api.post('/auth/login', { email: email.trim(), password }, { auth: false })
      setToken(data.token)
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const loginAsStudent = useCallback(async (studentCode, dob) => {
    try {
      const data = await api.post(
        '/auth/student-login',
        { studentCode: studentCode.trim(), dob },
        { auth: false }
      )
      setToken(data.token)
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  // Admin/macalin: beddel password-ka. Backend-ku token cusub ayuu soo celiyaa;
  // waa la kaydiyaa si session-ku u sii socdo. User-ka (state) ma beddelmo.
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const data = await api.post('/auth/change-password', { currentPassword, newPassword })
      if (data?.token) setToken(data.token)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAsStudent, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
