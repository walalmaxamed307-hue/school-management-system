import { NavLink } from 'react-router-dom'
import {
  Award, BookOpen, CalendarCheck, Crown, DoorOpen, FileText, GraduationCap,
  LayoutDashboard, MessageCircle, Settings, ShieldCheck, Users, Wallet, X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import SchoolLogo from '@/components/SchoolLogo'
import { hasFeeAccess } from '@/lib/routes'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Students', path: '/students', icon: Users, adminOnly: true },
  { label: 'Teachers', path: '/teachers', icon: GraduationCap, adminOnly: true },
  { label: 'Owners', path: '/owners', icon: Crown, adminOnly: true },
  { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { label: 'Fees', path: '/fees', icon: Wallet, feeAccess: true },
  { label: 'Exam results', path: '/exam-results', icon: FileText },
  { label: 'Assignments & Lessons', path: '/assignments', icon: BookOpen, teacherOnly: true },
  { label: 'Announcements', path: '/announcements', icon: MessageCircle },
  { label: 'Rooms', path: '/rooms', icon: DoorOpen },
  { label: 'Graduates', path: '/graduates', icon: Award },
  { label: 'AI Assistant', icon: MessageCircle, comingSoon: true },
  { label: 'Settings', path: '/settings', icon: Settings, adminOnly: true },
]

function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const canFees = hasFeeAccess(user)
  const visibleItems = navItems.filter((item) => !item.teacherOnly || isTeacher)

  return (
    <>
      <div aria-hidden="true" onClick={onClose} className={`app-nav-backdrop fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-[2px] lg:hidden ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} />
      <aside className={`app-sidebar no-print fixed inset-y-0 left-0 z-40 flex h-[100dvh] w-[290px] flex-col border-r border-border bg-surface lg:static lg:h-screen lg:w-[276px] lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-border/80 px-5 pb-5 pt-5">
          <div className="flex items-center justify-between gap-3"><SchoolLogo /><button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted transition hover:bg-canvas hover:text-ink lg:hidden" aria-label="Xir menu-ga"><X size={19} /></button></div>
          <div className="app-profile mt-5 flex items-center gap-3 rounded-2xl px-3 py-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-sm font-bold text-white">{user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-ink">{user?.name || 'User'}</p><p className="mt-0.5 text-xs text-ink-muted">{isAdmin ? 'School administrator' : 'Teacher portal'}</p></div></div>
        </div>
        <nav className="app-nav flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5" aria-label="Main navigation">
          <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-ink-muted">Main menu</p>
          {visibleItems.map((item) => {
            const restricted = item.comingSoon || (item.adminOnly && !isAdmin) || (item.feeAccess && !canFees)
            const Icon = item.icon
            if (restricted) return <div key={item.label} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-ink-muted opacity-65"><span className="flex min-w-0 items-center gap-3"><Icon size={18} /><span className="truncate">{item.label}</span></span><span className="ml-2 rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold">{item.comingSoon ? 'Dhawaan' : 'Admin'}</span></div>
            return <NavLink key={item.label} to={item.path} onClick={onClose} className={({ isActive }) => `app-nav-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'app-nav-link-active' : 'text-ink-muted hover:bg-canvas hover:text-ink'}`}><Icon size={18} /><span>{item.label}</span></NavLink>
          })}
        </nav>
        <div className="m-3 rounded-2xl border border-border bg-canvas/70 p-3"><div className="flex items-center gap-2 text-xs font-bold text-ink"><ShieldCheck size={15} className="text-primary-600" /> IskuulCaawiye secure</div><p className="mt-1 text-[11px] leading-5 text-ink-muted">Xogta iskuulkaaga hal meel ayay ku ammaan tahay.</p></div>
      </aside>
    </>
  )
}

export default Sidebar
