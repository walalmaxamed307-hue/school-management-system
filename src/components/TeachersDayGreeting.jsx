import { useEffect, useState } from 'react'
import { Award, Sparkles, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const TEACHERS_DAY_KEY = 'iskuulcaawiye-teachers-day-greeting'

function isTeachersDayWindow() {
  const now = new Date()
  return now.getMonth() === 10 && [21, 22].includes(now.getDate())
}

function TeachersDayGreeting() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user || !['admin', 'teacher'].includes(user.role) || !isTeachersDayWindow()) return

    const today = new Date().toISOString().slice(0, 10)
    const key = `${TEACHERS_DAY_KEY}:${user.id}:${today}`
    if (localStorage.getItem(key)) return

    const timer = window.setTimeout(() => {
      localStorage.setItem(key, 'seen')
      setOpen(true)
    }, 700)
    return () => window.clearTimeout(timer)
  }, [user])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="teachers-day-title">
      <section className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-5 shadow-2xl shadow-slate-950/30 sm:p-7">
        <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-amber-300/35 blur-2xl" />
        <div className="absolute -bottom-14 -right-10 h-40 w-40 rounded-full bg-emerald-400/25 blur-2xl" />

        <button type="button" onClick={() => setOpen(false)} aria-label="Xir hambalyada" className="absolute right-4 top-4 z-10 rounded-xl p-2 text-ink-muted transition hover:bg-white/80 hover:text-ink">
          <X size={20} />
        </button>

        <div className="relative">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/35 ring-4 ring-white">
            <Award size={42} strokeWidth={2.1} />
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-amber-600">
            <Sparkles size={18} fill="currentColor" />
            <span className="text-xs font-black uppercase tracking-[0.18em]">21 November</span>
            <Sparkles size={18} fill="currentColor" />
          </div>
          <h2 id="teachers-day-title" className="mt-3 text-center text-2xl font-black tracking-tight text-ink sm:text-3xl">
            Hambalyo Maalinta Macallinka Soomaaliyeed!
          </h2>
          <p className="mt-1 text-center text-2xl" aria-hidden="true">🎉 🇸🇴 🌹</p>

          <div className="mt-5 rounded-2xl border border-amber-100 bg-white/75 p-4 text-center shadow-sm sm:p-5">
            <p className="text-sm leading-6 text-ink-muted">
              Waxaan hambalyo iyo bogaadin kal iyo laab ah u diraynaa dhammaan macallimiinta Soomaaliyeed ee waqtigooda, aqoontooda iyo dadaalkooda u hura dhismaha mustaqbalka jiilasha soo koraya.
            </p>
            <p className="mt-4 font-bold leading-6 text-primary-700">
              Macallinow, waxaad tahay iftiinka aqoonta iyo aasaaska horumarka bulshada.
            </p>
          </div>

          <p className="mt-5 text-center text-sm leading-6 text-ink-muted">
            Mahadsanidiin dadaalkiinna, dulqaadkiinna iyo doorkiinna qiimaha leh.
          </p>
          <p className="mt-3 text-center text-base font-extrabold text-primary-700">🌹 Hambalyo Maalintiinna!</p>
          <p className="mt-1 text-center text-xs font-bold uppercase tracking-[0.13em] text-ink-muted">IskuulCaawiye — Garabkiinna Waxbarashada</p>

          <button type="button" onClick={() => setOpen(false)} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-primary-700/20 transition hover:-translate-y-0.5 hover:from-primary-700 hover:to-emerald-700">
            <Sparkles size={17} /> Mahadsanid
          </button>
        </div>
      </section>
    </div>
  )
}

export default TeachersDayGreeting
