import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui'
import ChangePasswordModal from '@/components/ChangePasswordModal'
import OwnerHero from '@/features/owner/OwnerHero'
import InsightsPanel from '@/features/owner/InsightsPanel'
import TodaySnapshot from '@/features/owner/TodaySnapshot'
import AttendanceSection from '@/features/owner/AttendanceSection'
import FeesSection from '@/features/owner/FeesSection'
import ResultsSection from '@/features/owner/ResultsSection'
import GrowthSection from '@/features/owner/GrowthSection'
import RiskSection from '@/features/owner/RiskSection'

// Xogta si toos ah ayaa loo cusboonaysiiyaa 5 daqiiqo kasta, si milkiilaha
// uusan gacanta u cusboonaysiin u baahnayn.
const AUTO_REFRESH_MS = 5 * 60 * 1000

function Skeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-56 rounded-3xl bg-border" />
      <div className="h-28 rounded-2xl bg-border" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-44 rounded-2xl bg-border" />
        ))}
      </div>
      <div className="h-72 rounded-2xl bg-border" />
    </div>
  )
}

// Dashboard-ka MILKIILAHA iskuulka (READ-ONLY): xaaladda iskuulka maanta, oo
// ay ku jiraan joogitaanka, macallimiinta, lacagta, natiijooyinka iyo ardayda
// khatarta ah — milkiilaha qofna ma wacayo si uu u ogaado.
function OwnerDashboardPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const mounted = useRef(true)

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const d = await api.get('/owner/overview')
      if (!mounted.current) return
      setData(d)
      setError('')
    } catch (err) {
      if (mounted.current) setError(err.message)
    } finally {
      if (mounted.current) setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    load()
    const timer = setInterval(load, AUTO_REFRESH_MS)
    return () => {
      mounted.current = false
      clearInterval(timer)
    }
  }, [load])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const hero = (
    <OwnerHero
      data={data}
      refreshing={refreshing}
      onRefresh={load}
      onPassword={() => setPasswordOpen(true)}
      onLogout={handleLogout}
    />
  )

  let body
  if (!data && !error) {
    body = <Skeleton />
  } else if (!data && error) {
    body = (
      <div className="flex flex-col gap-4">
        {hero}
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-sm font-medium text-ink">Xogta lama soo qaadi karin</p>
          <p className="mt-1 text-xs text-ink-muted">{error}</p>
          <Button className="mt-4" onClick={load}>
            Isku day mar kale
          </Button>
        </div>
      </div>
    )
  } else if (data.noActiveYear) {
    body = (
      <div className="flex flex-col gap-4">
        {hero}
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-ink-muted">
          Sanad dugsiyeed firfircoon weli lama furin. Marka admin-ku furo, xogta halkan ayay ka muuqan doontaa.
        </div>
      </div>
    )
  } else {
    body = (
      <div className="flex flex-col gap-4">
        {hero}
        {error && (
          <p className="rounded-xl bg-warning-50 px-4 py-2 text-xs text-warning-500">
            Cusboonaysiinta ugu dambeeyay way fashilantay ({error}) — xogta hoose waa tii hore.
          </p>
        )}
        <InsightsPanel data={data} />
        <TodaySnapshot data={data} />
        <AttendanceSection data={data} />
        <FeesSection data={data} />
        <div className="grid gap-4 lg:grid-cols-1">
          <ResultsSection data={data} />
        </div>
        <GrowthSection data={data} />
        <RiskSection data={data} />
        <p className="pb-4 pt-2 text-center text-[11px] text-ink-muted">
          Dashboard-kan waa akhris-kaliya (read-only). Xogta waxaa si toos ah loo cusboonaysiiyaa 5 daqiiqo kasta.
        </p>
      </div>
    )
  }

  return (
    <>
      {body}
      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  )
}

export default OwnerDashboardPage
