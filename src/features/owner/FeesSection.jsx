import { Wallet } from 'lucide-react'
import { Bar as RBar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Panel, { Bar } from './Panel'
import { money, monthShort } from './ownerUtils'

const tooltipStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  fontSize: 12,
}

const STATUS = [
  ['paid', 'La bixiyay', 'var(--color-primary-600)'],
  ['partial', 'Qayb', 'var(--color-warning-500)'],
  ['unpaid', 'Aan la bixin', 'var(--color-danger-500)'],
]

function FeesSection({ data }) {
  const f = data.fees
  const rate = f.collectionRatePercent
  const tone = rate === null ? 'neutral' : rate >= 70 ? 'good' : rate >= 40 ? 'warn' : 'bad'
  const totalStatus = STATUS.reduce((s, [k]) => s + f.statusCounts[k], 0)
  const pie = STATUS.map(([k, label, color]) => ({ key: k, name: label, value: f.statusCounts[k], color })).filter((p) => p.value > 0)
  const history = f.history.map((h) => ({ label: monthShort(h.month), collected: h.collected }))

  return (
    <Panel title={`Lacagta — ${monthShort(f.month)}`} subtitle="Lacagta la ururiyay iyo ardayda bixisay" icon={Wallet}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 1) lacagta bisha */}
        <div>
          <p className="text-xs text-ink-muted">La ururiyay bishan</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-ink">{money(f.collected)}</p>
          {f.expected > 0 ? (
            <>
              <div className="mt-4">
                <Bar value={Math.min(100, rate ?? 0)} tone={tone} height={10} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
                <span>{rate}% la ururiyay</span>
                <span>La rabay: {money(f.expected)}</span>
              </div>
              <div className="mt-4 rounded-xl bg-canvas px-3 py-2.5 text-sm">
                <span className="text-ink-muted">Hadhay: </span>
                <span className="font-semibold text-ink">{money(f.outstanding)}</span>
              </div>
            </>
          ) : (
            <p className="mt-4 rounded-xl bg-canvas px-3 py-2.5 text-xs text-ink-muted">
              Lacagta caadiga ah (Standard Fee) weli lama dejin, sidaa darteed boqolkiiba lama xisaabin karo.
            </p>
          )}
          <p className="mt-3 text-xs text-ink-muted">
            Maanta: <span className="font-medium text-ink">{f.recordedToday.count}</span> diiwaan lacag ah
            {f.recordedToday.count > 0 && <> · {money(f.recordedToday.amount)}</>}
          </p>
        </div>

        {/* 2) xaaladda ardayda */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative h-44 w-44">
            {pie.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={3} stroke="none">
                    {pie.map((p) => (
                      <Cell key={p.key} fill={p.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold text-ink">{totalStatus}</span>
              <span className="text-[11px] text-ink-muted">arday</span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {STATUS.map(([k, label, color]) => (
              <span key={k} className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                <i className="h-2 w-2 rounded-full" style={{ background: color }} />
                {label}: <b className="font-semibold text-ink">{f.statusCounts[k]}</b>
              </span>
            ))}
          </div>
        </div>

        {/* 3) 6-bilood */}
        <div>
          <p className="mb-2 text-xs text-ink-muted">La ururiyay — 6-dii bilood</p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-ink-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-ink-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(v)} cursor={{ fill: 'var(--color-canvas)' }} />
                <RBar dataKey="collected" name="La ururiyay" fill="var(--color-primary-600)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Panel>
  )
}

export default FeesSection
