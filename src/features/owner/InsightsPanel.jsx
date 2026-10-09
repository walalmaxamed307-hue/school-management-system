import { CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles } from 'lucide-react'
import Panel from './Panel'
import { buildInsights, overallStatus } from './ownerUtils'

const toneStyle = {
  good: { icon: CheckCircle2, box: 'bg-primary-50', text: 'text-primary-600' },
  warn: { icon: AlertTriangle, box: 'bg-warning-50', text: 'text-warning-500' },
  bad: { icon: AlertCircle, box: 'bg-danger-50', text: 'text-danger-500' },
  info: { icon: Info, box: 'bg-canvas', text: 'text-ink-muted' },
}

// "Xaaladda maanta": ogeysiisyo kooban oo la fahmi karo isla markiiba —
// milkiilaha waxba kama waydiinayo qofna, wax kasta oo u baahan feejignaan
// halkan ayuu ku arkaa.
function InsightsPanel({ data }) {
  const insights = buildInsights(data)
  const status = overallStatus(insights)
  const s = toneStyle[status.tone]

  return (
    <Panel
      title="Xaaladda iskuulka maanta"
      subtitle="Wax kasta oo u baahan feejignaan, si toos ah"
      icon={Sparkles}
      action={
        <span className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-medium sm:inline-flex ${s.box} ${s.text}`}>
          {status.label}
        </span>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {insights.map((i) => {
          const t = toneStyle[i.tone]
          const Icon = t.icon
          return (
            <div key={i.id} className={`flex gap-3 rounded-xl p-3.5 ${t.box}`}>
              <Icon size={18} className={`mt-0.5 shrink-0 ${t.text}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{i.title}</p>
                {i.detail && <p className="mt-0.5 text-xs text-ink-muted">{i.detail}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

export default InsightsPanel
