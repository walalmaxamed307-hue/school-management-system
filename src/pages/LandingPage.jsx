import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck2,
  Check,
  ChevronDown,
  ClipboardList,
  Crown,
  GraduationCap,
  Megaphone,
  Menu,
  MessageCircle,
  School,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import { whatsappLink } from '@/lib/contact'
import logo from '@/assets/iskuulcaawiye-logo.png'
import brandMark from '@/assets/brand-mark.png'

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Roles', href: '#roles' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact us', href: '#contact' },
]

const featureCards = [
  {
    icon: Users,
    title: 'Ardayda & Fasallada',
    body: 'Maamul xogta ardayda, fasallada iyo sections-ka si nidaamsan, adigoon ku wareerin faylal badan.',
  },
  {
    icon: CalendarCheck2,
    title: 'Attendance',
    body: 'La soco xaadiritaanka ardayda, maqnaanshaha, daahitaanka iyo xaaladaha kale ee attendance-ka.',
  },
  {
    icon: ClipboardList,
    title: 'Imtixaan & Natiijooyin',
    body: 'Samee exams, geli natiijooyinka, daabac/publish natiijooyinka, ardayduna si toos ah ayay u arki karaan.',
  },
  {
    icon: Megaphone,
    title: 'Ogeysiisyada Iskuulka',
    body: 'Maamulka iyo macallimiintu waxay si fudud ugu gudbin karaan ardayda wararka iyo ogeysiisyada muhiimka ah.',
  },
  {
    icon: WalletCards,
    title: 'Maamulka Lacagaha',
    body: 'Maamul fees-ka ardayda oo arag lacagaha la bixiyay, qayb ahaan loo bixiyay iyo kuwa harsan.',
  },
  {
    icon: School,
    title: 'Exam Rooms',
    body: 'Qorshee rooms-ka imtixaanka, kala qaybi ardayda oo maamul fadhiisinta iyadoo xogtu meel keliya taallo.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard',
    body: 'Hel muuqaal kooban oo ku saabsan ardayda, macallimiinta, attendance-ka iyo fees-ka iskuulka.',
  },
  {
    icon: BookOpen,
    title: 'Academic Years',
    body: 'Kala ilaali sannadaha waxbarashada si xogta sanadkii hore iyo tan hadda socda aysan isugu dhex milmin.',
  },
  {
    icon: ClipboardList,
    title: 'Assignments & Online Lessons',
    body: 'Macallinku wuxuu post-gareyn karaa casharro, shaqo-guri iyo faylal; ardayguna account-kiisa ayuu si ammaan ah uga arkaa ama uga dejistaa.',
  },
  {
    icon: Crown,
    title: 'Owner Overview',
    body: 'Milkiilaha iskuulka wuxuu helayaa dashboard akhris-kaliya ah oo muujinaya xaaladda iskuulka, attendance, fees iyo waxyaabaha u baahan feejignaan.',
  },
]

const roleCards = [
  {
    icon: ShieldCheck,
    eyebrow: 'Maamulka',
    title: 'Admin',
    description: 'Admin-ku wuxuu hayaa maamulka ugu ballaaran ee iskuulka.',
    items: ['Ardayda iyo xogtooda', 'Macallimiinta iyo assignments-ka', 'Fees-ka iyo Risk Students', 'Settings-ka iyo logo-ga iskuulka', 'Exams, attendance & announcements'],
  },
  {
    icon: GraduationCap,
    eyebrow: 'Macallimiinta',
    title: 'Teacher',
    description: 'Macallinku wuxuu helayaa qaybaha uu shaqadiisa maalinlaha ah u baahan yahay.',
    items: ['Dashboard iyo attendance', 'Exam results & announcements', 'Assignments iyo online lessons', 'Upload/download files', 'Exam rooms'],
  },
  {
    icon: Sparkles,
    eyebrow: 'Ardayda',
    title: 'Student',
    description: 'Ardaygu ma aha qof xogtiisa laga maamulo oo keliya — wuxuu si toos ah uga qayb qaataa systemka.',
    items: ['Arag natiijooyinka la publish gareeyay', 'Arag lessons & assignments', 'Download faylasha macallinka', 'Arag ogeysiisyada iyo exam room-ka', 'Hel akoon u gaar ah'],
  },
  {
    icon: Crown,
    eyebrow: 'Milkiilaha',
    title: 'Owner',
    description: 'Milkiiluhu wuxuu si ammaan ah ula socdaa xaaladda iskuulkiisa, isaga oo aan maamulin xogta maalinlaha ah.',
    items: ['Overview akhris-kaliya ah', 'Attendance iyo fees insights', 'Natiijooyinka iyo ardayda khatarta ah', 'Xog kooban oo si toos ah u cusboonaata'],
  },
]

