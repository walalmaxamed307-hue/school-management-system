import { TONE_COLOR } from './ownerUtils'

// Giraan ah (ring) oo muujinaya boqolkiiba — SVG nadiif ah, lib dheeraad ah
// ma u baahna. value=null => "—" (xog weli ma jirto, MA aha 0%).
function Gauge({ value, tone = 'neutral', size = 120, stroke = 11, caption }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = value === null || value === undefined ? 0 : Math.max(0, Math.min(100, value))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={TONE_COLOR[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 900ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold leading-none text-ink">{value === null || value === undefined ? '—' : `${value}%`}</span>
        {caption && <span className="mt-1 text-[11px] text-ink-muted">{caption}</span>}
      </div>
    </div>
  )
}

export default Gauge
