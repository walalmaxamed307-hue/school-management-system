import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, ClipboardCheck, Mail, Phone, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import brandMark from '@/assets/brand-mark.png'
import ThemeToggle from '@/components/ThemeToggle'

const plans = [
  { id: '0-350', range: '0–350 arday', price: '$20', detail: 'Bishii, kadib bisha koowaad ee bilaashka ah.' },
  { id: '351-500', range: '351–500 arday', price: '$25', detail: 'Bishii, kadib bisha koowaad ee bilaashka ah.' },
  { id: '501-700', range: '501–700 arday', price: '$35', detail: 'Bishii, kadib bisha koowaad ee bilaashka ah.' },
  { id: '701+', range: '701+ arday', price: 'Qiime gaar ah', detail: 'Waxaan kuu soo diri doonnaa qiime ku habboon iskuulkaaga.' },
]
const APPLICATION_PENDING_KEY = 'iskuulcaawiye-application-pending'

const inputClass = 'block w-full min-w-0 max-w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-slate-500'

function Field({ icon: Icon, label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
        <Icon size={16} className="text-emerald-600" />
        {label}
      </span>
      {children}
    </label>
  )
}

function SignupPage() {
  const [studentRange, setStudentRange] = useState(plans[0].id)
  const [status, setStatus] = useState(() => (localStorage.getItem(APPLICATION_PENDING_KEY) ? 'success' : 'idle'))
  const [error, setError] = useState('')
  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === studentRange) ?? plans[0], [studentRange])

  const submitApplication = async (event) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT

    if (!endpoint) {
      setError('Form-ka wali lama xiriirin. Fadlan isku day mar kale wax yar kadib.')
      return
    }

    setStatus('submitting')
    setError('')
    const form = new FormData(formElement)
    form.set('Tirada ardayda', selectedPlan.range)
    form.set('Qiimaha la filayo', `${selectedPlan.price} ${selectedPlan.detail}`)
    form.set('_subject', `Codsi cusub: ${form.get('Magaca iskuulka')}`)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: form,
      })

      if (!response.ok) throw new Error('Submission failed')
      localStorage.setItem(APPLICATION_PENDING_KEY, 'true')
      setStatus('success')
      formElement.reset()
      setStudentRange(plans[0].id)
    } catch {
      setStatus('idle')
      setError('Codsiga lama dirin. Hubi internet-kaaga kadibna mar kale isku day.')
    }
  }

  return (
    <main className="login-page relative isolate min-h-screen overflow-x-clip px-4 py-5 text-slate-900 sm:px-6 sm:py-8 dark:text-slate-100">
      <div className="login-bubble pointer-events-none absolute left-[-7rem] top-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="login-bubble-alt pointer-events-none absolute right-[-6rem] top-1/3 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="login-shell relative mx-auto min-w-0 max-w-5xl">
        <header className="mb-8 flex items-center justify-between sm:mb-12">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Ku noqo bogga hore">
            <img src={brandMark} alt="IskuulCaawiye" className="h-11 w-11 rounded-xl object-contain" />
            <span className="text-sm font-extrabold tracking-tight text-slate-950 dark:text-white">Iskuul<span className="text-emerald-600">Caawiye</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle className="hover:bg-white/70 dark:hover:bg-white/10" />
            <Link to="/login" className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white sm:inline-flex dark:text-slate-200 dark:hover:bg-white/10">
              Gal systemka
            </Link>
          </div>
        </header>

        {status === 'success' ? (
          <section className="login-glass mx-auto max-w-2xl rounded-[32px] border border-emerald-200 bg-white p-8 text-center shadow-2xl shadow-emerald-950/10 sm:p-12 dark:border-emerald-400/20 dark:bg-[#0c1a28]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
              <CheckCircle2 size={34} />
            </div>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Codsiga waa la diray</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">Waad mahadsan tahay.</h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">Kooxdayadu waxay review ku samayn doontaa codsigaaga. Marka la aqbalo, waxaa lagula soo xiriiri doonaa email-ka ama WhatsApp-ka aad gelisay si account-ka loo diyaariyo.</p>
            <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
              <ArrowLeft size={17} /> Ku noqo bogga hore
            </Link>
          </section>
        ) : (
          <div className="login-glass grid min-w-0 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-950/10 lg:grid-cols-[.82fr_1.18fr] dark:border-white/10 dark:bg-[#0c1a28]">
            <aside className="min-w-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-7 text-white sm:p-10">
              <div className="inline-flex rounded-2xl bg-white/10 p-3 text-emerald-300"><ClipboardCheck size={25} /></div>
              <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">School application</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Ku biir IskuulCaawiye.</h1>
              <p className="mt-4 text-sm leading-7 text-slate-300">Buuxi xogta hoose. Codsigaaga email ayuu noogu imaanayaa, kadib ayaana kuu sameyn doonaa account ammaan ah.</p>
              <div className="mt-9 space-y-5">
                {[
                  ['1', 'Buuxi xogta iskuulkaaga'],
                  ['2', 'Waxaan samaynaynaa review'],
                  ['3', 'Aqbalid kadib ayaad login samaynaysaa'],
                ].map(([number, text]) => <div key={number} className="flex items-center gap-3 text-sm font-semibold"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-xs font-black text-emerald-950">{number}</span>{text}</div>)}
              </div>
              <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-sm leading-6 text-slate-300"><ShieldCheck size={18} className="mb-2 text-emerald-300" />Password laguma weydiinayo boggan. Account-kaaga iyo password-kaaga waxaa loo diyaarinayaa si ammaan ah marka codsiga la ansixiyo.</div>
            </aside>

            <section className="login-panel min-w-0 p-6 sm:p-10">
              <div className="mb-8"><p className="text-sm font-bold text-emerald-600">Bilow codsigaaga</p><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Xogta iskuulka</h2><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Dhammaan meelaha calaamadda leh waa muhiim.</p></div>
              <form onSubmit={submitApplication} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field icon={Building2} label="Magaca iskuulka"><input required name="Magaca iskuulka" className={inputClass} placeholder="Tusaale: Horumar Academy" /></Field>
                  <Field icon={Users} label="Magaca admin-ka"><input required name="Magaca admin-ka" className={inputClass} placeholder="Magaca oo buuxa" /></Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field icon={Mail} label="Email-ka maamulka"><input required type="email" name="Email-ka maamulka" className={inputClass} placeholder="admin@school.com" /></Field>
                  <Field icon={Phone} label="WhatsApp / Taleefan"><input required type="tel" name="Taleefanka maamulka" className={inputClass} placeholder="+252 ..." /></Field>
                </div>
                <Field icon={Users} label="Tirada ardayda"><select name="Tirada ardayda" value={studentRange} onChange={(event) => setStudentRange(event.target.value)} className={inputClass}>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.range}</option>)}</select></Field>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/[0.08]"><div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"><p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Qiimaha qorshahaaga</p><p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{selectedPlan.price}<span className="ml-1 text-sm font-semibold">{selectedPlan.price.startsWith('$') ? '/ bishii' : ''}</span></p></div><p className="mt-1 text-xs leading-5 text-emerald-800/80 dark:text-emerald-200/70">{selectedPlan.detail}</p></div>
                <Field icon={ClipboardCheck} label="Fariin dheeraad ah (ikhtiyaari)"><textarea name="Fariin" rows="3" className={`${inputClass} resize-y`} placeholder="Wax su'aal ama faahfaahin ah halkan ku qor." /></Field>
                {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
                <button disabled={status === 'submitting'} type="submit" className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-70">{status === 'submitting' ? 'Codsiga waa la dirayaa...' : 'Submit application'}<ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" /></button>
                <p className="text-center text-sm text-slate-500 dark:text-slate-400">Haddii iskuulkaagu hore akoon u leeyahay, <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-500">login samee</Link>.</p>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}

export default SignupPage
