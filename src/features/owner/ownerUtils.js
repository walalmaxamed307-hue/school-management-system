// Caawiyayaasha dashboard-ka milkiilaha (owner): taariikh Soomaali, lacag,
// midabaynta, iyo `buildInsights` — "wax u baahan feejignaan" oo laga soo
// saaray xogta /owner/overview (pure, test-gareysan).

const SO_DAYS = ['Axad', 'Isniin', 'Talaado', 'Arbaco', 'Khamiis', 'Jimce', 'Sabti']
const SO_MONTHS = [
  'Janaayo', 'Febraayo', 'Maarso', 'Abriil', 'Maajo', 'Juun',
  'Luuliyo', 'Ogosto', 'Sebtembar', 'Oktoobar', 'Nofembar', 'Desembar',
]
const SO_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Abr', 'Maj', 'Jun', 'Lul', 'Ogs', 'Seb', 'Okt', 'Nof', 'Des']

export function formatLongDate(d = new Date()) {
  return `${SO_DAYS[d.getDay()]}, ${d.getDate()} ${SO_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function greeting(d = new Date()) {
  const h = d.getHours()
  if (h < 12) return 'Subax wanaagsan'
  if (h < 18) return 'Galab wanaagsan'
  return 'Fiid wanaagsan'
}

export function formatTime(iso) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const money = (n) => `$${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

// '2026-10' -> 'Okt'
export function monthShort(key) {
  return SO_MONTHS_SHORT[Number(key.slice(5, 7)) - 1] ?? key
}

// '2026-10-09' -> '9 Okt'
export function dayShort(key) {
  return `${Number(key.slice(8, 10))} ${monthShort(key)}`
}

// Midab ahaan: good (>=90) / warn (>=75) / bad (<75) / neutral (xog la'aan).
export function rateTone(percent) {
  if (percent === null || percent === undefined) return 'neutral'
  if (percent >= 90) return 'good'
  if (percent >= 75) return 'warn'
  return 'bad'
}

export const TONE_COLOR = {
  good: 'var(--color-primary-600)',
  warn: 'var(--color-warning-500)',
  bad: 'var(--color-danger-500)',
  neutral: 'var(--color-ink-muted)',
}

const groupLabel = (g) => `${g.className}${g.sectionName ? ` ${g.sectionName}` : ''}`
const joinNames = (list, max = 3) =>
  list.length <= max ? list.join(', ') : `${list.slice(0, max).join(', ')} +${list.length - max}`

// Soo celisaa [{ id, tone: 'good'|'warn'|'bad'|'info', title, detail }].
export function buildInsights(d) {
  const out = []
  const push = (tone, title, detail = '') => out.push({ id: `${out.length}`, tone, title, detail })

  const sessions = [
    ['Kahor Break', d.attendanceToday.before, d.attendancePending.before],
    ['Kadib Break', d.attendanceToday.after, d.attendancePending.after],
  ]
  const anyMarked = sessions.some(([, s]) => s.marked > 0)

  if (!anyMarked) {
    push('info', 'Joogitaanka weli lama qaadin', 'Macallimiintu weli ma calaamadin joogitaanka ardayda maanta.')
  } else {
    for (const [label, s, pending] of sessions) {
      // Qayb la qaaday + qayb haray = fasallo la illaabay. (Haddii session-ku
      // gebi ahaanba aan la bilaabin, ma ahan digniin — maalinta weli way socotaa.)
      if (s.marked > 0 && pending.length > 0) {
        push('warn', `${label}: ${pending.length} fasal joogitaankooda weli lama qaadin`, joinNames(pending.map(groupLabel)))
      }
      if (s.percent !== null && s.percent < 75) {
        push(s.percent < 60 ? 'bad' : 'warn', `Joogitaanka ${label} waa ${s.percent}%`, `${s.attended} ka mid ah ${s.marked} arday ayaa joogay.`)
      }
    }
    const lowClasses = d.attendanceByClass.filter((c) => [c.before, c.after].some((s) => s.marked >= 5 && s.percent < 60))
    if (lowClasses.length > 0) {
      push('warn', `${lowClasses.length} fasal oo joogitaankoodu aad u hooseeyo`, joinNames(lowClasses.map((c) => c.className)))
    }
  }

  const t = d.teachersToday
  if (t.total > 0) {
    if (t.absent > 0) push('warn', `${t.absent} macalin ayaa maqan maanta`, `${t.present + t.late} ka mid ah ${t.total} ayaa jooga.`)
    if (t.notMarked === t.total) push('info', 'Joogitaanka macallimiinta weli lama qaadin')
    else if (t.notMarked > 0) push('info', `${t.notMarked} macalin weli lama calaamadin`)
  }

  const f = d.fees
  if (f.expected > 0 && f.collectionRatePercent !== null) {
    const rate = f.collectionRatePercent
    push(rate < 40 ? 'bad' : rate < 70 ? 'warn' : 'good', `Lacagta bisha: ${rate}% la ururiyay`, `La ururiyay ${money(f.collected)}, hadhay ${money(f.outstanding)}.`)
  }

  if (d.risk.total > 0) {
    push(d.risk.highCount > 0 ? 'bad' : 'warn', `${d.risk.total} arday oo khatar ah`, d.risk.highCount > 0 ? `${d.risk.highCount} ka mid ah waa khatar sare (2+ sabab).` : 'Hal sabab ayaa mid kasta u gaar ah.')
  } else {
    push('good', 'Arday khatar ah ma jiro')
  }

  if (d.latestExam && d.latestExam.passRatePercent !== null) {
    const r = d.latestExam.passRatePercent
    if (r < 60) push('warn', `${d.latestExam.name}: ${r}% oo keliya ayaa gudbay`, `${d.latestExam.failed} arday ayaa dhacay.`)
    else if (r >= 80) push('good', `${d.latestExam.name}: ${r}% ayaa gudbay`)
  }

  if (d.newStudents.today > 0) push('good', `${d.newStudents.today} arday cusub ayaa maanta ku soo biiray`)

  return out
}

// Guud ahaan xaaladda maanta (cinwaanka panel-ka).
export function overallStatus(insights) {
  if (insights.some((i) => i.tone === 'bad')) return { tone: 'bad', label: 'Wax degdeg ah ayaa u baahan feejignaan' }
  if (insights.some((i) => i.tone === 'warn')) return { tone: 'warn', label: 'Qaar ka mid ah waxyaabaha waxay u baahan yihiin hubin' }
  return { tone: 'good', label: 'Wax walba waa caadi' }
}
