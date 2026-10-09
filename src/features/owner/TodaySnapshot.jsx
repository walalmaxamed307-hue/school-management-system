import { Sun, Sunset, UserPlus, Users } from 'lucide-react'
import Gauge from './Gauge'
import { rateTone } from './ownerUtils'

function Card({ icon: Icon, title, accent, children }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} />
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
        <Icon size={16} className="text-ink-muted" />
        {title}
      </div>
      {children}
    </div>
  )
}

function SessionCard({ icon, title, s }) {
  const tone = rateTone(s.percent)
  return (
    <Card icon={icon} title={title} accent="linear-gradient(90deg, var(--color-primary-600), var(--color-primary-100))">
      <div className="flex items-center gap-4">
        <Gauge value={s.percent} tone={tone} size={104} stroke={10} />
        <div className="min-w-0 text-sm">
          {s.marked > 0 ? (
            <>
              <p className="font-medium text-ink">{s.attended} / {s.marked} arday</p>
              <p className="mt-1 text-xs text-ink-muted">Maqan: {s.absent + s.excused}</p>
              {s.late > 0 && <p className="text-xs text-ink-muted">Daahay: {s.late}</p>}
            </>
          ) : (
            <p className="text-xs text-ink-muted">Weli lama calaamadin</p>
          )}
        </div>
      </div>
    </Card>
  )
}

const SEGMENTS = [
  ['present', 'Jooga', 'var(--color-primary-600)'],
  ['late', 'Daahay', 'var(--color-warning-500)'],
  ['absent', 'Maqan', 'var(--color-danger-500)'],
  ['excused', 'Cudur-daar', 'var(--color-ink-muted)'],
  ['notMarked', 'La calaamadin', 'var(--color-border)'],
]

function TeachersCard({ t }) {
  const here = t.present + t.late
  return (
    <Card icon={Users} title="Macallimiinta maanta" accent="linear-gradient(90deg, var(--color-warning-500), var(--color-warning-50))">
      <p className="text-3xl font-semibold leading-none text-ink">
        {here}
        <span className="text-lg font-normal text-ink-muted"> / {t.total}</span>
      </p>
      <p className="mt-1 text-xs text-ink-muted">macalin ayaa jooga</p>
      {t.total > 0 && (
        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-canvas">
          {SEGMENTS.map(([key, , color]) =>
            t[key] > 0 ? <div key={key} style={{ width: `${(t[key] / t.total) * 100}%`, background: color }} /> : null
          )}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
        {SEGMENTS.filter(([key]) => t[key] > 0).map(([key, label, color]) => (
          <span key={key} className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            {label} {t[key]}
          </span>
        ))}
      </div>
    </Card>
  )
}

function NewStudentsCard({ n }) {
  return (
    <Card icon={UserPlus} title="Ardayda cusub" accent="linear-gradient(90deg, #0ea5e9, #bae6fd)">
      <p className="text-3xl font-semibold leading-none text-ink">{n.today}</p>
      <p className="mt-1 text-xs text-ink-muted">maanta ku soo biiray</p>
      <div className="mt-4 rounded-xl bg-canvas px-3 py-2 text-xs text-ink-muted">
        Bishan: <span className="font-medium text-ink">{n.thisMonth}</span> arday oo cusub
      </div>
      {n.todayList.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {n.todayList.slice(0, 3).map((s) => (
            <li key={s.studentCode} className="truncate text-xs text-ink">
              {s.name} <span className="text-ink-muted">· {s.className}{s.sectionName ? ` ${s.sectionName}` : ''}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

// 4 kaar oo ugu muhiimsan maanta: Kahor Break, Kadib Break, ardayda cusub, macallimiinta.
function TodaySnapshot({ data }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SessionCard icon={Sun} title="Joogitaanka Kahor Break" s={data.attendanceToday.before} />
      <SessionCard icon={Sunset} title="Joogitaanka Kadib Break" s={data.attendanceToday.after} />
      <NewStudentsCard n={data.newStudents} />
      <TeachersCard t={data.teachersToday} />
    </div>
  )
}

export default TodaySnapshot
