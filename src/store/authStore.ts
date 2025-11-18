import { authHelpers, dbHelpers } from '../lib/supabase'
import { DemoDataGenerator } from '../lib/demo-data'
import type { User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  isLoading: boolean
  isDemo: boolean
  subscriptionTier: 'free' | 'pro' | 'trial' | 'demo'
  trialEndsAt: Date | null
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, businessName?: string) => Promise<void>
  signInWithProvider: (provider: 'discord') => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateProfile: (updates: any) => Promise<void>
  checkSubscription: () => Promise<void>
  resendVerification: (email: string) => Promise<void>
  setDemoMode: (enabled: boolean) => void
  initializeAuth: () => Promise<void>
}

export interface AuthGetters {
  isDemoMode: boolean
}

export type AuthStore = AuthState & AuthActions & AuthGetters

import { create } from 'zustand'

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  isLoading: true,
  isDemo: false,
  subscriptionTier: 'free',
  trialEndsAt: null,

  // Actions
  async initializeAuth() {
    set({ isLoading: true })
    
    try {
      // Check if we're in demo mode
      const isDemoMode = sessionStorage.getItem('is_demo_mode') === 'true';
      const demoUserId = sessionStorage.getItem('demo_user_id');
      
      if (isDemoMode && demoUserId) {
        // Set demo mode
        await get().setDemoMode(true);
      } else {
        // Check for regular user
        const user = await authHelpers.getUser()

        if (user) {
          await get().checkSubscription()
          set({ user })
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  async signIn(email: string, password: string) {
    set({ isLoading: true })
    
    try {
      const { data, error } = await authHelpers.signIn(email, password)
      
      if (error) throw error
      
      if (data.user) {
        await get().checkSubscription()
        set({ user: data.user, isDemo: false })
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  async signUp(email: string, password: string, fullName: string, businessName?: string) {
    set({ isLoading: true })

    try {
      const { data, error } = await authHelpers.signUp(email, password, fullName, businessName)

      if (error) throw error
      // Supabase requires email verification, so we let the user confirm via email
      if (data.user) {
        set({
          isDemo: false,
          subscriptionTier: 'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        })
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  async signInWithProvider(provider: 'discord') {
    set({ isLoading: true })

    try {
      const { data, error } = await authHelpers.signInWithProvider(provider)
      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('OAuth sign in error:', error)
      set({ isLoading: false })
      throw error
    }
  },

  async signOut() {
    set({ isLoading: true })
    
    try {
      const { error } = await authHelpers.signOut()
      
      if (error) throw error
      
      set({ 
        user: null, 
        isDemo: false,
        subscriptionTier: 'free',
        trialEndsAt: null
      })
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  async resetPassword(email: string) {
    const { error } = await authHelpers.resetPassword(email)
    if (error) throw error
  },

  async updatePassword(newPassword: string) {
    const { error } = await authHelpers.updatePassword(newPassword)
    if (error) throw error
  },

  async updateProfile(updates: any) {
    const { error } = await authHelpers.updateProfile(updates)
    if (error) throw error
    
    // Update local user data
    const { user } = get()
    if (user) {
      set({ 
        user: { 
          ...user, 
          user_metadata: { 
            ...user.user_metadata, 
            ...updates 
          } 
        } 
      })
    }
  },

  async checkSubscription() {
    const { user } = get()
    if (!user) return

    try {
      const { data: subscription } = await dbHelpers.getSubscription(user.id)
      
      if (subscription) {
        set({ 
          subscriptionTier: subscription.tier,
          trialEndsAt: subscription.trial_ends_at ? new Date(subscription.trial_ends_at) : null
        })
      } else {
        // Check if trial has ended
        const userCreatedAt = new Date(user.created_at)
        const trialEndDate = new Date(userCreatedAt.getTime() + 14 * 24 * 60 * 60 * 1000)
        const now = new Date()
        
        if (now > trialEndDate) {
          set({ subscriptionTier: 'free' })
        } else {
          set({ 
            subscriptionTier: 'trial',
            trialEndsAt: trialEndDate
          })
        }
      }
    } catch (error) {
      console.error('Subscription check error:', error)
    }
  },

  async resendVerification(email: string) {
    const { error } = await authHelpers.resendVerification(email)
    if (error) throw error
  },

  async setDemoMode(enabled: boolean) {
    if (enabled) {
      set({ 
        isDemo: true,
        user: {
          id: 'demo-user',
          email: 'demo@reselltrack.com',
          user_metadata: {
            full_name: 'Demo User',
            business_name: 'Demo Business',
            avatar_url: null,
            subscription_tier: 'demo'
          }
        } as User,
        subscriptionTier: 'demo'
      });

      // Generate demo data for demo mode
      try {
        await DemoDataGenerator.generateDemoData('demo-user');
        console.log('Demo data generated successfully');
      } catch (error) {
        console.error('Error generating demo data:', error);
      }
    } else {
      set({ 
        isDemo: false,
        user: null,
        subscriptionTier: 'free'
      });

      // Clean up demo data
      try {
        await DemoDataGenerator.cleanupDemoData('demo-user');
        console.log('Demo data cleaned up');
      } catch (error) {
        console.error('Error cleaning up demo data:', error);
      }
    }
  },
  
  // Getters
  get isDemoMode() {
    return get().isDemo
  },
}))