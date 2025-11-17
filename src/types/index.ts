export interface User {
  id: string
  email: string
  full_name?: string
  business_name?: string
  avatar_url?: string
  phone?: string
  currency?: string
  timezone?: string
  subscription_tier?: 'free' | 'pro' | 'trial' | 'demo'
  trial_ends_at?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  user_id: string
  category_id?: string
  name: string
  description?: string
  purchase_price: number
  selling_price?: number
  purchase_date: string
  selling_date?: string
  seller_name?: string
  seller_contact?: string
  buyer_name?: string
  buyer_contact?: string
  status: 'in_stock' | 'sold' | 'reserved' | 'returned'
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  serial_number?: string
  location?: string
  notes?: string
  images?: string[]
  profit?: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface Category {
  id: string
  name: string
  icon?: string
  color?: string
  is_active: boolean
  created_at: string
}

export interface Meeting {
  id: string
  user_id: string
  product_id?: string
  customer_name: string
  customer_contact?: string
  meeting_date: string
  duration_minutes: number
  location?: string
  notes?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  reminder_sent: boolean
  created_at: string
  updated_at: string
  product?: Product
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  tier: 'free' | 'pro'
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface Analytics {
  total_products: number
  sold_products: number
  total_revenue: number
  total_profit: number
  avg_profit: number
  avg_days_to_sell: number
  current_inventory: number
  inventory_value: number
  monthly_trend: {
    month: string
    revenue: number
    profit: number
    products: number
  }[]
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface ProductFilters {
  status?: 'all' | 'in_stock' | 'sold' | 'reserved' | 'returned'
  category?: string
  search?: string
  sortBy?: 'name' | 'purchase_date' | 'selling_date' | 'profit' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
}

export interface MeetingFilters {
  status?: 'all' | 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  dateFrom?: string
  dateTo?: string
  search?: string
}