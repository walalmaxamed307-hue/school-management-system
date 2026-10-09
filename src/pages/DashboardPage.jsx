import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, ArrowRight, BookOpen, CalendarCheck, GraduationCap, RefreshCw, Users, Wallet } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { useSchoolSettings } from '@/hooks/useSchoolSettings'
import { Button, Card } from '@/components/ui'
import Gauge from '@/features/owner/Gauge'
import Panel from '@/features/owner/Panel'
import { rateTone } from '@/features/owner/ownerUtils'
import RiskStudentsModal from '@/components/RiskStudentsModal'

const tones = { primary: 'bg-primary-50 text-primary-600', warning: 'bg-warning-50 text-warning-500', danger: 'bg-danger-50 text-danger-500' }

function Metric({ icon: Icon, label, value, note, tone = 'primary', onClick }) {
  const content = <Card className={`h-full p-4 ${onClick ? 'transition-colors hover:border-primary-500 hover:bg-primary-50' : ''}`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>{note && <p className="mt-1 text-xs text-ink-muted">{note}</p>}</div><span className={`rounded-xl p-2.5 ${tones[tone]}`}><Icon size={20}/></span></div></Card>
  return onClick ? <button type="button" onClick={onClick} className="w-full text-left">{content}</button> : content
}

function totalAttendance(today) {
  const sessions = [today.before_break, today.after_break]
  const attended = sessions.reduce((sum, item) => sum + item.present + item.late, 0)
  const marked = sessions.reduce((sum, item) => sum + item.present + item.late + item.absent + item.excused, 0)
  return { attended, marked, percent: marked ? Math.round((attended / marked) * 100) : null }
}

function DashboardPage() {
  const { user } = useAuth()
  const { settings, academicYears } = useSchoolSettings()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const [stats, setStats] = useState(null)
  const [risk, setRisk] = useState(null)
  const [riskOpen, setRiskOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const next = await api.get('/dashboard/stats')
      setStats(next)
      if (isAdmin) api.get('/dashboard/risk-students').then(setRisk).catch(() => {})
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setRefreshing(false)
    }
  }, [isAdmin, showToast])

  useEffect(() => { load() }, [load])
  if (!stats) return <div className="py-10 text-center text-sm text-ink-muted">Dashboard-ka waa la soo rarayaa...</div>

  const attendance = totalAttendance(stats.attendanceToday)
  const fees = stats.feesSummary || {}
  const pendingFees = (fees.unpaid || 0) + (fees.partial || 0)
  const year = academicYears.find((item) => item.status === 'active')?.label || stats.academicYear
  const chart = [
    { session: 'Kahor break', Jooga: stats.attendanceToday.before_break.present, Daahay: stats.attendanceToday.before_break.late, Maqan: stats.attendanceToday.before_break.absent },
    { session: 'Kadib break', Jooga: stats.attendanceToday.after_break.present, Daahay: stats.attendanceToday.after_break.late, Maqan: stats.attendanceToday.after_break.absent },
  ]
  const actions = isAdmin
    ? [{ label: 'Maamul ardayda', to: '/students', icon: Users }, { label: 'Calaamadee joogitaanka', to: '/attendance', icon: CalendarCheck }, { label: 'Maamul lacagaha', to: '/fees', icon: Wallet }]
    : [{ label: 'Calaamadee joogitaanka', to: '/attendance', icon: CalendarCheck }, { label: 'Geli natiijooyinka', to: '/exam-results', icon: GraduationCap }, { label: 'Post cashar ama assignment', to: '/assignments', icon: BookOpen }]

  return <div className="space-y-5">
    <section className="relative overflow-hidden rounded-3xl p-5 text-white shadow-lg sm:p-7" style={{ background: 'linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)' }}>
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"/>
      <div className="relative flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-white/75">Ku soo dhawoow, {user?.name}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{settings.name || 'Dashboard-ka iskuulka'}</h1><p className="mt-2 text-sm text-white/75">{year ? `Sanadka dugsiyeedka ${year}` : 'Xaaladda iskuulka maanta'}</p></div><button type="button" onClick={load} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white hover:bg-white/25 disabled:opacity-60"><RefreshCw size={16} className={refreshing ? 'animate-spin' : ''}/>Cusboonaysii</button></div>
      <div className="relative mt-6 grid max-w-xl grid-cols-3 gap-2 sm:gap-3"><div className="rounded-xl bg-white/12 p-3"><p className="text-xl font-semibold">{stats.totalStudents}</p><p className="text-xs text-white/75">Arday</p></div><div className="rounded-xl bg-white/12 p-3"><p className="text-xl font-semibold">{stats.totalTeachers}</p><p className="text-xs text-white/75">Macallimiin</p></div><div className="rounded-xl bg-white/12 p-3"><p className="text-xl font-semibold">{attendance.percent === null ? '—' : `${attendance.percent}%`}</p><p className="text-xs text-white/75">Joogitaanka maanta</p></div></div>
    </section>

    <div className={`grid gap-3 sm:grid-cols-2 ${isAdmin ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
      <Metric icon={Users} label="Ardayda guud" value={stats.totalStudents} note="Diiwaangashan"/>
      <Metric icon={GraduationCap} label="Macallimiinta" value={stats.totalTeachers} note="Firfircoon"/>
      <Metric icon={CalendarCheck} label="Joogitaanka maanta" value={attendance.percent === null ? '—' : `${attendance.percent}%`} note={attendance.marked ? `${attendance.attended} / ${attendance.marked} calaamado` : 'Weli lama calaamadin'} tone={attendance.percent !== null && attendance.percent < 75 ? 'warning' : 'primary'}/>
      {isAdmin && <Metric icon={AlertTriangle} label="Risk students" value={risk?.total ?? '—'} note={risk ? 'Guji si aad u aragto faahfaahinta' : 'Waa la soo rarayaa'} tone={risk?.highCount ? 'danger' : risk?.total ? 'warning' : 'primary'} onClick={() => risk && setRiskOpen(true)}/>} 
    </div>

    <div className="grid gap-5 xl:grid-cols-5">
      <Panel title="Joogitaanka maanta" subtitle="Labada break oo la isku daray" icon={CalendarCheck} className="xl:col-span-3"><div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center"><Gauge value={attendance.percent} tone={rateTone(attendance.percent)} size={112} stroke={10} caption="maalinta oo dhan"/><div className="text-sm"><p className="font-medium text-ink">{attendance.marked ? `${attendance.attended} ka mid ah ${attendance.marked} calaamado ayaa jooga` : 'Weli lama calaamadin'}</p><p className="mt-1 text-xs text-ink-muted">Present iyo late ayaa loo tiriyaa jooga; absent iyo excused waxay ku jiraan tirada guud.</p></div></div><ResponsiveContainer width="100%" height={230}><BarChart data={chart}><CartesianGrid vertical={false} stroke="var(--color-border)"/><XAxis dataKey="session" tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12 }}/><Bar dataKey="Jooga" stackId="attendance" fill="var(--color-primary-500)"/><Bar dataKey="Daahay" stackId="attendance" fill="var(--color-warning-500)"/><Bar dataKey="Maqan" stackId="attendance" fill="var(--color-danger-500)" radius={[6, 6, 0, 0]}/></BarChart></ResponsiveContainer></Panel>
      <div className="grid gap-3 sm:grid-cols-2 xl:col-span-2 xl:grid-cols-1">{isAdmin && <Panel title="Lacagaha bishan" subtitle={`${pendingFees} arday ayaa sugaya`} icon={Wallet}><p className="text-3xl font-semibold text-ink">${stats.totalCollectedThisMonth}</p><p className="mt-1 text-xs text-ink-muted">Lacagta la ururiyey bishan.</p><Button className="mt-4 w-full" size="sm" onClick={() => navigate('/fees')}>Eeg fees-ka</Button></Panel>}<Panel title="Hawlaha degdegga ah" subtitle="Tag meesha aad hadda u baahan tahay" icon={BookOpen}>{actions.map((action) => { const Icon = action.icon; return <button key={action.to} type="button" onClick={() => navigate(action.to)} className="flex w-full items-center gap-3 border-b border-border py-3 text-left text-sm font-medium text-ink last:border-0"><Icon size={17} className="text-primary-600"/><span className="flex-1">{action.label}</span><ArrowRight size={16} className="text-ink-muted"/></button> })}</Panel></div>
    </div>
    {isAdmin && <RiskStudentsModal open={riskOpen} onClose={() => setRiskOpen(false)} data={risk}/>} 
  </div>
}

export default DashboardPage
