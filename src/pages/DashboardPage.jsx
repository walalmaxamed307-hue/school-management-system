import { useEffect, useState } from 'react'
import { Users, GraduationCap, Wallet, UserCheck, ShieldAlert } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui'
import RiskStudentsModal from '@/components/RiskStudentsModal'

const toneClasses = {
  primary: 'bg-primary-50 text-primary-600',
  warning: 'bg-warning-50 text-warning-500',
  danger: 'bg-danger-50 text-danger-500',
  neutral: 'bg-canvas text-ink-muted',
}

function StatCard({ label, value, icon: Icon, tone = 'neutral', onClick }) {
  const card = (
    <Card className={`flex items-center gap-3 ${onClick ? 'transition-colors hover:border-primary-500' : ''}`}>
      <div className={`shrink-0 rounded-lg p-2.5 ${toneClasses[tone]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-lg font-medium text-ink">{value}</p>
        <p className="truncate text-xs text-ink-muted">{label}</p>
      </div>
    </Card>
  )
  if (!onClick) return card
  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {card}
    </button>
  )
}

// Dashboard-ku wuxuu isticmaalaa hal wicitaan (GET /dashboard/stats) — backend-ku
// isagu ayaa xisaabiya wadarta (ma aha frontend-ku isagoo ku shubaya
// dhammaan ardayda + attendance + fees, sida hore).
function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  // Risk-ku wuxuu leeyahay wicitaankiisa gooni ah (admin kaliya) — haddii uu
  // fashilo, dashboard-ka kale wuu sii shaqeynayaa (box-ku wuxuu muujiyaa "—").
  const [risk, setRisk] = useState(null)
  const [riskOpen, setRiskOpen] = useState(false)

  useEffect(() => {
    if (!isAdmin) return undefined
    let cancelled = false
    api
      .get('/dashboard/risk-students')
      .then((d) => {
        if (!cancelled) setRisk(d)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isAdmin])

  useEffect(() => {
    let cancelled = false
    api
      .get('/dashboard/stats')
      .then((d) => {
        if (!cancelled) setStats(d)
      })
      .catch((err) => {
        if (!cancelled) showToast(err.message, 'error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading || !stats) {
    return (
      <div>
        <h1 className="mb-4 text-xl font-medium text-ink">Dashboard</h1>
        <p className="text-sm text-ink-muted">Waa la soo rarayaa...</p>
      </div>
    )
  }

  const beforeBreak = stats.attendanceToday.before_break
  const afterBreak = stats.attendanceToday.after_break
  const totalPresent = beforeBreak.present + afterBreak.present
  const totalMarked =
    beforeBreak.present + beforeBreak.absent + beforeBreak.late + beforeBreak.excused +
    afterBreak.present + afterBreak.absent + afterBreak.late + afterBreak.excused
  const presentRate = totalMarked > 0 ? totalPresent / totalMarked : null

  const { unpaid = 0, partial = 0 } = stats.feesSummary ?? {}
  const totalFeeStudents = (stats.feesSummary?.paid ?? 0) + partial + unpaid
  const unpaidRate = totalFeeStudents > 0 ? (unpaid + partial) / totalFeeStudents : 0
  const feesTone = unpaidRate === 0 ? 'primary' : unpaidRate <= 0.3 ? 'warning' : 'danger'

  const monthName = new Date(stats.month + '-01').toLocaleDateString('en-US', { month: 'long' })

  // % ardayda joogta maanta (arday ahaan: ugu yaraan hal session present/late).
  const todayStudents = stats.attendanceTodayStudents
  const presentPercent = todayStudents?.ratePercent ?? null
  const presentTone =
    presentPercent === null ? 'neutral' : presentPercent >= 90 ? 'primary' : presentPercent >= 75 ? 'warning' : 'danger'
  const presentLabel =
    presentPercent === null
      ? 'Joogitaanka maanta (weli lama calaamadin)'
      : `Joogitaanka maanta (${todayStudents.attended}/${todayStudents.marked} arday)`

  const riskCount = risk?.total ?? null
  const riskTone =
    riskCount === null ? 'neutral' : riskCount === 0 ? 'primary' : risk.highCount > 0 ? 'danger' : 'warning'

  // Kahor Break iyo Kadib Break — labadaba si gooni ah ayey isu taagayaan
  // chart-ka, ma aha isku darsan (arday hal session ka qeyb-galay uma
  // baahna inuu ku jiro tirada session-ka kale).
  const chartData = [
    {
      session: 'Kahor Break',
      Present: beforeBreak.present,
      Absent: beforeBreak.absent,
      Late: beforeBreak.late,
    },
    {
      session: 'Kadib Break',
      Present: afterBreak.present,
      Absent: afterBreak.absent,
      Late: afterBreak.late,
    },
  ]

  return (
    <div>
      <h1 className="mb-4 text-xl font-medium text-ink">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Ardayda guud" value={stats.totalStudents} icon={Users} />
        <StatCard label="Macallimiinta" value={stats.totalTeachers} icon={GraduationCap} />
        <StatCard label="Lacag aan la bixin (bishan)" value={unpaid + partial} icon={Wallet} tone={feesTone} />
        <StatCard
          label={`La ururiyay — ${monthName}`}
          value={`$${stats.totalCollectedThisMonth}`}
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          label={presentLabel}
          value={presentPercent === null ? '—' : `${presentPercent}%`}
          icon={UserCheck}
          tone={presentTone}
        />
        {isAdmin && (
          <StatCard
            label={riskCount === null ? 'Ardayda khatarta ah' : 'Ardayda khatarta ah — guji'}
            value={riskCount === null ? '—' : riskCount}
            icon={ShieldAlert}
            tone={riskTone}
            onClick={riskCount === null ? undefined : () => setRiskOpen(true)}
          />
        )}
      </div>
      {isAdmin && <RiskStudentsModal open={riskOpen} onClose={() => setRiskOpen(false)} data={risk} />}

      <Card className="mt-4 overflow-hidden">
        <p className="mb-4 truncate text-sm font-medium text-ink">
          Attendance maanta — Kahor Break iyo Kadib Break (
          {totalMarked > 0 ? `${Math.round(presentRate * 100)}% present` : 'weli lama calaamadin'})
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="session" stroke="var(--color-ink-muted)" fontSize={12} />
            <YAxis
              stroke="var(--color-ink-muted)"
              fontSize={12}
              allowDecimals={false}
              width={36}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Present" fill="var(--color-primary-500)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Absent" fill="var(--color-danger-500)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Late" fill="var(--color-warning-500)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

export default DashboardPage
