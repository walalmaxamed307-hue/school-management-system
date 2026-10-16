import { useEffect, useState } from 'react'
import { Bell, ChevronDown, KeyRound, LogOut, Menu, Search, User, GraduationCap } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useStudents } from '@/hooks/useStudents'
import { useTeachers } from '@/hooks/useTeachers'
import { useSearch } from '@/hooks/useSearch'
import ThemeToggle from '@/components/ThemeToggle'
import Button from '@/components/ui/Button'
import ChangePasswordModal from '@/components/ChangePasswordModal'

const roleLabels = { admin: 'Administrator', teacher: 'Teacher' }
const pageTitles = { '/dashboard': 'Dashboard', '/students': 'Students', '/teachers': 'Teachers', '/attendance': 'Attendance', '/fees': 'Fees', '/exam-results': 'Exam results', '/assignments': 'Assignments & lessons', '/announcements': 'Announcements', '/rooms': 'Exam rooms', '/graduates': 'Graduates', '/settings': 'Settings', '/owners': 'Owners' }

function Header({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { students } = useStudents()
  const { teachers } = useTeachers()
  const { query, setQuery } = useSearch()
  const navigate = useNavigate()
  const location = useLocation()
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const isAdmin = user?.role === 'admin'
  const showSearch = location.pathname !== '/settings'
  const title = pageTitles[location.pathname] || 'School portal'

  useEffect(() => { setQuery('') }, [location.pathname, setQuery])
  function handleLogout() { logout(); navigate('/login') }
  const matches = isAdmin && query.trim() && location.pathname === '/dashboard'
    ? [...students.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())).map((s) => ({ ...s, type: 'student' })), ...teachers.filter((t) => t.name.toLowerCase().includes(query.toLowerCase())).map((t) => ({ ...t, type: 'teacher' }))].slice(0, 6)
    : []
  function goTo(item) { setQuery(''); navigate(item.type === 'student' ? '/students' : '/teachers') }

  return (
    <header className="app-header no-print relative z-20 flex min-h-[72px] items-center gap-3 border-b border-border bg-surface/85 px-4 backdrop-blur-xl sm:px-6">
      <button type="button" onClick={onMenuClick} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-muted transition hover:bg-canvas hover:text-ink lg:hidden" aria-label="Fur menu-ga"><Menu size={21} /></button>
      <div className="hidden min-w-0 lg:block"><p className="text-xs font-medium text-ink-muted">School management</p><h1 className="truncate text-base font-bold text-ink">{title}</h1></div>
      {showSearch && <div className="relative min-w-0 max-w-md flex-1 lg:ml-5"><Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Raadi arday ama macalin..." className="app-search w-full rounded-xl border border-border bg-canvas/70 py-2.5 pl-10 pr-3 text-sm text-ink outline-none placeholder:text-ink-muted" />{matches.length > 0 && <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-2xl">{matches.map((item) => <button key={item.id} onClick={() => goTo(item)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-ink transition hover:bg-canvas">{item.type === 'student' ? <User size={15} /> : <GraduationCap size={15} />}{item.name}<span className="ml-auto text-xs text-ink-muted">{item.type === 'student' ? 'Arday' : 'Macalin'}</span></button>)}</div>}</div>}
      {!showSearch && <div className="flex-1" />}
      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <ThemeToggle className="rounded-xl" />
        <button type="button" className="hidden h-10 w-10 items-center justify-center rounded-xl text-ink-muted transition hover:bg-canvas hover:text-ink sm:flex" aria-label="Ogeysiisyo"><Bell size={18} /></button>
        <div className="hidden items-center gap-2 border-l border-border pl-3 sm:flex"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary-600">{user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}</span><div className="max-w-28 text-left"><p className="truncate text-sm font-bold text-ink">{user?.name}</p><p className="text-[11px] text-ink-muted">{roleLabels[user?.role]}</p></div><ChevronDown size={15} className="text-ink-muted" /></div>
        <Button variant="secondary" size="sm" onClick={() => setPasswordModalOpen(true)} aria-label="Beddel password-ka" title="Beddel password-ka" className="rounded-xl"><KeyRound size={16} /><span className="hidden xl:inline">Password</span></Button>
        <Button variant="secondary" size="sm" onClick={handleLogout} className="rounded-xl"><LogOut size={16} /><span className="hidden sm:inline">Ka bax</span></Button>
      </div>
      <ChangePasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </header>
  )
}

export default Header
