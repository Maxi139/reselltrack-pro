import { useEffect } from 'react'
import { useAuthStore } from '../store'
import { authHelpers } from '../lib/supabase'

export function useAuth() {
  const { 
    user, 
    isLoading, 
    isDemo, 
    subscriptionTier, 
    trialEndsAt,
    signIn, 
    signUp, 
    signOut, 
    resetPassword, 
    updatePassword, 
    updateProfile,
    initializeAuth,
    setDemoMode 
  } = useAuthStore()

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth()

    // Subscribe to auth state changes
    const { data: { subscription } } = authHelpers.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        useAuthStore.setState({ user: session.user })
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({ user: null, isDemo: false })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const isPro = subscriptionTier === 'pro'
  const isTrial = subscriptionTier === 'trial'
  const isFree = subscriptionTier === 'free'
  const isDemoMode = isDemo

  const trialDaysRemaining = trialEndsAt ? 
    Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0

  const canAccessProFeatures = isPro || isTrial || isDemo

  return {
    user,
    isLoading,
    isDemo: isDemoMode,
    isPro,
    isTrial,
    isFree,
    subscriptionTier,
    trialEndsAt,
    trialDaysRemaining,
    canAccessProFeatures,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    setDemoMode,
  }
}