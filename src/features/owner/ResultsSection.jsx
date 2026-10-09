import { Award } from 'lucide-react'
import Gauge from './Gauge'
import Panel, { Bar, EmptyState } from './Panel'
import { rateTone } from './ownerUtils'

function ResultsSection({ data }) {
  const e = data.latestExam
  if (!e) {
    return (
      <Panel title="Natiijada imtixaanka" subtitle="Imtixaanka ugu dambeeyay ee la daabacay" icon={Award}>
        <EmptyState>Weli natiijo la daabacay ma jirto.</EmptyState>
      </Panel>
    )
  }
  const tone = e.passRatePercent === null ? 'neutral' : e.passRatePercent >= 80 ? 'good' : e.passRatePercent >= 60 ? 'warn' : 'bad'

  return (
    <Panel title={`Natiijada — ${e.name}`} subtitle={`Gudbis = wadarta ≥ ${e.passMark}`} icon={Award}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex shrink-0 items-center gap-4">
          <Gauge value={e.passRatePercent} tone={tone} size={120} stroke={11} caption="gudbay" />
          <div className="text-sm">
            <p className="font-medium text-ink">{e.passed} / {e.students} arday</p>
            <p className="mt-1 text-xs text-ink-muted">Dhacay: {e.failed}</p>
            {e.averageTotal !== null && <p className="text-xs text-ink-muted">Celcelis: {e.averageTotal}</p>}
          </div>
        </div>
        <ul className="flex min-w-0 flex-1 flex-col gap-3">
          {e.byClass.map((c) => (
            <li key={c.classId}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-ink">{c.className}</span>
                <span className="text-ink-muted">{c.passRatePercent}% · {c.passed}/{c.students}</span>
              </div>
              <Bar value={c.passRatePercent} tone={rateTone(c.passRatePercent)} height={7} />
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  )
}

export default ResultsSection
