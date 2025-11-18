import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  Layers3,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { ROUTES } from '../routes'

const features = [
  {
    title: 'Realtime Inventory Cloud',
    description:
      'Track every SKU, purchase order and consignment in a unified pipeline with smart alerts, pricing suggestions and AI powered duplicate detection.',
    icon: Layers3,
    badge: 'Inventory',
  },
  {
    title: 'Client CRM & Discord Inbox',
    description:
      'Sync buyer conversations across Discord, email and SMS. Turn chats into invoices and nurture VIP clients with automations.',
    icon: MessageCircle,
    badge: 'Relationships',
  },
  {
    title: 'Cashflow & Tax Analytics',
    description:
      'Live profit dashboards, payout forecasting and export-ready ledgers keep finance teams confident before every drop.',
    icon: BarChart3,
    badge: 'Finance',
  },
  {
    title: 'Meetings & Concierge',
    description:
      'Schedule sourcing calls, auto-sync meeting notes and surface follow-ups powered by Supabase functions.',
    icon: CalendarCheck2,
    badge: 'Operations',
  },
]

const highlights = [
  { label: 'Avg. workflow saved per drop', value: '14 hrs' },
  { label: 'Teams migrating from spreadsheets', value: '310+' },
  { label: 'Automated Discord logins per month', value: '9,800' },
]

