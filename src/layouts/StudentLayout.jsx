import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { BookOpen, DoorOpen, FileText, LogOut, Megaphone, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from '@/components/ThemeToggle'
import SchoolLogo from '@/components/SchoolLogo'
import { Button } from '@/components/ui'

const links = [
  { to: '/my-results', label: 'Natiijadayda', icon: FileText },
  { to: '/my-assignments', label: 'Casharro & Assignments', icon: BookOpen },
  { to: '/my-announcements', label: 'Ogeysiisyo', icon: Megaphone },
  { to: '/my-room', label: 'Qolka Imtixaanka', icon: DoorOpen },
]

function StudentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const tabClass = ({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-600' : 'text-ink-muted hover:bg-canvas hover:text-ink'}`

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="no-print sticky top-0 z-30 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className="rounded-lg p-2 text-ink hover:bg-canvas md:hidden" aria-label={menuOpen ? 'Xir menu-ga' : 'Fur menu-ga'}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
            <SchoolLogo />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <p className="hidden max-w-40 truncate text-sm text-ink-muted sm:block">{user?.name}</p>
            <ThemeToggle />
            <Button variant="secondary" size="sm" onClick={handleLogout}><LogOut size={16} /><span className="hidden sm:inline">Ka bax</span></Button>
          </div>
        </div>
        {menuOpen && <div className="mx-auto mt-3 max-w-7xl border-t border-border pt-3 md:hidden"><nav className="grid gap-1"><p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-ink-muted">Student menu</p>{links.map((link) => { const Icon = link.icon; return <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className={tabClass}><Icon size={17} />{link.label}</NavLink> })}</nav></div>}
      </header>
      <nav className="no-print mx-auto hidden max-w-7xl gap-1 px-4 py-3 md:flex sm:px-6" aria-label="Student navigation">{links.map((link) => { const Icon = link.icon; return <NavLink key={link.to} to={link.to} className={tabClass}><Icon size={16} />{link.label}</NavLink> })}</nav>
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7"><Outlet /></main>
    </div>
  )
}

export default StudentLayout
