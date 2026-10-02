import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  Wallet,
  FileText,
  MessageCircle,
  Settings,
  Megaphone,
  DoorOpen,
  Award,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import brandMark from '@/assets/brand-mark.png'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Students', path: '/students', icon: Users, adminOnly: true },
  { label: 'Teachers', path: '/teachers', icon: GraduationCap, adminOnly: true },
  { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { label: 'Fees', path: '/fees', icon: Wallet, adminOnly: true },
  { label: 'Exam results', path: '/exam-results', icon: FileText },
  { label: 'Announcements', path: '/announcements', icon: Megaphone },
  { label: 'Rooms', path: '/rooms', icon: DoorOpen },
  { label: 'Graduates', path: '/graduates', icon: Award },
  { label: 'AI Assistant', icon: MessageCircle, comingSoon: true },
  { label: 'Settings', path: '/settings', icon: Settings, adminOnly: true },
]

function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5" onClick={onClose}>
          <div className="flex items-center gap-2.5">
  <img src={brandMark} alt="IskuulCaawiye" className="h-10 w-10 rounded-xl object-contain" />
  <span className="text-base font-extrabold tracking-tight text-ink">
    Iskuul<span className="text-emerald-600">Caawiye</span>
  </span>
</div>
          <p className="mt-2 text-xs text-ink-muted">Ku soo dhawoow, {user?.name}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
          {navItems.map((item) => {
            const restricted = item.comingSoon || (item.adminOnly && !isAdmin)

            if (restricted) {
              return (
                <div
                  key={item.label}
                  className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-sm text-ink-muted"
                >
                  <span className="flex items-center gap-3">
                    <item.icon size={18} />
                    {item.label}
                  </span>
                  <span className="rounded-full bg-canvas px-2 py-0.5 text-xs">
                    {item.comingSoon ? 'Dhawaan' : 'Admin kaliya'}
                  </span>
                </div>
              )
            }

            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-ink hover:bg-canvas'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
