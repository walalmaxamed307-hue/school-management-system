import { Users, TrendingUp } from 'lucide-react'
import { Bar as RBar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Panel, { EmptyState } from './Panel'
import { monthShort } from './ownerUtils'

const tooltipStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  fontSize: 12,
}
const PALETTE = ['#0f6e56', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#ec4899', '#64748b']

function GrowthSection({ data }) {
  const monthly = data.newStudents.byMonth.map((m) => ({ label: monthShort(m.month), count: m.count }))
  const total = data.classDistribution.reduce((s, c) => s + c.students, 0)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Ardayda cusub — 6-dii bilood" subtitle="Imisa arday ayaa bil kasta ku soo biiray" icon={TrendingUp}>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--color-ink-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="var(--color-ink-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--color-canvas)' }} />
              <RBar dataKey="count" name="Arday cusub" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Ardayda fasal kasta" subtitle={`${total} arday oo firfircoon`} icon={Users}>
        {data.classDistribution.length === 0 ? (
          <EmptyState>Fasal leh arday ma jiro.</EmptyState>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.classDistribution} dataKey="students" nameKey="className" innerRadius={46} outerRadius={78} paddingAngle={2} stroke="none">
                    {data.classDistribution.map((c, i) => (
                      <Cell key={c.classId} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-1.5">
              {data.classDistribution.map((c, i) => (
                <li key={c.classId} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex min-w-0 items-center gap-1.5 text-ink-muted">
                    <i className="h-2 w-2 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                    <span className="truncate">{c.className}</span>
                  </span>
                  <b className="font-semibold text-ink">{c.students}</b>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>
    </div>
  )
}

export default GrowthSection
