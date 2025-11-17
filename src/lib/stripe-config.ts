import { loadStripe } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

// Only load Stripe if we have a valid key (not placeholder)
let stripePromise: Promise<Stripe | null>

if (stripeKey && stripeKey !== 'placeholder-stripe-key' && stripeKey !== 'your_stripe_publishable_key') {
  stripePromise = loadStripe(stripeKey)
} else {
  console.warn('Stripe not configured - running without payment functionality')
  stripePromise = Promise.resolve(null)
}

export { stripePromise }

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
  stripePriceId?: string
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      'Up to 25 products',
      'Basic analytics',
      'Email support',
      'Mobile access',
      'Data export (CSV)',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious resellers',
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited products',
      'Advanced analytics',
      'Priority support',
      'All premium features',
      'Data export (PDF/Excel)',
      'Custom branding',
      'API access',
      'Team collaboration',
    ],
    popular: true,
    stripePriceId: 'price_pro_monthly', // Replace with actual Stripe price ID
  },
  {
    id: 'pro-yearly',
    name: 'Pro Annual',
    description: 'Save 20% with annual billing',
    price: 290,
    currency: 'USD',
    interval: 'year',
    features: [
      'Unlimited products',
      'Advanced analytics',
      'Priority support',
      'All premium features',
      'Data export (PDF/Excel)',
      'Custom branding',
      'API access',
      'Team collaboration',
      '2 months free',
    ],
    stripePriceId: 'price_pro_yearly', // Replace with actual Stripe price ID
  },
]

export interface PaymentSession {
  id: string
  url: string
  customer_email: string
  subscription_id?: string
}

export interface PaymentResult {
  success: boolean
  error?: string
  session?: PaymentSession
}

export async function createCheckoutSession(
  planId: string, 
  customerEmail?: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<PaymentResult> {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        customerEmail,
        successUrl: successUrl || `${window.location.origin}/payment-success`,
        cancelUrl: cancelUrl || `${window.location.origin}/pricing`,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create checkout session')
    }

    const { sessionId, url } = await response.json()
    
    return {
      success: true,
      session: {
        id: sessionId,
        url: url,
        customer_email: customerEmail || '',
      },
    }
  } catch (error) {
    console.error('Create checkout session error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function createCustomerPortal(sessionId: string): Promise<PaymentResult> {
  try {
    const response = await fetch('/api/create-customer-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create customer portal')
    }

    const { url } = await response.json()
    
    return {
      success: true,
      session: {
        id: sessionId,
        url: url,
        customer_email: '',
      },
    }
  } catch (error) {
    console.error('Create customer portal error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

export function getPlanFeatures(planId: string): string[] {
  const plan = subscriptionPlans.find(p => p.id === planId)
  return plan?.features || []
}