const prices = [
  { range: '0–350 arday', price: '$20', note: 'bishii', featured: false },
  { range: '351–500 arday', price: '$25', note: 'bishii', featured: true },
  { range: '501–700 arday', price: '$35', note: 'bishii', featured: false },
]

function scrollToSection(event, href, closeMenu) {
  event.preventDefault()
  closeMenu?.()
  const target = document.querySelector(href)
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.history.replaceState(null, '', href)
}

function Logo({ compact = false }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="IskuulCaawiye - Home">
      <img
        src={brandMark}
        alt="IskuulCaawiye logo"
        className={`${compact ? 'h-10 w-10' : 'h-11 w-11'} rounded-xl object-contain`}
      />
      {!compact && (
        <span className="hidden text-sm font-extrabold tracking-tight text-slate-950 dark:text-white sm:block">
          Iskuul<span className="text-emerald-600">Caawiye</span>
        </span>
      )}
    </Link>
  )
}

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 dark:bg-[#07111b] dark:text-slate-100">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#07111b]/85">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Logo />

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle className="hover:bg-slate-100 dark:hover:bg-white/10" />
            <Link
              to="/login"
              className="hidden rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 sm:inline-flex dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Gal systemka
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Fur menu-ga"
              aria-expanded={menuOpen}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
          <div
            className="ml-auto flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl dark:bg-[#0b1723]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Xir menu-ga"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-10 space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(event) => scrollToSection(event, item.href, () => setMenuOpen(false))}
                  className="flex items-center justify-between rounded-2xl px-4 py-4 text-base font-semibold text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/5"
                >
                  {item.label}
                  <ArrowRight size={18} />
                </a>
              ))}
            </div>

            <div className="mt-auto space-y-3">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
              >
                Gal systemka
              </Link>
              <a
                href={whatsappLink('Asc. Waxaan rabaa inaan wax badan ka ogaado IskuulCaawiye oo aan akoon iskuul sameysto.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-semibold text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
              >
                <MessageCircle size={17} />
                WhatsApp nagala soo xiriir
              </a>
            </div>
          </div>
        </div>
      )}

      <main>
        <section className="relative overflow-hidden pt-[124px] pb-20 sm:pt-[150px] sm:pb-28 lg:pt-[170px]">
          <div className="absolute -left-36 top-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:px-10">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Sparkles size={14} />
                Nidaam casri ah oo loogu talagalay iskuulada Soomaaliyeed
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
                Maamulka iskuulka oo dhan,
                <span className="block bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  hal meel oo fudud.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-300">
                IskuulCaawiye waa school management system kaa caawinaya inaad si hufan u maamusho
                ardayda, macallimiinta, attendance-ka, imtixaannada, natiijooyinka, fees-ka,
                ogeysiisyada iyo exam rooms — iyadoo ardayduna si toos ah uga qayb qaadanayaan systemka.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Gal systemka
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#features"
                  onClick={(event) => scrollToSection(event, '#features')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Eeg features-ka
                  <ChevronDown size={17} />
                </a>
              </div>

              <div className="mt-9 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ['4', 'roles'],
                  ['10+', 'qaybood oo muhiim ah'],
                  ['1', 'system oo iskuulka oo dhan ah'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xl font-black text-slate-950 dark:text-white">{value}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[580px]">
              <div className="absolute -inset-10 rounded-[44px] bg-gradient-to-br from-blue-500/15 via-transparent to-emerald-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_30px_100px_rgba(15,23,42,.14)] dark:border-white/10 dark:bg-[#0c1a28] dark:shadow-[0_30px_100px_rgba(0,0,0,.25)]">
                <div className="mb-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                  <img src={logo} alt="IskuulCaawiye" className="h-9 w-auto object-contain" />
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">School management</span>
                </div>
                <div className="rounded-[26px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-white/55">IskuulCaawiye</p>
                      <p className="mt-1 text-lg font-bold">Dashboard-ka iskuulka</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-2.5">
                      <GraduationCap size={19} />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ['480', 'Arday'],
                      ['32', 'Macallin'],
                      ['94%', 'Xaadir'],
                      ['$2.4k', 'Fees'],
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                        <p className="text-lg font-extrabold">{value}</p>
                        <p className="mt-1 text-[11px] text-white/55">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/55">Attendance maanta</p>
                        <p className="mt-1 font-semibold">Kahor Break & Kadib Break</p>
                      </div>
                      <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-bold text-emerald-300">94%</span>
                    </div>
                    <div className="mt-5 flex h-28 items-end gap-2">
                      {[38, 54, 49, 68, 58, 76, 88, 71, 92, 84, 96, 90].map((height, index) => (
                        <div key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-blue-500 to-emerald-300" style={{ height: `${height}%` }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 p-2 pt-4 sm:grid-cols-3">
                  {[
                    ['Exam results', 'Natiijooyinka oo si cad loo arko'],
                    ['Announcements', 'Wararka iskuulka oo hal meel ah'],
                    ['Student access', 'Ardaygu systemka ayuu ka qayb qaataa'],
                  ].map(([title, body]) => (
                    <div key={title} className="rounded-2xl border border-slate-200 p-3.5 dark:border-white/10">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{title}</p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50/80 py-12 dark:border-white/10 dark:bg-white/[0.025]">
          <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 sm:px-8 lg:px-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Maxaa IskuulCaawiye uga duwan yahay systemyada hadda jiro?</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Systemka waxaa laga dhisay aragtida shaqada iskuulka ee maalinlaha ah.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Fudud', 'Interface aan wareer lahayn'],
                ['Hufan', 'Xogta muhiimka ah meel cad'],
                ['Arday-ku-jira', 'Ardaydu si toos ah ayay u helaan natiijooyinkooda & wararka'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200/70 dark:bg-white/5 dark:ring-white/10">
                  <p className="text-sm font-extrabold text-slate-950 dark:text-white">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Features</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">iskuuCaawiye system waxaad ka helaysaa Wax kasta oo iskuulku u baahan yahay,hab isku xiran.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">Qaybaha systemka waxaa loo kala saaray si shaqo kasta si toos ah loo fahmo, loona yareeyo wareerka maamulka.</p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featureCards.map((feature) => {
                const Icon = feature.icon
                return (
                  <article key={feature.title} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.035] dark:hover:shadow-black/20">
                    <div className="inline-flex rounded-2xl bg-blue-50 p-3.5 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                      <Icon size={21} />
                    </div>
                    <h3 className="mt-5 text-base font-extrabold text-slate-950 dark:text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{feature.body}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="roles" className="scroll-mt-24 bg-slate-950 py-24 text-white sm:py-28 dark:bg-black/20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Roles</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Qof kasta wuxuu helayaa qaybta uu u baahan yahay.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">Admin, macallin iyo arday mid walba wuxuu leeyahay access ku habboon doorkiisa. Taas ayaa systemka ka dhigaysa mid cad oo ammaan badan marka loo eego in qof walba la siiyo dhammaan menu-yada.</p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-4">
              {roleCards.map((role) => {
                const Icon = role.icon
                return (
                  <article key={role.title} className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur sm:p-7">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-300">{role.eyebrow}</span>
                      <span className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-300"><Icon size={20} /></span>
                    </div>
                    <h3 className="mt-6 text-2xl font-black">{role.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{role.description}</p>
                    <div className="mt-6 space-y-3">
                      {role.items.map((item) => (
                        <div key={item} className="flex items-start gap-3 text-sm text-slate-200">
                          <span className="mt-0.5 inline-flex rounded-full bg-emerald-400/15 p-1 text-emerald-300"><Check size={13} strokeWidth={3} /></span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-28">
          
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            
            <div className="grid gap-7 lg:grid-cols-3">
              <div className="rounded-[30px] border border-blue-100 bg-blue-50 p-7 dark:border-blue-500/15 dark:bg-blue-500/10">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">1. Maamul</p>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Xogta iskuulka meel cad ku hay.</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Ardayda, macallimiinta, fasallada iyo fees-ka ku maamul nidaam isku xiran.</p>
              </div>
              <div className="rounded-[30px] border border-emerald-100 bg-emerald-50 p-7 dark:border-emerald-500/15 dark:bg-emerald-500/10">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">2. La wadaag</p>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Natiijooyinka iyo wararka gaarsii ardayda.</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Marka natiijo la publish gareeyo ama ogeysiis la geliyo, ardaygu account-kiisa ayuu ka arki karaa.</p>
              </div>
              <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-7 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">3. Faham</p>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Interface ha ku wareerin.</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Qayb kasta waxaa loo dhisay si shaqadeeda loo fahmo, loona yareeyo tallaabooyinka aan loo baahnayn.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24 border-y border-slate-200 bg-slate-50 py-24 sm:py-28 dark:border-white/10 dark:bg-white/[0.025]">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Pricing</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">Bilow adigoon culays badan lagu saarin.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">Bisha koowaad waa bilaash. Kadib qiimaha waxaa lagu saleeyaa tirada ardayda iskuulka.</p>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-3">
              {prices.map((item) => (
                <article key={item.range} className={`relative rounded-[28px] border p-7 ${item.featured ? 'border-blue-300 bg-white shadow-xl shadow-blue-900/10 dark:border-blue-400/30 dark:bg-[#0d1a27]' : 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.035]'}`}>
                  {item.featured && <span className="absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">Qiimaha caadiga ah</span>}
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{item.range}</p>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-5xl font-black tracking-tight text-slate-950 dark:text-white">{item.price}</span>
                    <span className="mb-2 text-sm text-slate-500 dark:text-slate-400">{item.note}</span>
                  </div>
                  <div className="mt-6 space-y-3">
                    {['Dhammaan features-ka muhiimka ah', 'Admin + Teacher + Student roles', 'Natiijooyin & announcements loogu talagalay ardayda', 'Support via WhatsApp'].map((itemText) => (
                      <div key={itemText} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                        <span>{itemText}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    href={whatsappLink(`Asc. Waxaan rabaa inaan IskuulCaawiye u isticmaalo iskuulkayga (${item.range}).`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-7 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold transition hover:-translate-y-0.5 ${item.featured ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'}`}
                  >
                    Bilow WhatsApp
                    <ArrowRight size={16} />
                  </a>
                </article>
              ))}
            </div>

            <div className="mx-auto mt-5 max-w-5xl rounded-[28px] border border-dashed border-slate-300 bg-white p-6 dark:border-white/15 dark:bg-white/[0.035]">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold text-slate-950 dark:text-white">701+ arday?</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">La xiriir si aan uga wada hadalno qiimaha ku habboon iskuulkaaga.</p>
                </div>
                <a
                  href={whatsappLink('Asc. Waxaan rabaa qiimeyn loogu sameeyo IskuulCaawiye ee iskuul leh 701+ arday.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                >
                  Contact us
                  <MessageCircle size={16} />
                </a>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-5xl rounded-[28px] bg-gradient-to-r from-blue-600 to-emerald-600 p-7 text-white shadow-xl shadow-blue-900/10 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold">First month free</p>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-white/80">Bilow bisha koowaad adigoon bixin lacag. Markaad diyaar noqoto, waxaad u gudbaysaa qiimaha ku salaysan tirada ardayda.</p>
                </div>
                <Link to="/login" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-100">
                  Gal systemka
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="overflow-hidden rounded-[36px] bg-slate-950 px-6 py-14 text-white sm:px-10 sm:py-16 lg:px-14">
              <div className="grid gap-10 lg:grid-cols-[1.3fr_.7fr] lg:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Contact us</p>
                  <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Iskuulkaaga ma rabtaa inuu isticmaalo IskuulCaawiye system?</h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">Si aad u gasho systemka, iskuulkaagu wuxuu u baahan yahay in akoon amaan ah systemka loogu sameeyo.Fadlan Nagala soo xiriir WhatsApp si aan kuugu sharaxno systemka, uga jawaabno su'aalahaaga, una diyaarino akoonka iskuulkaaga mahadsanid!.</p>
                </div>
                <div className="lg:justify-self-end">
                  <a
                    href={whatsappLink('Asc. Waxaan rabaa in IskuulCaawiye akoon loogu sameeyo iskuulkayga. Fadlan ila soo xiriir.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 text-sm font-black text-white shadow-lg shadow-emerald-950/30 transition hover:-translate-y-0.5 hover:bg-emerald-400 sm:w-auto"
                  >
                    <MessageCircle size={18} />
                    WhatsApp nagala soo xiriir
                  </a>
                  <p className="mt-3 text-center text-xs text-slate-400 lg:text-right">Waxaad ku bilaabi kartaa fariin gaaban.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex items-center gap-3">
            <Logo compact />
            <div>
              <p className="text-sm font-extrabold text-slate-950 dark:text-white">IskuulCaawiye</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Nidaamka Maamulka Iskuulka</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={(event) => scrollToSection(event, item.href)} className="hover:text-slate-950 dark:hover:text-white">
                {item.label}
              </a>
            ))}
            <Link to="/login" className="hover:text-slate-950 dark:hover:text-white">Login</Link>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} IskuulCaawiye</p>
        </div>
      </footer>

      <a
        href={whatsappLink('Asc. Waxaan rabaa inaan wax badan ka ogaado IskuulCaawiye.')}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-950/25 transition hover:-translate-y-1 hover:bg-emerald-400"
        aria-label="WhatsApp nagala soo xiriir"
      >
        <MessageCircle size={25} />
      </a>
    </div>
  )
}

export default LandingPage
