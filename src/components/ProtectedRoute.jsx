import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getHomeRoute, hasFeeAccess } from '@/lib/routes'

// feeAccess: kaliya admin ama macalin fee manager ah (user.isFeeManager).
function ProtectedRoute({ children, allowedRoles, feeAccess = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-ink-muted">
        Waa la soo rarayaa...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (feeAccess && !hasFeeAccess(user)) {
    return <Navigate to={getHomeRoute(user.role)} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomeRoute(user.role)} replace />
  }

  return children
}

export default ProtectedRoute
