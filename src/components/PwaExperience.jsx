import { useEffect, useState } from 'react'
import { Download, RefreshCw, Share, Smartphone, X } from 'lucide-react'

const DISMISS_KEY = 'iskuulcaawiye-pwa-install-dismissed'

function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function isIos() {
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent)
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(() => typeof window !== 'undefined' && isStandalone())
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === 'true')
  const [showIosHelp, setShowIosHelp] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const onBeforeInstall = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
      setShowIosHelp(false)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 4000)
    return () => window.clearTimeout(timer)
  }, [])

  const hide = () => {
    sessionStorage.setItem(DISMISS_KEY, 'true')
    setDismissed(true)
  }

  const install = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      return
    }
    if (isIos()) setShowIosHelp(true)
  }

  if (!ready || installed || dismissed || (!deferredPrompt && !isIos())) return null

  return <>
    <aside className="fixed bottom-4 left-1/2 z-[80] flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border border-primary-100 bg-surface/95 px-3 py-2.5 shadow-2xl shadow-slate-950/15 backdrop-blur-xl dark:border-primary-500/25 dark:bg-[#10202d]/95" role="status">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/15"><Smartphone size={19} /></span>
      <div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-ink">Ku rakib IskuulCaawiye</p><p className="truncate text-[11px] text-ink-muted">Si degdeg ah uga fur taleefankaaga</p></div>
      <button type="button" onClick={install} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-primary-700"><Download size={14} /> Install</button>
      <button type="button" onClick={hide} className="shrink-0 rounded-lg p-1.5 text-ink-muted hover:bg-canvas hover:text-ink" aria-label="Xir"><X size={17} /></button>
    </aside>
    {showIosHelp && <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="pwa-ios-title">
      <section className="w-full max-w-md overflow-hidden rounded-2xl bg-surface shadow-2xl"><div className="relative bg-gradient-to-br from-primary-700 to-primary-500 px-6 pb-7 pt-6 text-white"><button type="button" onClick={() => setShowIosHelp(false)} className="absolute right-4 top-4 rounded-lg p-1 text-white/75 hover:bg-white/10 hover:text-white" aria-label="Xir"><X size={20} /></button><p className="text-xs font-semibold uppercase tracking-[.18em] text-white/75">iPhone / iPad</p><h2 id="pwa-ios-title" className="mt-1 text-xl font-bold">Ku rakib IskuulCaawiye</h2></div><div className="space-y-4 p-5 text-sm leading-6 text-ink-muted"><p>Safari-ga hoose ka taabo <b className="text-ink">Share</b>, kadib dooro <b className="text-ink">Add to Home Screen</b>.</p><div className="flex items-center gap-3 rounded-xl bg-primary-50 p-3 text-primary-700 dark:bg-primary-500/10 dark:text-primary-200"><Share size={19} /><span>Markaas taabo <b>Add</b> si app-ku ugu biiro taleefankaaga.</span></div><button type="button" onClick={() => setShowIosHelp(false)} className="w-full rounded-xl bg-primary-600 px-4 py-3 font-semibold text-white hover:bg-primary-700">Waan fahmay</button></div></section>
    </div>}
  </>
}

export function PwaUpdatePrompt() {
  const [registration, setRegistration] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const onUpdate = (event) => setRegistration(event.detail)
    const onControllerChange = () => window.location.reload()
    window.addEventListener('iskuulcaawiye:pwa-update', onUpdate)
    navigator.serviceWorker?.addEventListener('controllerchange', onControllerChange)
    if (window.__iskuulCaawiyePwaUpdate) setRegistration(window.__iskuulCaawiyePwaUpdate)
    return () => {
      window.removeEventListener('iskuulcaawiye:pwa-update', onUpdate)
      navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  const update = () => {
    if (!registration?.waiting) return
    setRefreshing(true)
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }

  if (!registration) return null
  return <aside className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-primary-100 bg-surface p-4 shadow-2xl dark:border-primary-500/25 dark:bg-[#10202d]" role="status"><div className="flex items-start gap-3"><span className="rounded-xl bg-primary-50 p-2 text-primary-600 dark:bg-primary-500/15"><RefreshCw size={18} /></span><div className="min-w-0 flex-1"><p className="text-sm font-extrabold text-ink">Update cusub ayaa diyaar ah</p><p className="mt-1 text-xs leading-5 text-ink-muted">Keydi wixii aad qoraysay, kadib refresh si aad u hesho nooca cusub.</p><div className="mt-3 flex gap-2"><button type="button" onClick={update} disabled={refreshing} className="rounded-xl bg-primary-600 px-3 py-2 text-xs font-bold text-white hover:bg-primary-700 disabled:opacity-60">{refreshing ? 'Waa la cusboonaysiinayaa...' : 'Cusboonaysii hadda'}</button><button type="button" onClick={() => setRegistration(null)} className="rounded-xl px-3 py-2 text-xs font-bold text-ink-muted hover:bg-canvas">Mar dambe</button></div></div></div></aside>
}
