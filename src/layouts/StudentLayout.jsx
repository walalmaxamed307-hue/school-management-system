import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { LogOut, FileText, Megaphone, DoorOpen } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from '@/components/ThemeToggle'
import SchoolLogo from '@/components/SchoolLogo'
import { Button } from '@/components/ui'

function StudentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const tabClass = ({ isActive }) =>
    `flex items-center gap-1.5 border-b-2 px-1 py-2 text-sm font-medium ${
      isActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-ink-muted'
    }`

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      <header className="no-print flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3 sm:px-6">
        <SchoolLogo />
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <p className="hidden text-sm text-ink-muted sm:block">{user?.name}</p>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            <LogOut size={16} />
            <span className="hidden sm:inline">Ka bax</span>
          </Button>
        </div>
      </header>
      <nav className="no-print flex shrink-0 gap-4 overflow-x-auto border-b border-border bg-surface px-4 sm:px-6">
        <NavLink to="/my-results" className={tabClass}>
          <FileText size={16} /> <span className="whitespace-nowrap">Natiijadayda</span>
        </NavLink>
        <NavLink to="/my-announcements" className={tabClass}>
          <Megaphone size={16} /> <span className="whitespace-nowrap">Announcements</span>
        </NavLink>
        <NavLink to="/my-room" className={tabClass}>
          <DoorOpen size={16} /> <span className="whitespace-nowrap">Qolka Imtixaanka</span>
        </NavLink>
      </nav>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default StudentLayout
