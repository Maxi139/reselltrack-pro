import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const appUrl = import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')

// Check if we're using placeholder values (development mode)
const isDevelopmentMode = supabaseUrl === 'https://placeholder.supabase.co' || 
                         supabaseUrl === 'your_supabase_url' ||
                         !supabaseUrl ||
                         supabaseAnonKey === 'placeholder-anon-key' ||
                         supabaseAnonKey === 'your_supabase_anon_key' ||
                         !supabaseAnonKey

let supabase: any

if (isDevelopmentMode) {
  console.warn('Running in development mode with placeholder Supabase credentials. Some features may be limited.')
  
  // Create a mock client for development that won't throw errors
  supabase = {
    auth: {
      signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: new Error('Supabase not configured') }),
      resetPasswordForEmail: async () => ({ data: null, error: new Error('Supabase not configured') }),
      updateUser: async () => ({ data: null, error: new Error('Supabase not configured') }),
      getSession: async () => ({ data: { session: null } }),
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: () => ({ 
        data: { 
          subscription: { 
            unsubscribe: () => {} 
          } 
        } 
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ data: null, error: new Error('Supabase not configured') }),
        is: () => ({ data: null, error: new Error('Supabase not configured') }),
        or: () => ({ data: null, error: new Error('Supabase not configured') }),
        order: () => ({ data: null, error: new Error('Supabase not configured') }),
        gte: () => ({ data: null, error: new Error('Supabase not configured') }),
        lte: () => ({ data: null, error: new Error('Supabase not configured') }),
        single: () => ({ data: null, error: new Error('Supabase not configured') }),
      }),
      insert: () => ({
        select: () => ({ data: null, error: new Error('Supabase not configured') }),
        single: () => ({ data: null, error: new Error('Supabase not configured') }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({ data: null, error: new Error('Supabase not configured') }),
          single: () => ({ data: null, error: new Error('Supabase not configured') }),
        }),
      }),
      delete: () => ({
        eq: () => ({ data: null, error: new Error('Supabase not configured') }),
      }),
    }),
    rpc: async () => ({ data: null, error: new Error('Supabase not configured') }),
  } as any
} else {
  // Use real Supabase client
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
      storageKey: 'reselltrack-pro-auth-token',
    },
    global: {
      headers: {
        'x-application-name': 'reselltrack-pro',
      },
    },
    db: {
      schema: 'public',
    },
  })
}

export { supabase }

// Auth helper functions
export const authHelpers = {
  async signUp(email: string, password: string, fullName: string, businessName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback`,
        data: {
          full_name: fullName,
          business_name: businessName,
          avatar_url: null,
          phone: null,
          currency: 'USD',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          subscription_tier: 'free',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14-day trial
        },
      },
    })
    return { data, error }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async signInWithProvider(provider: 'discord') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${appUrl}/auth/callback`,
        skipBrowserRedirect: true,
        scopes: provider === 'discord' ? 'identify email guilds email' : undefined,
      },
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
    })
    return { data, error }
  },

  async resendVerification(email: string) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback`,
      },
    })
    return { data, error }
  },

  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { data, error }
  },

  async updateProfile(updates: {
    fullName?: string
    businessName?: string
    phone?: string
    avatarUrl?: string
    currency?: string
    timezone?: string
  }) {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: updates.fullName,
        business_name: updates.businessName,
        phone: updates.phone,
        avatar_url: updates.avatarUrl,
        currency: updates.currency,
        timezone: updates.timezone,
      },
    })
    return { data, error }
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Database helper functions
export const dbHelpers = {
  // Products
  async getProducts(userId: string, filters?: any) {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category_id', filters.category)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,seller_name.ilike.%${filters.search}%,buyer_name.ilike.%${filters.search}%`)
    }

    if (filters?.sortBy) {
      const order = filters.sortOrder === 'desc' ? { ascending: false } : { ascending: true }
      query = query.order(filters.sortBy, order)
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    return { data, error }
  },

  async createProduct(product: any) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()
    return { data, error }
  },

  async updateProduct(id: string, updates: any) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    return { data, error }
  },

  // Meetings
  async getMeetings(userId: string, filters?: any) {
    let query = supabase
      .from('meetings')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters?.dateFrom) {
      query = query.gte('meeting_date', filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte('meeting_date', filters.dateTo)
    }

    query = query.order('meeting_date', { ascending: true })

    const { data, error } = await query
    return { data, error }
  },

  async createMeeting(meeting: any) {
    const { data, error } = await supabase
      .from('meetings')
      .insert([meeting])
      .select()
      .single()
    return { data, error }
  },

  async updateMeeting(id: string, updates: any) {
    const { data, error } = await supabase
      .from('meetings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteMeeting(id: string) {
    const { data, error } = await supabase
      .from('meetings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Analytics
  async getAnalytics(userId: string, period: string = 'monthly') {
    const { data, error } = await supabase
      .rpc('get_user_analytics', {
        p_user_id: userId,
        p_period: period,
      })
    return { data, error }
  },

  async getDashboardData(userId: string) {
    const { data, error } = await supabase
      .rpc('get_dashboard_data', {
        p_user_id: userId,
      })
    return { data, error }
  },

  // Subscriptions
  async getSubscription(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  async createSubscription(subscription: any) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscription])
      .select()
      .single()
    return { data, error }
  },

  async updateSubscription(id: string, updates: any) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Additional helper methods for demo data
  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async getMeeting(id: string) {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createAnalytics(analytics: any) {
    const { data, error } = await supabase
      .from('analytics')
      .insert([analytics])
      .select()
      .single()
    return { data, error }
  },

  async deleteAnalytics(id: string) {
    const { data, error } = await supabase
      .from('analytics')
      .delete()
      .eq('id', id)
    return { data, error }
  },
}

export default supabase