const testimonials = [
  {
    name: 'Sarah Voigt',
    role: 'Founder • Velvet Archive',
    quote:
      'Wir haben ResellTrack Pro eingeführt, um unsere High-End-Consignments zu steuern. Seitdem laufen Sales, Service und Finance wie eine einzige Oberfläche – inklusive Discord Login für unser Team.',
  },
  {
    name: 'Dion Smith',
    role: 'Ops Lead • Prime Sneaker Vault',
    quote:
      'Vom Wareneingang bis zum Abverkauf ist alles transparent. Die Supabase-Authentifizierung gibt uns Enterprise-Sicherheit ohne Enterprise-Aufwand.',
  },
]

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navItems = useMemo(
    () => [
      { label: 'Flow', href: '#flow' },
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Trust', href: '#trust' },
    ],
    [],
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-70">
        <div className="absolute left-0 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary-500/40 blur-[120px]" />
        <div className="absolute right-0 top-10 h-96 w-96 translate-x-1/3 rounded-full bg-success-400/30 blur-[140px]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to={ROUTES.landing} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-300 text-xl font-bold shadow-glow">
              RT
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight">ResellTrack Pro</p>
              <p className="text-xs text-white/60">Inventory • CRM • Analytics</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-white/70 lg:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="transition hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to={ROUTES.auth} className="text-sm font-semibold text-white/70 transition hover:text-white">
              Sign in
            </Link>
            <Link
              to={ROUTES.auth}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-success-500 to-primary-400 px-5 py-2 text-sm font-semibold text-white shadow-glow"
            >
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            className="inline-flex items-center justify-center rounded-xl border border-white/10 p-2 text-white lg:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span className="sr-only">Toggle menu</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
        {isMenuOpen && (
          <div className="border-t border-white/10 bg-slate-900/80 px-6 py-4 lg:hidden">
            <nav className="space-y-4 text-base text-white/80">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="block" onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-3">
              <Link to={ROUTES.auth} className="rounded-2xl border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white/80">
                Sign in
              </Link>
              <Link to={ROUTES.auth} className="rounded-2xl bg-gradient-to-r from-success-500 to-primary-400 px-5 py-3 text-center text-sm font-semibold text-white">
                Start free trial
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        <section className="border-b border-white/5 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/80">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1fr_0.9fr] lg:py-24">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/70">
                <Sparkles className="h-4 w-4 text-primary-300" />
                Built on Supabase • Discord login ready
              </div>
              <div className="space-y-6">
                <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                  Operate your resale business like a modern tech brand
                </h1>
                <p className="text-lg text-white/70">
                  ResellTrack Pro vereint CRM, Produkt-Flow, Meetings und Reporting in einem einzigen Command Center – mit gesichertem Supabase Login, Discord SSO und komplett neuem Interface.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  to={ROUTES.auth}
                  className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-300 px-7 py-4 text-lg font-semibold text-white shadow-glow transition hover:brightness-110"
                >
                  Launch cockpit
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to={ROUTES.demo}
                  className="inline-flex items-center gap-3 rounded-2xl border border-white/10 px-7 py-4 text-lg font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  Watch 3‑min demo
                </Link>
              </div>
              <div className="grid gap-6 text-sm text-white/70 sm:grid-cols-3">
                {highlights.map((highlight) => (
                  <div key={highlight.label} className="rounded-3xl border border-white/5 bg-white/5 p-4">
                    <p className="text-3xl font-semibold text-white">{highlight.value}</p>
                    <p>{highlight.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-strong backdrop-blur-xl">
              <div className="space-y-4 rounded-2xl bg-slate-950/60 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white/60">Realtime Flow</p>
                    <p className="text-2xl font-semibold">Drop #1324</p>
                  </div>
                  <ShieldCheck className="h-6 w-6 text-success-400" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <p className="font-semibold">{item === 1 ? 'iPhone 16 Pro' : item === 2 ? 'Rolex GMT' : 'Travis Scott AF1'}</p>
                        <p className="text-success-300">{item === 2 ? '+$1,040' : '+$320'}</p>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                        <CheckCircle2 className="h-4 w-4 text-success-400" />
                        Cleared · Supabase verified · Discord sync
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-primary-500/20 to-success-500/20 p-4 text-sm text-white/80">
                  <p className="font-semibold">Automated insights</p>
                  <p className="mt-1">Gross margin +27% vs last drop • 8 follow-ups scheduled via Discord.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="flow" className="border-b border-white/5 bg-slate-950/80 py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-2xl font-semibold">Drop-ready flow</h3>
              <p className="mt-2 text-white/70">Konfigurierte Status-Boards für Einkauf, QC, Live und After-Sale.</p>
              <ul className="mt-6 space-y-3 text-sm text-white/70">
                <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary-300" />Smart automations & alerts</li>
                <li className="flex items-center gap-2"><Users className="h-4 w-4 text-primary-300" />Team-based approvals</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary-300" />Supabase session security</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-2xl font-semibold">Discord-ready login</h3>
              <p className="mt-2 text-white/70">Enable creators, runners and client advisors to connect via Discord OAuth in seconds.</p>
              <ul className="mt-6 space-y-3 text-sm text-white/70">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-400" />Verified profiles & audit logs</li>
                <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-success-400" />Chat handoffs into CRM</li>
                <li className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-success-400" />Role-based permissions</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-2xl font-semibold">Verification & compliance</h3>
              <p className="mt-2 text-white/70">Supabase email verification, 2FA and passwordless magic links ab Werk.</p>
              <ul className="mt-6 space-y-3 text-sm text-white/70">
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary-300" />SOC2-ready infrastructure</li>
                <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary-300" />Audit-ready exports</li>
                <li className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary-300" />Realtime reporting</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="features" className="border-b border-white/5 bg-slate-900/40 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">Power modules</p>
              <h2 className="mt-4 text-3xl font-semibold">Ship faster with a full operator stack</h2>
              <p className="mt-3 text-white/70">Drag-and-drop dashboards, live automations and API hooks help teams ship within minutes.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <feature.icon className="h-6 w-6 text-primary-200" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">{feature.badge}</p>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-white/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="border-b border-white/5 bg-slate-950/80 py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">Pricing</p>
            <h2 className="mt-4 text-3xl font-semibold">Start for free. Upgrade when your flow scales.</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-left">
                <p className="text-sm font-semibold text-success-300">Starter</p>
                <p className="mt-2 text-4xl font-semibold">€0</p>
                <p className="text-white/70">All core features, email verification, Discord login for 1 workspace.</p>
                <ul className="mt-6 space-y-3 text-sm text-white/70">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-400" />Inventory board & CRM</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-400" />Supabase auth & verification</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-400" />3 connected Discord accounts</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-primary-300/40 bg-gradient-to-br from-primary-500/20 to-success-500/20 p-8 text-left shadow-glow">
                <p className="text-sm font-semibold text-primary-100">Pro</p>
                <p className="mt-2 text-4xl font-semibold">€89</p>
                <p className="text-white/80">Unlimited pipelines, advanced automations, dedicated success.</p>
                <ul className="mt-6 space-y-3 text-sm text-white">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary-200" />Unlimited Discord SSO seats</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary-200" />Revenue & tax dashboards</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary-200" />Premium support & onboarding</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="trust" className="bg-slate-900/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">Customer love</p>
              <h2 className="mt-4 text-3xl font-semibold">Brands who scale with ResellTrack Pro</h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80 shadow-soft">
                  <p className="text-lg">“{testimonial.quote}”</p>
                  <p className="mt-4 text-sm font-semibold text-white">{testimonial.name}</p>
                  <p className="text-xs text-white/60">{testimonial.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/5 bg-gradient-to-r from-primary-600 to-primary-400 py-16">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center text-white">
            <p className="text-sm uppercase tracking-[0.4em] text-white/70">Ready?</p>
            <h2 className="text-3xl font-semibold">Bring every resale workflow into one premium dashboard.</h2>
            <p className="text-white/80">Live Supabase authentication, Discord logins und komplett überarbeitetes UI warten auf dich.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={ROUTES.auth} className="inline-flex items-center gap-3 rounded-2xl bg-white px-7 py-4 text-lg font-semibold text-slate-900 shadow-strong">
                Start building
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to={ROUTES.demo} className="inline-flex items-center gap-3 rounded-2xl border border-white/40 px-7 py-4 text-lg font-semibold text-white">
                Explore demo
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
