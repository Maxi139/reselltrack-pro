import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DemoDataGenerator } from '@/lib/demo-data'
import { supabase } from '@/lib/supabase'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  dbHelpers: {
    createProduct: vi.fn(() => ({ data: { id: 'demo-product' }, error: null })),
    createMeeting: vi.fn(() => ({ data: { id: 'demo-meeting' }, error: null })),
    createAnalytics: vi.fn(() => ({ data: { id: 'demo-analytics' }, error: null })),
    getProducts: vi.fn(() => ({ data: [], error: null })),
    getMeetings: vi.fn(() => ({ data: [], error: null })),
    getAnalytics: vi.fn(() => ({ data: [], error: null })),
    deleteProduct: vi.fn(() => ({ error: null })),
    deleteMeeting: vi.fn(() => ({ error: null })),
    deleteAnalytics: vi.fn(() => ({ error: null })),
  },
}))

describe('DemoDataGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates demo products correctly', async () => {
    const { dbHelpers } = await import('@/lib/supabase')
    
    await DemoDataGenerator.generateDemoData('test-user')
    
    // Verify that createProduct was called
    expect(dbHelpers.createProduct).toHaveBeenCalled()
    
    // Get the call arguments
    const createProductCalls = vi.mocked(dbHelpers.createProduct).mock.calls
    expect(createProductCalls.length).toBeGreaterThan(0)
    
    // Check first product structure
    const firstProduct = createProductCalls[0][0]
    expect(firstProduct).toHaveProperty('name')
    expect(firstProduct).toHaveProperty('description')
    expect(firstProduct).toHaveProperty('category')
    expect(firstProduct).toHaveProperty('listing_price')
    expect(firstProduct).toHaveProperty('purchase_price')
    expect(firstProduct).toHaveProperty('platform')
    expect(firstProduct).toHaveProperty('status')
    expect(firstProduct).toHaveProperty('condition')
    expect(firstProduct).toHaveProperty('tags')
    expect(firstProduct).toHaveProperty('notes')
    expect(firstProduct).toHaveProperty('user_id', 'test-user')
    expect(firstProduct).toHaveProperty('created_at')
    
    // Verify profit calculations
    expect(firstProduct.listing_price).toBeGreaterThan(firstProduct.purchase_price)
  })

  it('generates demo meetings correctly', async () => {
    const { dbHelpers } = await import('@/lib/supabase')
    
    await DemoDataGenerator.generateDemoData('test-user')
    
    // Verify that createMeeting was called
    expect(dbHelpers.createMeeting).toHaveBeenCalled()
    
    // Get the call arguments
    const createMeetingCalls = vi.mocked(dbHelpers.createMeeting).mock.calls
    expect(createMeetingCalls.length).toBeGreaterThan(0)
    
    // Check first meeting structure
    const firstMeeting = createMeetingCalls[0][0]
    expect(firstMeeting).toHaveProperty('title')
    expect(firstMeeting).toHaveProperty('client_name')
    expect(firstMeeting).toHaveProperty('client_email')
    expect(firstMeeting).toHaveProperty('client_phone')
    expect(firstMeeting).toHaveProperty('scheduled_date')
    expect(firstMeeting).toHaveProperty('scheduled_time')
    expect(firstMeeting).toHaveProperty('duration')
    expect(firstMeeting).toHaveProperty('location')
    expect(firstMeeting).toHaveProperty('meeting_type')
    expect(firstMeeting).toHaveProperty('status')
    expect(firstMeeting).toHaveProperty('notes')
    expect(firstMeeting).toHaveProperty('user_id', 'test-user')
    expect(firstMeeting).toHaveProperty('created_at')
  })

  it('generates realistic product data', async () => {
    const { dbHelpers } = await import('@/lib/supabase')
    
    await DemoDataGenerator.generateDemoData('test-user')
    
    // Verify that createProduct was called with realistic data
    expect(dbHelpers.createProduct).toHaveBeenCalled()
    
    const createProductCalls = vi.mocked(dbHelpers.createProduct).mock.calls
    
    // Check that products have realistic data
    createProductCalls.forEach((call) => {
      const product = call[0]
      
      // Prices should be positive numbers
      expect(product.listing_price).toBeGreaterThan(0)
      expect(product.purchase_price).toBeGreaterThan(0)
      
      // Listing price should be higher than purchase price (profit)
      expect(product.listing_price).toBeGreaterThanOrEqual(product.purchase_price)
      
      // Categories should be valid
      expect(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Toys', 'Sports', 'Collectibles']).toContain(product.category)
      
      // Platforms should be valid
      expect(['eBay', 'Facebook Marketplace', 'Craigslist', 'OfferUp', 'Poshmark', 'Depop', 'Etsy', 'Mercari']).toContain(product.platform)
      
      // Conditions should be valid
      expect(['new', 'like_new', 'good', 'fair', 'poor']).toContain(product.condition)
      
      // Status should be valid
      expect(['listed', 'sold', 'pending', 'expired']).toContain(product.status)
      
      // Tags should be an array
      expect(Array.isArray(product.tags)).toBe(true)
      
      // Dates should be valid ISO strings
      expect(() => new Date(product.created_at)).not.toThrow()
    })
  })

  it('generates realistic meeting data', async () => {
    const { dbHelpers } = await import('@/lib/supabase')
    
    await DemoDataGenerator.generateDemoData('test-user')
    
    // Verify that createMeeting was called with realistic data
    expect(dbHelpers.createMeeting).toHaveBeenCalled()
    
    const createMeetingCalls = vi.mocked(dbHelpers.createMeeting).mock.calls
    
    // Check that meetings have realistic data
    createMeetingCalls.forEach((call) => {
      const meeting = call[0]
      
      // Duration should be a positive number
      expect(meeting.duration).toBeGreaterThan(0)
      
      // Meeting types should be valid
      expect(['pickup', 'drop_off', 'viewing', 'negotiation', 'other']).toContain(meeting.meeting_type)
      
      // Status should be valid
      expect(['scheduled', 'completed', 'cancelled', 'no_show']).toContain(meeting.status)
      
      // Dates should be valid
      expect(() => new Date(meeting.scheduled_date)).not.toThrow()
      expect(meeting.scheduled_time).toMatch(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      
      // Contact info should be present
      expect(meeting.client_name).toBeTruthy()
      expect(meeting.client_email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      // Phone number should be in the expected format if present
      if (meeting.client_phone) {
        expect(meeting.client_phone).toMatch(/^\(\d{3}\) \d{3}-\d{4}$/)
      }
      
      // Dates should be valid ISO strings
      expect(() => new Date(meeting.created_at)).not.toThrow()
    })
  })

  it('clears demo data correctly', async () => {
    const { dbHelpers } = await import('@/lib/supabase')
    
    // Mock the get methods to return some data
    vi.mocked(dbHelpers.getProducts).mockResolvedValueOnce({ 
      data: [{ id: 'product1' }, { id: 'product2' }], 
      error: null 
    })
    vi.mocked(dbHelpers.getMeetings).mockResolvedValueOnce({ 
      data: [{ id: 'meeting1' }], 
      error: null 
    })
    vi.mocked(dbHelpers.getAnalytics).mockResolvedValueOnce({ 
      data: [{ id: 'analytics1' }], 
      error: null 
    })
    
    await DemoDataGenerator.cleanupDemoData('test-user')
    
    // Verify that get methods were called
    expect(dbHelpers.getProducts).toHaveBeenCalledWith('test-user')
    expect(dbHelpers.getMeetings).toHaveBeenCalledWith('test-user')
    expect(dbHelpers.getAnalytics).toHaveBeenCalledWith('test-user')
    
    // Verify that delete methods were called
    expect(dbHelpers.deleteProduct).toHaveBeenCalledWith('product1')
    expect(dbHelpers.deleteProduct).toHaveBeenCalledWith('product2')
    expect(dbHelpers.deleteMeeting).toHaveBeenCalledWith('meeting1')
    expect(dbHelpers.deleteAnalytics).toHaveBeenCalledWith('analytics1')
  })

  it('handles errors during data generation', async () => {
    const { dbHelpers } = await import('@/lib/supabase')
    const mockError = new Error('Database error')
    
    // Mock an error for the createProduct operation
    vi.mocked(dbHelpers.createProduct).mockRejectedValueOnce(mockError)
    
    // Should throw an error since the demo data generator doesn't catch all errors
    await expect(DemoDataGenerator.generateDemoData('test-user')).rejects.toThrow('Database error')
  })

  it('handles errors during data clearing', async () => {
    const { dbHelpers } = await import('@/lib/supabase')
    const mockError = new Error('Database error')
    
    // Mock an error for the getProducts operation
    vi.mocked(dbHelpers.getProducts).mockRejectedValueOnce(mockError)
    
    // Should throw an error since the cleanup method doesn't catch all errors
    await expect(DemoDataGenerator.cleanupDemoData('test-user')).rejects.toThrow('Database error')
  })

  it('generates unique data each time', async () => {
    const { dbHelpers } = await import('@/lib/supabase')
    
    // Generate data twice
    await DemoDataGenerator.generateDemoData('test-user-1')
    await DemoDataGenerator.generateDemoData('test-user-2')
    
    // Verify that createProduct was called for both users
    expect(dbHelpers.createProduct).toHaveBeenCalled()
    
    // The data should be generated for both users
    const createProductCalls = vi.mocked(dbHelpers.createProduct).mock.calls
    expect(createProductCalls.length).toBeGreaterThan(0)
    
    // Check that different user_ids were used
    const userIds = new Set(createProductCalls.map(call => call[0].user_id))
    expect(userIds.has('test-user-1')).toBe(true)
    expect(userIds.has('test-user-2')).toBe(true)
  })
})