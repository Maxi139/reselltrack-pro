import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
  Star,
  UserRound,
  Building2,
  MessageCircle,
  Rocket,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../store/authStore'
import { ROUTES } from '../routes'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  businessName: z.string().optional(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

const DiscordIcon = () => (
  <svg viewBox="0 0 127.14 96.36" className="h-5 w-5" fill="currentColor" aria-hidden>
    <path d="M107.7 8.07A105.15 105.15 0 0081.28.5a72.06 72.06 0 00-3.36 6.91 97.68 97.68 0 00-29.71 0A72.06 72.06 0 0044.85.5a105.89 105.89 0 00-26.46 7.65C2.45 36.64-1.44 65.23.46 93.61A105.73 105.73 0 0029 103a76.43 76.43 0 005.9-9.57 68.42 68.42 0 0031.34 0A74 74 0 0072.1 103a105 105 0 0028.57-9.39c2.3-31.34-.46-59.76-5-85.54zM42.31 72.26c-5.66 0-10.29-5.35-10.29-11.93S36.46 48.4 42.31 48.4s10.37 5.35 10.3 11.93-4.63 11.93-10.3 11.93zm42.52 0c-5.65 0-10.29-5.35-10.29-11.93s4.63-11.93 10.29-11.93 10.37 5.35 10.3 11.93-4.64 11.93-10.3 11.93z" />
  </svg>
)

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [isDiscordLoading, setIsDiscordLoading] = useState(false)
  const { signIn, signUp, signInWithProvider, resendVerification, isLoading } = useAuth()
  const { setDemoMode } = useAuthStore()
  const navigate = useNavigate()

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const handleDiscordLogin = async () => {
    try {
      setIsDiscordLoading(true)
      await signInWithProvider('discord')
      toast.message('Weiterleitung zu Discord…', {
        description: 'Bitte autorisiere ResellTrack Pro, um dich sicher anzumelden.',
      })
    } catch (error: any) {
      toast.error(error?.message || 'Discord-Anmeldung fehlgeschlagen')
    } finally {
      setIsDiscordLoading(false)
    }
  }

  const onLogin = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid credentials'
      toast.error(errorMessage)
    }
  }

  const onSignup = async (data: SignupFormData) => {
    try {
      await signUp(data.email, data.password, data.fullName, data.businessName)
      setPendingEmail(data.email)
      setIsLogin(true)
      toast.success('Account created! Verify your email to continue.', {
        description: `We sent a secure login link to ${data.email}.`,
      })
      signupForm.reset()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create account')
    }
  }

  const handleDemoLogin = async () => {
    try {
      await setDemoMode(true)
      toast.success('Demo mode aktiviert!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to activate demo mode')
    }
  }

  const handleResendVerification = async () => {
    if (!pendingEmail) return
    try {
      setIsResending(true)
      await resendVerification(pendingEmail)
      toast.success('Verification email resent')
    } catch (error: any) {
      toast.error(error?.message || 'Unable to resend email')
    } finally {
      setIsResending(false)
    }
  }

  const primaryActionLabel = useMemo(() => (isLogin ? 'Sign In' : 'Create Account'), [isLogin])
  const isLoginSubmitting = loginForm.formState.isSubmitting || isLoading
  const isSignupSubmitting = signupForm.formState.isSubmitting || isLoading

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-gradient-to-br from-primary-500/40 via-primary-300/30 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-gradient-to-br from-success-400/20 via-primary-400/30 to-transparent blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-white/5 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to={ROUTES.landing} className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-300 text-xl font-bold shadow-glow">RT</div>
            <div>
              <p className="text-base font-semibold tracking-tight">ResellTrack Pro</p>
              <p className="text-xs text-white/60">Inventory · CRM · Automation</p>
            </div>
          </Link>
          <Link to={ROUTES.demo} className="hidden items-center gap-2 rounded-full border border-white/10 px-5 py-2 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white sm:flex">
            Open live demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-10 text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80">
            <Sparkles className="h-4 w-4 text-primary-200" />
            All-in-one cockpit for modern resellers
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Grow your resale brand with premium automation
            </h1>
            <p className="text-lg text-white/70">
              Manage stock, conversations, cashflow and meetings from one beautifully crafted platform powered by Supabase security and Discord SSO.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
              <div className="flex items-center gap-3 text-sm font-medium text-white/60">
                <ShieldCheck className="h-5 w-5 text-success-300" />
                Supabase Auth Layer
              </div>
              <p className="mt-3 text-base text-white/70">
                E-Mail-Login, Magic Links und Verifizierung laufen komplett über Supabase – kein zusätzlicher Code nötig.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
              <div className="flex items-center gap-3 text-sm font-medium text-white/60">
                <Star className="h-5 w-5 text-primary-200" />
                Discord Login ready
              </div>
              <p className="mt-3 text-base text-white/70">
                Crew-Mitglieder melden sich per Discord OAuth an und landen sofort in ihrem Workspace.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 rounded-3xl border border-white/5 bg-white/5/50 p-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/50">Integrations</p>
              <p className="text-lg font-semibold">Supabase · Discord · Stripe</p>
            </div>
            <div className="flex items-center gap-4 text-white/60">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Rocket className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-1 shadow-strong backdrop-blur-xl">
          <div className="rounded-[28px] bg-slate-900/60 p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white/60">Account Center</p>
                <p className="text-xl font-semibold text-white">{isLogin ? 'Sign in to your cockpit' : 'Create your workspace'}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-medium text-primary-200 transition hover:text-white"
              >
                {isLogin ? 'Need an account?' : 'Already a member?'}
              </button>
            </div>

            {pendingEmail && (
              <div className="mt-6 rounded-2xl border border-primary-400/40 bg-primary-500/10 p-4 text-sm text-white/80">
                <p className="font-semibold text-primary-100">Check {pendingEmail}</p>
                <p className="mt-1 text-white/70">Click the Supabase verification link we just sent to finish onboarding.</p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="mt-3 inline-flex items-center text-sm font-semibold text-primary-200 hover:text-white disabled:opacity-60"
                >
                  {isResending ? 'Sending…' : 'Resend verification email'}
                </button>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <button
                type="button"
                onClick={handleDiscordLogin}
                disabled={isDiscordLoading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-primary-300/50 hover:bg-white/10 disabled:opacity-60"
              >
                {isDiscordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DiscordIcon />}
                Continue with Discord
              </button>

              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/40">
                <span className="flex-1 border-t border-white/10" />
                or continue with email
                <span className="flex-1 border-t border-white/10" />
              </div>

              {isLogin ? (
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <label className="space-y-2 text-sm text-white/70">
                    Email address
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        {...loginForm.register('email')}
                        type="email"
                        placeholder="you@brand.com"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder:text-white/40 focus:border-primary-300 focus:outline-none"
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <span className="text-xs text-error-400">{loginForm.formState.errors.email.message}</span>
                    )}
                  </label>

                  <label className="space-y-2 text-sm text-white/70">
                    Password
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        {...loginForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-12 text-white placeholder:text-white/40 focus:border-primary-300 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <span className="text-xs text-error-400">{loginForm.formState.errors.password.message}</span>
                    )}
                  </label>

                  <button
                    type="submit"
                    disabled={isLoginSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-300 px-4 py-3 text-base font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-70"
                  >
                    {isLoginSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        {primaryActionLabel}
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                  <label className="space-y-2 text-sm text-white/70">
                    Full name
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        {...signupForm.register('fullName')}
                        type="text"
                        placeholder="Alex Rivera"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder:text-white/40 focus:border-primary-300 focus:outline-none"
                      />
                    </div>
                    {signupForm.formState.errors.fullName && (
                      <span className="text-xs text-error-400">{signupForm.formState.errors.fullName.message}</span>
                    )}
                  </label>

                  <label className="space-y-2 text-sm text-white/70">
                    Business name (optional)
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        {...signupForm.register('businessName')}
                        type="text"
                        placeholder="Prime Sneaker Vault"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder:text-white/40 focus:border-primary-300 focus:outline-none"
                      />
                    </div>
                  </label>

                  <label className="space-y-2 text-sm text-white/70">
                    Work email
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        {...signupForm.register('email')}
                        type="email"
                        placeholder="you@brand.com"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder:text-white/40 focus:border-primary-300 focus:outline-none"
                      />
                    </div>
                    {signupForm.formState.errors.email && (
                      <span className="text-xs text-error-400">{signupForm.formState.errors.email.message}</span>
                    )}
                  </label>

                  <label className="space-y-2 text-sm text-white/70">
                    Password
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        {...signupForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a secure password"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-12 text-white placeholder:text-white/40 focus:border-primary-300 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signupForm.formState.errors.password && (
                      <span className="text-xs text-error-400">{signupForm.formState.errors.password.message}</span>
                    )}
                  </label>

                  <label className="space-y-2 text-sm text-white/70">
                    Confirm password
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        {...signupForm.register('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repeat your password"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-12 text-white placeholder:text-white/40 focus:border-primary-300 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signupForm.formState.errors.confirmPassword && (
                      <span className="text-xs text-error-400">{signupForm.formState.errors.confirmPassword.message}</span>
                    )}
                  </label>

                  <button
                    type="submit"
                    disabled={isSignupSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-success-500 to-primary-400 px-4 py-3 text-base font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-70"
                  >
                    {isSignupSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      <>
                        {primaryActionLabel}
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-success-300/60 hover:text-white"
                >
                  Launch interactive demo
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-3 text-center text-xs text-white/50">Explore a fully populated workspace without creating an account.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
