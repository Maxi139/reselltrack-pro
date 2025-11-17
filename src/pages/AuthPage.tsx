import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../store/authStore'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'

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
  path: ["confirmPassword"],
})

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signIn, signUp, isLoading } = useAuth()
  const { setDemoMode } = useAuthStore()
  const navigate = useNavigate()

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onLogin = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid credentials'
      
      // Enhanced error handling for common authentication issues
      if (errorMessage.toLowerCase().includes('invalid')) {
        toast.error('Invalid email or password. Please check your credentials and try again.', {
          duration: 5000,
          description: 'Make sure you\'re using the correct email and password combination.'
        })
      } else if (errorMessage.toLowerCase().includes('network')) {
        toast.error('Network error. Please check your internet connection.', {
          duration: 5000,
          description: 'Unable to connect to the server. Please try again later.'
        })
      } else if (errorMessage.toLowerCase().includes('user')) {
        toast.error('User not found. Please check your email address.', {
          duration: 5000,
          description: 'If you don\'t have an account, you can create one for free.'
        })
      } else {
        toast.error(errorMessage, {
          duration: 5000,
          description: 'Please try again or contact support if the problem persists.'
        })
      }
      
      console.error('Login error:', error)
    }
  }

  const onSignup = async (data: SignupFormData) => {
    try {
      await signUp(data.email, data.password, data.fullName, data.businessName)
      toast.success('Account created successfully! Welcome to your free trial.', {
        duration: 4000,
        description: 'You now have access to all Pro features for 14 days.'
      })
      navigate('/dashboard')
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create account'
      
      // Enhanced error handling for signup issues
      if (errorMessage.toLowerCase().includes('email')) {
        toast.error('This email address is already registered.', {
          duration: 5000,
          description: 'Please sign in instead or use a different email address.'
        })
      } else if (errorMessage.toLowerCase().includes('weak')) {
        toast.error('Password is too weak.', {
          duration: 5000,
          description: 'Please use a stronger password with at least 8 characters, including numbers and special characters.'
        })
      } else if (errorMessage.toLowerCase().includes('network')) {
        toast.error('Network error during registration.', {
          duration: 5000,
          description: 'Please check your internet connection and try again.'
        })
      } else {
        toast.error(errorMessage, {
          duration: 5000,
          description: 'Please try again or contact support if the problem persists.'
        })
      }
      
      console.error('Signup error:', error)
    }
  }

  const handleDemoLogin = async () => {
    try {
      await setDemoMode(true);
      toast.success('Demo mode activated! Welcome to ResellTrack Pro demo.', {
        duration: 4000,
        description: 'You can explore all features with sample data. No registration required!'
      });
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to activate demo mode', {
        duration: 5000,
        description: 'Please try refreshing the page or contact support if the problem persists.'
      });
      console.error('Demo login error:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-success-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center px-6 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-primary rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-2xl">RT</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
            {isLogin ? 'Sign in to your ResellTrack Pro account' : 'Start your 14-day free trial'}
          </p>
        </div>

        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/40 dark:border-slate-700/50 animate-fade-in-up animate-delay-200">
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Email Address
                </label>
                <input
                  {...loginForm.register('email')}
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-200 text-base placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...loginForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-200 text-base placeholder-slate-400 dark:placeholder-slate-500 pr-12"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-4 text-lg font-semibold group transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Full Name
                </label>
                <input
                  {...signupForm.register('fullName')}
                  type="text"
                  className="input-modern"
                  placeholder="John Doe"
                />
                {signupForm.formState.errors.fullName && (
                  <p className="mt-1 text-sm text-error font-medium">{signupForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="businessName" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Business Name (Optional)
                </label>
                <input
                  {...signupForm.register('businessName')}
                  type="text"
                  className="input-modern"
                  placeholder="Your Business Name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Email Address
                </label>
                <input
                  {...signupForm.register('email')}
                  type="email"
                  className="input-modern"
                  placeholder="you@example.com"
                />
                {signupForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-error font-medium">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...signupForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="input-modern pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-error font-medium">{signupForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...signupForm.register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input-modern pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {signupForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-error font-medium">{signupForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-4 text-lg font-semibold group transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 font-medium">
                  Or try without signing up
                </span>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full btn-secondary py-4 text-lg font-semibold group transition-all duration-200"
                disabled={isLoading}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Try Demo Version
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                Explore all features with sample data - no registration required
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold text-base transition-colors duration-200 group"
              disabled={isLoading}
            >
              <span className="group-hover:underline">
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}