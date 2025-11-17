import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Check, Menu, Shield, Smartphone, Sparkles, Star, X } from 'lucide-react';
import { useState } from 'react';
import { ROUTES } from '../routes';

const features = [
  {
    title: 'Geführte Produktflüsse',
    description: 'Nur ein Feld pro Step. Von Titel über Bilder bis hin zu Preisen – ohne Formularstress.',
    icon: Sparkles
  },
  {
    title: 'Mobile-ready',
    description: 'Alle Seiten sind für Handy & Tablet optimiert. Sidebar, Karten und Dialoge sind jederzeit erreichbar.',
    icon: Smartphone
  },
  {
    title: 'Kalender & Kontakte',
    description: 'Behalte Übergaben, Meetings und Käufer:innen immer im Blick und synchronisiere Erinnerungen.',
    icon: Calendar
  },
  {
    title: 'Datenschutz & Sicherheit',
    description: 'Supabase Auth, fein-granulare Rechte und verschlüsselte Daten sorgen für ruhigen Schlaf.',
    icon: Shield
  }
];

const flowSteps = [
  {
    label: 'Step 1',
    title: 'Titel & Idee',
    description: 'Ein Feld genügt. Schreib auf, was du verkaufst und starte sofort den Flow.'
  },
  {
    label: 'Step 2',
    title: 'Fotos & Tags',
    description: 'Wähle optional Bilder oder Tags. Alles in einem aufgeräumten Screen.'
  },
  {
    label: 'Step 3',
    title: 'Preis optional',
    description: 'Lege jetzt Preise fest – oder später. Der Flow bleibt offen, bis du speichern möchtest.'
  }
];

