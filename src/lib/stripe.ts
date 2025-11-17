import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
  stripePriceId: string
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
    stripePriceId: '',
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
    name: 'Pro',
    description: 'Annual plan - Save 20%',
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
    popular: false,
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

export const stripeHelpers = {
  async createCheckoutSession(planId: string, customerEmail?: string): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          customerEmail,
          successUrl: `${import.meta.env.VITE_APP_URL}/payment-success`,
          cancelUrl: `${import.meta.env.VITE_APP_URL}/pricing`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
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
  },

  async createCustomerPortal(sessionId: string): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/create-customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create customer portal')
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
  },

  async handleWebhook(event: any): Promise<void> {
    // Handle Stripe webhooks for subscription events
    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful payment
        break
      case 'customer.subscription.updated':
        // Handle subscription updates
        break
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  },
}

export default stripeHelpers