import { useEffect, useState } from 'react'
import { KeyRound, LogOut, Menu, Search, User, GraduationCap } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useStudents } from '@/hooks/useStudents'
import { useTeachers } from '@/hooks/useTeachers'
import { useSearch } from '@/hooks/useSearch'
import ThemeToggle from '@/components/ThemeToggle'
import Button from '@/components/ui/Button'
import ChangePasswordModal from '@/components/ChangePasswordModal'

const roleLabels = {
  admin: 'Admin',
  teacher: 'Macalin',
}

function Header({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { students } = useStudents()
  const { teachers } = useTeachers()
  const { query, setQuery } = useSearch()
  const navigate = useNavigate()
  const location = useLocation()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const isAdmin = user?.role === 'admin'
  const showSearch = location.pathname !== '/settings'

  // Bog kasta oo la beddelo, search-ka waa la nadiifiyaa — si aanu "Axmed"
  // (Fees-ka lagu qoray) uga sii jirin marka la tago Dashboard.
  useEffect(() => {
    setQuery('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const matches = isAdmin && query.trim() && location.pathname === '/'
    ? [
        ...students
          .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
          .map((s) => ({ ...s, type: 'student' })),
        ...teachers
          .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
          .map((t) => ({ ...t, type: 'teacher' })),
      ].slice(0, 6)
    : []

  function goTo(item) {
    setQuery('')
    navigate(item.type === 'student' ? '/students' : '/teachers')
  }

  return (
    <header className="no-print relative flex h-16 items-center justify-between gap-3 border-b border-border bg-surface px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="text-ink-muted hover:text-ink lg:hidden"
        aria-label="Furanta menu-ga"
      >
        <Menu size={22} />
      </button>

      {showSearch ? (
        <div className="relative min-w-0 max-w-xs flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Raadi..."
            className="w-full rounded-lg border border-border bg-canvas py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-primary-500"
          />
          {matches.length > 0 && (
            <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-border bg-surface py-1 shadow-lg">
              {matches.map((item) => (
                <button
                  key={item.id}
                  onClick={() => goTo(item)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-canvas"
                >
                  {item.type === 'student' ? <User size={14} /> : <GraduationCap size={14} />}
                  {item.name}
                  <span className="ml-auto text-xs text-ink-muted">
                    {item.type === 'student' ? 'Arday' : 'Macalin'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-ink">{user?.name}</p>
          <p className="text-xs text-ink-muted">{roleLabels[user?.role]}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPasswordOpen(true)}
          aria-label="Beddel password-ka"
          title="Beddel password-ka"
        >
          <KeyRound size={16} />
          <span className="hidden md:inline">Password</span>
        </Button>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          <LogOut size={16} />
          <span className="hidden sm:inline">Ka bax</span>
        </Button>
      </div>
      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </header>
  )
}

export default Header
