import { RefreshCw, KeyRound, LogOut, Moon, Sun, GraduationCap, MapPin, Phone } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { formatLongDate, greeting, formatTime } from './ownerUtils'

const iconBtn =
  'flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60'

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.12)' }}>
      <p className="text-2xl font-semibold leading-none text-white">{value}</p>
      <p className="mt-1 text-xs text-white/75">{label}</p>
    </div>
  )
}

// Banner-ka sare: salaan, magaca iskuulka, taariikhda, iyo tirooyinka guud.
function OwnerHero({ data, refreshing, onRefresh, onPassword, onLogout }) {
  const { theme, toggleTheme } = useTheme()
  const school = data?.school

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-5 text-white shadow-lg sm:p-8"
      style={{ background: 'linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)' }}
    >
      {/* qurxin: goobo iftiin leh */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.18)' }}>
            <GraduationCap size={22} />
          </span>
          <div>
            <p className="text-xs text-white/75">{greeting()} 👋</p>
            <p className="text-xs text-white/75">{formatLongDate()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className={iconBtn} aria-label="Cusboonaysii" title="Cusboonaysii">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button onClick={toggleTheme} className={iconBtn} aria-label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={onPassword} className={iconBtn} aria-label="Beddel password-ka" title="Beddel password-ka">
            <KeyRound size={16} />
          </button>
          <button onClick={onLogout} className={iconBtn} aria-label="Ka bax" title="Ka bax">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="relative mt-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">{school?.name || 'Iskuulka'}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/75">
          {data?.academicYear && (
            <span className="rounded-full px-2.5 py-0.5 text-white" style={{ background: 'rgba(255,255,255,0.18)' }}>
              Sanadka {data.academicYear}
            </span>
          )}
          {school?.address && (
            <span className="inline-flex items-center gap-1"><MapPin size={12} />{school.address}</span>
          )}
          {school?.phone && (
            <span className="inline-flex items-center gap-1"><Phone size={12} />{school.phone}</span>
          )}
          {data?.generatedAt && <span>Cusboonaysiin: {formatTime(data.generatedAt)}</span>}
        </div>
      </div>

      {data?.totals && (
        <div className="relative mt-6 grid grid-cols-3 gap-3">
          <Stat value={data.totals.students} label="Ardayda guud" />
          <Stat value={data.totals.teachers} label="Macallimiin" />
          <Stat value={data.totals.classes} label="Fasallo" />
        </div>
      )}
    </div>
  )
}

export default OwnerHero
