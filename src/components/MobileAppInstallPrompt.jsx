import { useEffect, useState } from 'react'
import { Download, ShieldCheck, Smartphone, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const APK_URL = 'https://expo.dev/artifacts/eas/8JHItf1nviMR_telPZnMY3OLMhKR4bU3gOer7jTc59g.apk'

// Download remains a deliberate second action. The first click shows the safe install steps.
function MobileAppInstallPrompt({ landing = false }) {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const canShow = landing || user?.role === 'admin' || user?.role === 'teacher'

  useEffect(() => {
    if (!canShow) return undefined
    const timer = window.setTimeout(() => setVisible(true), 4000)
    return () => window.clearTimeout(timer)
  }, [canShow, landing, user?.id, user?.role])

  if (!visible || !canShow) return null

  return <>
    <aside className="fixed left-1/2 top-3 z-[60] flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border border-primary-100 bg-surface/95 px-3 py-2.5 shadow-xl shadow-slate-950/10 backdrop-blur-xl dark:border-primary-500/25 dark:bg-[#10202d]/95" role="status">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/15"><Smartphone size={19} /></span>
      <div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-ink">IskuulCaawiye app</p><p className="truncate text-[11px] text-ink-muted">Ku shaqee si degdeg ah taleefankaaga</p></div>
      <button onClick={() => setShowSteps(true)} className="shrink-0 rounded-xl bg-primary-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-primary-700">Install</button>
      <button onClick={() => setVisible(false)} className="shrink-0 rounded-lg p-1.5 text-ink-muted hover:bg-canvas hover:text-ink" aria-label="Xir"><X size={17} /></button>
    </aside>
    {showSteps && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="install-app-title">
      <section className="w-full max-w-md overflow-hidden rounded-2xl bg-surface shadow-2xl">
        <div className="relative bg-gradient-to-br from-primary-700 to-primary-500 px-6 pb-7 pt-6 text-white"><button onClick={() => setShowSteps(false)} className="absolute right-4 top-4 rounded-lg p-1 text-white/75 hover:bg-white/10 hover:text-white" aria-label="Xir"><X size={20} /></button><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Smartphone size={25} /></div><p className="text-xs font-semibold uppercase tracking-[.18em] text-white/75">IskuulCaawiye Mobile</p><h2 id="install-app-title" className="mt-1 text-xl font-bold">Ku rakib app-ka</h2><p className="mt-2 text-sm leading-6 text-white/85">Attendance, fees, natiijooyin iyo shaqooyinka iskuulka ku maamul taleefankaaga.</p></div>
        <div className="p-5"><div className="mb-4 flex items-start gap-3 rounded-xl bg-primary-50 p-3 text-sm text-primary-700"><ShieldCheck className="mt-0.5 shrink-0" size={18} /><p>APK-ga waxaa loogu talagalay Android. Raac tallaabooyinka hoose.</p></div><ol className="space-y-3 text-sm leading-5 text-ink-muted"><li className="flex gap-3"><b className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs text-primary-700">1</b><span>Taabo <b className="text-ink">Download APK</b> si file-ku u bilaabo.</span></li><li className="flex gap-3"><b className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs text-primary-700">2</b><span>Marka download-ku dhammaado, taabo <b className="text-ink">Open</b>.</span></li><li className="flex gap-3"><b className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs text-primary-700">3</b><span>Taabo <b className="text-ink">Install</b>; haddii loo baahdo dooro <b className="text-ink">Install anyway</b>.</span></li><li className="flex gap-3"><b className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs text-primary-700">4</b><span>Markuu dhamaado, taabo <b className="text-ink">Open</b>. App-ku wuxuu ka muuqanayaa apps-ka telefoonkaaga.</span></li></ol><a href={APK_URL} target="_blank" rel="noreferrer" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"><Download size={18} /> Download APK</a><button onClick={() => setShowSteps(false)} className="mt-3 w-full py-2 text-sm font-medium text-ink-muted hover:text-ink">Xir</button></div>
      </section>
    </div>}
  </>
}

export default MobileAppInstallPrompt
