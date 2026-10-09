import { Activity, CalendarCheck } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Panel, { Bar, EmptyState } from './Panel'
import { dayShort, rateTone } from './ownerUtils'

const tooltipStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  fontSize: 12,
}

function Trend({ trend }) {
  if (trend.length === 0) return <EmptyState>14-kii maalmood ee la soo dhaafay joogitaan lama qaadin.</EmptyState>
  const rows = trend.map((r) => ({ ...r, label: dayShort(r.date) }))
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="gBefore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary-600)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-primary-600)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gAfter" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="label" stroke="var(--color-ink-muted)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} unit="%" stroke="var(--color-ink-muted)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => (v === null ? '—' : `${v}%`)} />
          <Area type="monotone" dataKey="before" name="Kahor Break" stroke="var(--color-primary-600)" strokeWidth={2.5} fill="url(#gBefore)" connectNulls />
          <Area type="monotone" dataKey="after" name="Kadib Break" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#gAfter)" connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function RateRow({ label, s }) {
  const tone = rateTone(s.percent)
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-[11px] text-ink-muted">{label}</span>
      <div className="flex-1">
        <Bar value={s.percent ?? 0} tone={tone} height={6} />
      </div>
      <span className="w-20 shrink-0 text-right text-[11px] text-ink">
        {s.percent === null ? <span className="text-ink-muted">lama qaadin</span> : `${s.percent}%`}
      </span>
    </div>
  )
}

function ByClass({ rows }) {
  if (rows.length === 0) return <EmptyState>Fasal ma jiro.</EmptyState>
  return (
    <ul className="flex max-h-64 flex-col gap-4 overflow-y-auto pr-1">
      {rows.map((c) => (
        <li key={c.classId}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-ink">{c.className}</span>
            <span className="text-xs text-ink-muted">{c.students} arday</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <RateRow label="Kahor" s={c.before} />
            <RateRow label="Kadib" s={c.after} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function AttendanceSection({ data }) {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Panel
        className="lg:col-span-3"
        title="Joogitaanka 14-kii maalmood"
        subtitle="Boqolkiiba ardayda jooga, maalmaha la qaaday"
        icon={Activity}
        action={
          <div className="hidden items-center gap-3 text-[11px] text-ink-muted sm:flex">
            <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: 'var(--color-primary-600)' }} />Kahor Break</span>
            <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: '#0ea5e9' }} />Kadib Break</span>
          </div>
        }
      >
        <Trend trend={data.attendanceTrend} />
      </Panel>
      <Panel className="lg:col-span-2" title="Fasal kasta maanta" subtitle="Joogitaanka labada session" icon={CalendarCheck}>
        <ByClass rows={data.attendanceByClass} />
      </Panel>
    </div>
  )
}

export default AttendanceSection
