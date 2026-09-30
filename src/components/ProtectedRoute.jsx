import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getHomeRoute } from '@/lib/routes'

function ProtectedRoute({ children, allowedRoles }) {
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

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomeRoute(user.role)} replace />
  }

  return children
}

export default ProtectedRoute
