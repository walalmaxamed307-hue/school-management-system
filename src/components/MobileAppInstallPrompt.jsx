import { useEffect, useState } from 'react'
import { Download, ShieldCheck, Smartphone, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const APK_URL = 'https://expo.dev/artifacts/eas/9kD1fokAin0Kbz1kn_lDevT5hQTIQT5G8FAKcawa_-k.apk'

// This is deliberately shown only after staff enter the private system. The
// first click only opens instructions; the APK is never downloaded silently.
function MobileAppInstallPrompt() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [showSteps, setShowSteps] = useState(false)

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'teacher') return undefined
    const timer = window.setTimeout(() => setOpen(true), 3500)
    return () => window.clearTimeout(timer)
  }, [user?.id, user?.role])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 p-3 sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="install-app-title">
      <section className="w-full max-w-md overflow-hidden rounded-2xl bg-surface shadow-2xl">
        <div className="relative bg-gradient-to-br from-primary-700 to-primary-500 px-6 pb-7 pt-6 text-white">
          <button onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-lg p-1 text-white/75 hover:bg-white/10 hover:text-white" aria-label="Xir"><X size={20} /></button>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Smartphone size={25} /></div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-white/75">IskuulCaawiye Mobile</p>
          <h2 id="install-app-title" className="mt-1 text-xl font-bold">Ku rakib app-ka xawaare sare</h2>
          <p className="mt-2 text-sm leading-6 text-white/85">Ku maamul attendance, natiijooyin iyo shaqooyinka iskuulka si fudud taleefankaaga.</p>
        </div>
        <div className="p-5">
          {!showSteps ? (
            <>
              <div className="mb-5 flex items-start gap-3 rounded-xl bg-primary-50 p-3 text-sm text-primary-700"><ShieldCheck className="mt-0.5 shrink-0" size={18} /><p>APK-ga waxaa loogu talagalay Android. Marka hore eeg tallaabooyinka rakibidda.</p></div>
              <button onClick={() => setShowSteps(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"><Download size={18} /> Install app-ka</button>
              <button onClick={() => setOpen(false)} className="mt-3 w-full py-2 text-sm font-medium text-ink-muted hover:text-ink">Hadda maya</button>
            </>
          ) : (
            <>
              <p className="mb-3 text-sm font-semibold text-ink">Raac tallaabooyinkan:</p>
              <ol className="space-y-3 text-sm leading-5 text-ink-muted">
                <li className="flex gap-3"><b className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs text-primary-700">1</b><span>Taabo <b className="text-ink">Download APK</b> hoose si file-ku u bilaabo.</span></li>
                <li className="flex gap-3"><b className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs text-primary-700">2</b><span>Marka download-ku dhammaado, taabo <b className="text-ink">Open</b>.</span></li>
                <li className="flex gap-3"><b className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs text-primary-700">3</b><span>Taabo <b className="text-ink">Install</b>; haddii telefoonku kuu sheego, dooro <b className="text-ink">Install anyway</b>.</span></li>
                <li className="flex gap-3"><b className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs text-primary-700">4</b><span>Markuu dhamaado, taabo <b className="text-ink">Open</b>. App-ku wuxuu ka muuqanayaa apps-ka telefoonkaaga.</span></li>
              </ol>
              <a href={APK_URL} target="_blank" rel="noreferrer" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"><Download size={18} /> Download APK</a>
              <button onClick={() => setOpen(false)} className="mt-3 w-full py-2 text-sm font-medium text-ink-muted hover:text-ink">Xir</button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default MobileAppInstallPrompt