const testimonials = [
  {
    quote:
      'ResellTrack Pro fühlt sich wie ein persönlicher Coach an. Ich brauche nur wenige Klicks, um neue Artikel anzulegen und Verkäufe zu dokumentieren.',
    author: 'Mira Jansen',
    role: 'Vintage Seller'
  },
  {
    quote:
      'Endlich eine App, die sowohl auf dem Handy als auch auf dem Laptop Spaß macht. Die Karten und Animationen geben mir jeden Tag Motivation.',
    author: 'Leon Faber',
    role: 'Side Hustler'
  }
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '0€',
    description: 'Perfekt zum Ausprobieren mit Demo-Modus.',
    perks: ['Geführte Produktflows', 'Landing & Dashboard', '1 Teammitglied']
  },
  {
    name: 'Pro',
    price: '19€',
    description: 'Alle Features für wachsende Händler:innen.',
    perks: ['Unbegrenzte Produkte', 'Meetings & Kalender', 'Analytics & Automationen']
  }
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.landing} className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 p-2 text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">ResellTrack</p>
              <p className="text-lg font-bold">Pro</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#flow" className="text-sm text-slate-200 transition hover:text-white">
              Flow
            </a>
            <a href="#features" className="text-sm text-slate-200 transition hover:text-white">
              Features
            </a>
            <a href="#pricing" className="text-sm text-slate-200 transition hover:text-white">
              Preise
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to={ROUTES.auth} className="text-sm text-slate-200 transition hover:text-white">
              Login
            </Link>
            <Link
              to={ROUTES.auth}
              className="inline-flex items-center rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-5 py-2 text-sm font-semibold text-slate-900"
            >
              Jetzt starten
            </Link>
          </div>

          <button
            type="button"
            className="rounded-xl border border-white/20 p-2 text-white md:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-2 border-t border-white/10 px-4 py-6">
              <a href="#flow" className="block rounded-xl bg-white/5 px-4 py-3 text-white">
                Flow
              </a>
              <a href="#features" className="block rounded-xl bg-white/5 px-4 py-3 text-white">
                Features
              </a>
              <a href="#pricing" className="block rounded-xl bg-white/5 px-4 py-3 text-white">
                Preise
              </a>
              <div className="flex gap-3">
                <Link
                  to={ROUTES.auth}
                  className="flex-1 rounded-xl border border-white/20 px-4 py-3 text-center text-sm text-white"
                >
                  Login
                </Link>
                <Link
                  to={ROUTES.auth}
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-3 text-center text-sm font-semibold text-slate-900"
                >
                  Start
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_60%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-300">Made for modern resellers</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
                Eine moderne Plattform, die dich durch jeden Schritt leitet
              </h1>
              <p className="mt-6 text-lg text-slate-200">
                Vom ersten Produktnamen bis zum abgeschlossenen Verkauf: ResellTrack Pro sorgt für Übersicht,
                Geschwindigkeit und klare Next Steps – egal auf welchem Gerät.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to={ROUTES.auth}
                  className="inline-flex items-center rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30"
                >
                  Kostenfrei testen
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to={ROUTES.demo} className="inline-flex items-center rounded-2xl border border-white/30 px-6 py-3 text-base">
                  Demo ansehen
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-6 text-left text-sm text-slate-200 sm:grid-cols-3">
                <div>
                  <p className="text-3xl font-semibold text-white">4.8/5</p>
                  <p>Community Rating</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-white">120+</p>
                  <p>Produkte im Flow</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-white">24/7</p>
                  <p>Support & Guides</p>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.7)] backdrop-blur-3xl">
                <p className="text-sm uppercase tracking-[0.4em] text-slate-200">Live Preview</p>
                <div className="mt-4 space-y-4">
                  {['Produktname', 'Fotos hochladen', 'Preis optional'].map((step, index) => (
                    <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold">
                          0{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{step}</p>
                          <p className="text-xs text-slate-300">Ein Schritt. Keine Ablenkung.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  <p className="font-semibold text-white">Demo-Modus aktiv</p>
                  <p className="text-xs">Keine Sorge: In Demo-Accounts bleiben alle Aktionen geschützt.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="flow" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-300">Flow</p>
                <h2 className="mt-4 text-3xl font-bold">So fühlt sich das Produkt-Erstellen an</h2>
                <p className="mt-3 text-slate-200">
                  Jeder Step kommt als eigene Karte – mobilfreundlich, fokussiert und mit hilfreichen Hinweisen.
                </p>
              </div>
              <Link
                to={ROUTES.dashboardProductNew}
                className="inline-flex items-center rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold text-white"
              >
                Flow testen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {flowSteps.map((step) => (
                <div key={step.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{step.label}</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-200">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-300">Features</p>
            <h2 className="mt-4 text-3xl font-bold">Alles, was du brauchst, in Karten organisiert</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  whileHover={{ y: -4 }}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-white/10 p-3">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                      <p className="text-sm text-slate-200">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section id="testimonials" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="rounded-[32px] border border-white/10 bg-white/5 p-8">
                <Star className="h-8 w-8 text-amber-300" />
                <p className="mt-6 text-lg text-slate-100">“{testimonial.quote}”</p>
                <p className="mt-4 font-semibold text-white">{testimonial.author}</p>
                <p className="text-sm text-slate-300">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-300">Pricing</p>
            <h2 className="mt-4 text-3xl font-bold">Transparente Pakete</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className="rounded-[32px] border border-white/10 bg-white/5 p-8">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300">{plan.name}</p>
                <p className="mt-4 text-4xl font-bold text-white">{plan.price}</p>
                <p className="mt-2 text-slate-200">{plan.description}</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-200">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  to={ROUTES.auth}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 px-6 py-3 text-sm font-semibold text-white"
                >
                  {plan.name === 'Starter' ? 'Kostenfrei loslegen' : 'Pro buchen'}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ResellTrack Pro. Alle Rechte vorbehalten.</p>
          <div className="flex gap-4">
            <Link to={ROUTES.dashboardHelp} className="hover:text-white">
              Hilfe
            </Link>
            <Link to={ROUTES.pricing} className="hover:text-white">
              Preise
            </Link>
            <Link to={ROUTES.demo} className="hover:text-white">
              Demo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
