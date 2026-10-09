import { ShieldAlert, CalendarX, Wallet, FileX, PartyPopper } from 'lucide-react'
import Panel from './Panel'

const TYPE = {
  attendance: { label: 'Attendance', icon: CalendarX },
  fees: { label: 'Lacag', icon: Wallet },
  results: { label: 'Natiijo', icon: FileX },
}
const LEVEL = {
  high: { label: 'Khatar sare', cls: 'bg-danger-50 text-danger-500' },
  medium: { label: 'Khatar dhexe', cls: 'bg-warning-50 text-warning-500' },
}

function RiskSection({ data }) {
  const r = data.risk
  const t = r.thresholds

  if (r.total === 0) {
    return (
      <Panel title="Ardayda khatarta ah" subtitle="Attendance + lacag + natiijo" icon={ShieldAlert}>
        <div className="flex flex-col items-center gap-2 rounded-xl bg-primary-50 px-4 py-8 text-center">
          <PartyPopper className="text-primary-600" />
          <p className="text-sm font-medium text-ink">Arday khatar ah ma jiro</p>
          <p className="text-xs text-ink-muted">Dhammaan ardaydu waxay ku jiraan xaalad wanaagsan.</p>
        </div>
      </Panel>
    )
  }

  return (
    <Panel
      title="Ardayda khatarta ah"
      subtitle="Ardayda u baahan feejignaan dheeraad ah"
      icon={ShieldAlert}
      action={
        <div className="text-right">
          <p className="text-3xl font-semibold leading-none text-danger-500">{r.total}</p>
          <p className="mt-1 text-[11px] text-ink-muted">{r.highCount} khatar sare</p>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(TYPE).map(([key, meta]) => (
          <span key={key} className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-xs text-ink">
            <meta.icon size={13} className="text-ink-muted" />
            {meta.label}: <b className="font-semibold">{r.byType[key]}</b>
          </span>
        ))}
      </div>

      <ul className="grid gap-3 md:grid-cols-2">
        {r.top.map((s) => (
          <li key={`${s.name}-${s.className}-${s.sectionName}`} className="rounded-xl border border-border p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{s.name}</p>
                <p className="text-xs text-ink-muted">{s.className}{s.sectionName ? ` · ${s.sectionName}` : ''}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${LEVEL[s.level].cls}`}>{LEVEL[s.level].label}</span>
            </div>
            <ul className="mt-2 flex flex-col gap-1">
              {s.reasons.map((reason) => {
                const Icon = TYPE[reason.type].icon
                return (
                  <li key={reason.type} className="flex items-start gap-2 text-xs text-ink">
                    <Icon size={13} className="mt-0.5 shrink-0 text-ink-muted" />
                    <span>{reason.text}</span>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>

      {r.total > r.top.length && (
        <p className="mt-3 text-xs text-ink-muted">Waxaa la muujiyay {r.top.length} ka mid ah {r.total} (kuwa ugu khatarsan).</p>
      )}
      {t && (
        <p className="mt-2 text-[11px] text-ink-muted">
          Xeerarka: attendance &lt; {t.attendanceMinRatePercent}% ({t.attendanceWindowDays} maalmood) · lacag {t.feeMinUnpaidMonths}+ bilood oo aan la bixin · {t.resultMinFailedExams}+ imtixaan oo uu dhacay.
        </p>
      )}
    </Panel>
  )
}

export default RiskSection
