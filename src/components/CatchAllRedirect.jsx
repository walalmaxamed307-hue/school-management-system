import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getHomeRoute } from '@/lib/routes'

// Route kasta oo aan jirin (typo, link jaban, /results halkii /my-results,
// iwm) ayaa halkan ku dhacaya — ma aha bog madhan. Haddii aan la login gelin,
// waxaa loo celinayaa landing page-ka; haddii la login galay, home route-kiisa role-ka.
function CatchAllRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  return <Navigate to={user ? getHomeRoute(user.role) : '/'} replace />
}

export default CatchAllRedirect
