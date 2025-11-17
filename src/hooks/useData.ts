import { dbHelpers } from '../lib/supabase'
import { Product, ProductFilters, Category, Meeting, MeetingFilters, Analytics } from '../types'
import { useAuth } from './useAuth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Products
export function useProducts(filters?: ProductFilters) {
  const { user, isDemo } = useAuth()
  
  return useQuery({
    queryKey: ['products', filters, user?.id],
    queryFn: async () => {
      if (isDemo) {
        // Return demo data
        return getDemoProducts()
      }
      
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await dbHelpers.getProducts(user.id, filters)
      if (error) throw error
      return data || []
    },
    enabled: !!user || isDemo,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await dbHelpers.createProduct({
        ...product,
        user_id: user.id,
      })
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create product')
      console.error('Create product error:', error)
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      const { data, error } = await dbHelpers.updateProduct(id, updates)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update product')
      console.error('Update product error:', error)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await dbHelpers.deleteProduct(id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete product')
      console.error('Delete product error:', error)
    },
  })
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await dbHelpers.getCategories()
      if (error) throw error
      return data || []
    },
  })
}

// Meetings
export function useMeetings(filters?: MeetingFilters) {
  const { user, isDemo } = useAuth()
  
  return useQuery({
    queryKey: ['meetings', filters, user?.id],
    queryFn: async () => {
      if (isDemo) {
        // Return demo data
        return getDemoMeetings()
      }
      
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await dbHelpers.getMeetings(user.id, filters)
      if (error) throw error
      return data || []
    },
    enabled: !!user || isDemo,
  })
}

export function useCreateMeeting() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (meeting: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await dbHelpers.createMeeting({
        ...meeting,
        user_id: user.id,
      })
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      toast.success('Meeting scheduled successfully')
    },
    onError: (error) => {
      toast.error('Failed to schedule meeting')
      console.error('Create meeting error:', error)
    },
  })
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Meeting> }) => {
      const { data, error } = await dbHelpers.updateMeeting(id, updates)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      toast.success('Meeting updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update meeting')
      console.error('Update meeting error:', error)
    },
  })
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await dbHelpers.deleteMeeting(id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      toast.success('Meeting cancelled successfully')
    },
    onError: (error) => {
      toast.error('Failed to cancel meeting')
      console.error('Delete meeting error:', error)
    },
  })
}

// Analytics
export function useAnalytics(period: string = 'monthly') {
  const { user, isDemo } = useAuth()
  
  return useQuery({
    queryKey: ['analytics', period, user?.id],
    queryFn: async () => {
      if (isDemo) {
        // Return demo analytics
        return getDemoAnalytics()
      }
      
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await dbHelpers.getAnalytics(user.id, period)
      if (error) throw error
      return data
    },
    enabled: !!user || isDemo,
  })
}

// Demo data
function getDemoProducts(): Product[] {
  return [
    {
      id: '1',
      user_id: 'demo-user',
      name: 'iPhone 14 Pro',
      description: '128GB, Space Black, Excellent condition',
      purchase_price: 800,
      selling_price: 1050,
      purchase_date: '2024-10-15',
      selling_date: '2024-11-01',
      status: 'sold',
      condition: 'like_new',
      seller_name: 'John Smith',
      buyer_name: 'Sarah Johnson',
      profit: 250,
      created_at: '2024-10-15T10:00:00Z',
      updated_at: '2024-11-01T14:30:00Z',
      category: {
        id: '1',
        name: 'Phones',
        icon: 'smartphone',
        color: '#4C6FFF',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: '2',
      user_id: 'demo-user',
      name: 'AirPods Pro',
      description: '2nd generation, with MagSafe case',
      purchase_price: 180,
      selling_price: 220,
      purchase_date: '2024-11-10',
      status: 'in_stock',
      condition: 'like_new',
      seller_name: 'Mike Davis',
      profit: 40,
      created_at: '2024-11-10T09:15:00Z',
      updated_at: '2024-11-10T09:15:00Z',
      category: {
        id: '2',
        name: 'Audio',
        icon: 'headphones',
        color: '#8B5CF6',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: '3',
      user_id: 'demo-user',
      name: 'MacBook Pro 14"',
      description: 'M2 Pro, 16GB RAM, 512GB SSD',
      purchase_price: 1800,
      selling_price: 2100,
      purchase_date: '2024-09-20',
      selling_date: '2024-10-05',
      status: 'sold',
      condition: 'good',
      seller_name: 'Tech Store Liquidation',
      buyer_name: 'Alex Wilson',
      profit: 300,
      created_at: '2024-09-20T11:30:00Z',
      updated_at: '2024-10-05T16:45:00Z',
      category: {
        id: '3',
        name: 'Laptops',
        icon: 'laptop',
        color: '#F59E0B',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    },
  ]
}

function getDemoMeetings(): Meeting[] {
  return [
    {
      id: '1',
      user_id: 'demo-user',
      customer_name: 'Sarah Johnson',
      customer_contact: 'sarah.j@email.com',
      meeting_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      duration_minutes: 30,
      location: 'Starbucks Downtown',
      notes: 'Interested in iPhone 14 Pro, wants to see condition',
      status: 'scheduled',
      reminder_sent: false,
      created_at: '2024-11-14T10:00:00Z',
      updated_at: '2024-11-14T10:00:00Z',
      product: getDemoProducts()[0],
    },
    {
      id: '2',
      user_id: 'demo-user',
      customer_name: 'Mike Chen',
      customer_contact: '+1 (555) 123-4567',
      meeting_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      duration_minutes: 45,
      location: 'Best Buy Parking Lot',
      notes: 'Looking for AirPods Pro, confirmed availability',
      status: 'scheduled',
      reminder_sent: false,
      created_at: '2024-11-13T14:30:00Z',
      updated_at: '2024-11-13T14:30:00Z',
      product: getDemoProducts()[1],
    },
  ]
}

function getDemoAnalytics(): Analytics {
  return {
    total_products: 25,
    sold_products: 18,
    total_revenue: 15750,
    total_profit: 3240,
    avg_profit: 180,
    avg_days_to_sell: 12,
    current_inventory: 7,
    inventory_value: 2450,
    monthly_trend: [
      { month: '2024-07', revenue: 4200, profit: 850, products: 8 },
      { month: '2024-08', revenue: 5100, profit: 1100, products: 10 },
      { month: '2024-09', revenue: 4800, profit: 950, products: 9 },
      { month: '2024-10', revenue: 5650, profit: 1340, products: 12 },
    ],
  }
}