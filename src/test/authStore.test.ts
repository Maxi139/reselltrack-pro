import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  authHelpers: {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    updateProfile: vi.fn(),
  },
  dbHelpers: {
    getSubscription: vi.fn(() => ({ data: null, error: null })),
  },
}))

// Mock DemoDataGenerator
vi.mock('@/lib/demo-data', () => ({
  DemoDataGenerator: {
    generateDemoData: vi.fn(),
    cleanupDemoData: vi.fn(),
  },
}))

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      isLoading: false,
      isDemo: false,
      subscriptionTier: 'free',
      trialEndsAt: null,
    })
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuthStore())
    
    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isDemo).toBe(false)
    expect(result.current.subscriptionTier).toBe('free')
    expect(result.current.trialEndsAt).toBeNull()
  })

  it('should clear demo mode and data', async () => {
    const { DemoDataGenerator } = await import('@/lib/demo-data')
    const { result } = renderHook(() => useAuthStore())
    
    // First set demo mode
    await act(async () => {
      await result.current.setDemoMode(true)
    })
    
    // Then clear it
    await act(async () => {
      await result.current.setDemoMode(false)
    })
    
    expect(result.current.isDemo).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.subscriptionTier).toBe('free')
    expect(DemoDataGenerator.cleanupDemoData).toHaveBeenCalledWith('demo-user')
  })

  it('should handle sign up with error', async () => {
    const { authHelpers } = await import('@/lib/supabase')
    const mockError = new Error('Sign up failed')
    
    vi.mocked(authHelpers.signUp).mockRejectedValueOnce(mockError)
    
    const { result } = renderHook(() => useAuthStore())
    
    await expect(act(async () => {
      await result.current.signUp('test@example.com', 'password123', 'Test User')
    })).rejects.toThrow('Sign up failed')
  })

  it('should handle successful sign up', async () => {
    const { authHelpers } = await import('@/lib/supabase')
    const mockUser = { id: 'new-user', email: 'test@example.com' }
    const mockData = { user: mockUser, session: { access_token: 'token123' } }
    
    vi.mocked(authHelpers.signUp).mockResolvedValueOnce({ data: mockData, error: null })
    
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      await result.current.signUp('test@example.com', 'password123', 'Test User')
    })
    
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.subscriptionTier).toBe('trial')
    expect(result.current.trialEndsAt).toBeTruthy()
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle sign in with error', async () => {
    const { authHelpers } = await import('@/lib/supabase')
    const mockError = new Error('Invalid credentials')
    
    vi.mocked(authHelpers.signIn).mockRejectedValueOnce(mockError)
    
    const { result } = renderHook(() => useAuthStore())
    
    await expect(act(async () => {
      await result.current.signIn('test@example.com', 'password123')
    })).rejects.toThrow('Invalid credentials')
  })

  it('should handle successful sign in', async () => {
    const { authHelpers } = await import('@/lib/supabase')
    const mockUser = { id: 'existing-user', email: 'test@example.com' }
    const mockData = { user: mockUser, session: { access_token: 'token123' } }
    
    vi.mocked(authHelpers.signIn).mockResolvedValueOnce({ data: mockData, error: null })
    
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      await result.current.signIn('test@example.com', 'password123')
    })
    
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isDemo).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle sign out', async () => {
    const { authHelpers } = await import('@/lib/supabase')
    
    vi.mocked(authHelpers.signOut).mockResolvedValueOnce({ error: null })
    
    const { result } = renderHook(() => useAuthStore())
    
    // Set initial state
    act(() => {
      result.current.user = { id: 'user', email: 'test@example.com' } as any
      result.current.subscriptionTier = 'pro'
    })
    
    await act(async () => {
      await result.current.signOut()
    })
    
    expect(result.current.user).toBeNull()
    expect(result.current.subscriptionTier).toBe('free')
    expect(result.current.isLoading).toBe(false)
  })
})