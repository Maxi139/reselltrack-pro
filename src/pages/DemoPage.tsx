import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Smartphone, TrendingUp, Calendar, Star } from 'lucide-react';
import { useAuthStore } from '../store';
import { toast } from 'sonner';

const previewNavigation = [
  { label: 'Home', active: true },
  { label: 'Pricing', active: false },
  { label: 'Company', active: false },
  { label: 'Blog', active: false }
];

const previewTiles = [
  { title: 'Monthly revenue', value: '$18.4k', detail: '+12.4% vs last month' },
  { title: 'Average profit', value: '32%', detail: '4 pts above goal' },
  { title: 'Upcoming meetings', value: '6', detail: '3 later this week' },
  { title: 'New listings', value: '24', detail: 'Synced in last 7 days' }
];

const featureHighlights = [
  {
    title: 'Unified inventory',
    description: 'Track purchases, sales, and profit per SKU with instant syncing across every device.',
    icon: Smartphone
  },
  {
    title: 'Pro analytics',
    description: 'Clear revenue trends, win rates, and cohort analysis so you know exactly what to scale next.',
    icon: TrendingUp
  },
  {
    title: 'Meeting intelligence',
    description: 'Schedule, remind, and close deals with an integrated calendar that understands your pipeline.',
    icon: Calendar
  }
];

export default function DemoPage() {
  const navigate = useNavigate();
  const { setDemoMode } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: 'Welcome to ResellTrack Pro Demo',
      description: 'Experience all features with pre-loaded demo data. No signup required!',
      icon: <Star className="w-8 h-8 text-yellow-500" />
    },
    {
      title: 'Smart Inventory Tracking',
      description: 'Track products, calculate profits automatically, and manage your inventory efficiently.',
      icon: <Smartphone className="w-8 h-8 text-primary-600" />
    },
    {
      title: 'Advanced Analytics',
      description: 'Get insights into your business performance with detailed charts and profit analysis.',
      icon: <TrendingUp className="w-8 h-8 text-success-500" />
    },
    {
      title: 'Meeting Management',
      description: 'Schedule and track customer meetings, set reminders, and manage your sales pipeline.',
      icon: <Calendar className="w-8 h-8 text-info" />
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [demoSteps.length]);

  const handleStartDemo = async () => {
    setIsLoading(true);

    try {
      await setDemoMode(true);
      toast.success('Demo mode activated!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error starting demo:', error);
      toast.error('Failed to start demo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-900 dark:bg-dark-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_60%)]" />
        <div className="absolute bottom-0 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[160px]" />
      </div>

      <div className="relative z-10">
        <header className="border-b border-white/20 bg-white/80 backdrop-blur-xl dark:border-dark-800 dark:bg-dark-900/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-lg">
                <span className="text-lg font-bold">RT</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live demo</p>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">ResellTrack Pro</h1>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-dark-700 dark:text-slate-300"
            >
              Back to home
            </button>
          </div>
        </header>

        <main>
          <section className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-1 text-sm font-semibold text-slate-600 shadow-sm">
                <Star className="h-4 w-4 text-yellow-500" />
                Interactive walkthrough
              </span>

              <div className="space-y-4">
                <h2 className="text-4xl font-bold leading-tight text-white drop-shadow-sm sm:text-5xl">
                  Experience the new
                  <span className="text-primary-200"> ResellTrack workspace</span>
                </h2>
                <p className="text-lg text-slate-200">
                  Explore the latest layout, modern sidebar, and simplified tiles exactly like you will see inside the product.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={handleStartDemo}
                  disabled={isLoading}
                  className="group inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Launching demo…' : 'Start interactive demo'}
                  {!isLoading && <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />}
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/40 px-6 py-3 text-base font-semibold text-white transition hover:border-white"
                >
                  View pricing
                </button>
              </div>

              <div className="rounded-[32px] border border-white/30 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:bg-dark-800/80">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white">
                    {demoSteps[currentStep].icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Live preview step</p>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{demoSteps[currentStep].title}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {demoSteps[currentStep].description}
                    </p>
                  </div>
                </motion.div>
                <div className="mt-6 flex gap-2">
                  {demoSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentStep ? 'w-12 bg-slate-900' : 'w-6 bg-slate-200 hover:bg-slate-300'
                      }`}
                      aria-label={`Show step ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="relative">
              <div className="rounded-[40px] border border-white/30 bg-white/90 p-6 shadow-[0_25px_70px_rgba(15,23,42,0.25)] backdrop-blur-2xl dark:bg-dark-800/90">
                <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
                  <aside className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sidebar preview</p>
                    <ul className="mt-4 space-y-2">
                      {previewNavigation.map((item) => (
                        <li key={item.label}>
                          <button
                            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                              item.active
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'text-slate-500 hover:bg-slate-100'
                            }`}
                            type="button"
                          >
                            {item.label}
                            {item.active && <span className="h-2 w-2 rounded-full bg-emerald-400"></span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-400/90 px-4 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-400"
                      type="button"
                    >
                      Apply for access
                    </button>
                  </aside>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {previewTiles.map((tile) => (
                        <div key={tile.title} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4 shadow-inner">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{tile.title}</p>
                          <p className="mt-2 text-2xl font-bold text-slate-900">{tile.value}</p>
                          <p className="text-sm text-slate-500">{tile.detail}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-600">Live timeline</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {['Inventory automation', 'Realtime analytics', 'Meeting reminders'].map((chip) => (
                          <span
                            key={chip}
                            className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -bottom-8 -left-8 hidden sm:block rounded-3xl border border-white/40 bg-white/30 px-4 py-2 text-xs font-semibold text-slate-600 shadow-xl backdrop-blur">
                Desktop preview
              </div>
            </div>
          </section>

          <section className="bg-white/80 py-16 dark:bg-dark-900/90">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">What you get inside the demo</h2>
                <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
                  Explore every feature with structured guidance and modern UI components ready for production.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {featureHighlights.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-dark-700 dark:bg-dark-800"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-12 grid gap-6 lg:grid-cols-2">
                {[{
                  title: "What's included",
                  items: [
                    '10+ sample products with realistic data',
                    '5 scheduled customer meetings',
                    'Analytics dashboard with sample metrics',
                    'Interactive tutorial system',
                    'Full access to all features'
                  ]
                }, {
                  title: 'Demo benefits',
                  items: [
                    'No credit card required',
                    'No personal information needed',
                    'Realistic business scenarios',
                    'Try before you buy',
                    'Learn the platform quickly'
                  ]
                }].map((section) => (
                  <div
                    key={section.title}
                    className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-inner dark:border-dark-700 dark:bg-dark-800"
                  >
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{section.title}</h3>
                    <ul className="mt-6 space-y-3">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                          <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-white/20 bg-white/70 py-16 dark:border-dark-800 dark:bg-dark-900/90">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Ready when you are</p>
              <h2 className="mt-3 text-4xl font-bold text-slate-900 dark:text-white">Launch the live demo in seconds</h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                Activate demo mode instantly. Your workspace is pre-filled with data so you can test real workflows with zero setup.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  onClick={handleStartDemo}
                  disabled={isLoading}
                  className="group inline-flex items-center justify-center rounded-2xl bg-slate-900 px-8 py-3 text-base font-semibold text-white shadow-xl transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Launching demo…' : 'Start demo experience'}
                  {!isLoading && <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />}
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-8 py-3 text-base font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Compare plans
                </button>
              </div>
              <p className="mt-6 text-sm text-slate-500">
                Demo expires in 24 hours • No personal data required
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
