import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { createCheckoutSession, SubscriptionPlan, formatPrice } from '../lib/stripe-config'
import { useAuth } from '../hooks/useAuth'
import { Loader2, Check, Star } from 'lucide-react'

interface PricingCardProps {
  plan: SubscriptionPlan
  currentPlan?: string
  isPopular?: boolean
}

function PricingCard({ plan, currentPlan, isPopular }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please sign in to subscribe')
      navigate('/login')
      return
    }

    if (plan.id === 'free') {
      toast.info('You are already on the free plan')
      return
    }

    setIsLoading(true)

    try {
      const result = await createCheckoutSession(
        plan.id,
        user.email,
        `${window.location.origin}/dashboard`,
        `${window.location.origin}/pricing`
      )

      if (result.success && result.session?.url) {
        window.location.href = result.session.url
      } else {
        toast.error(result.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error('Failed to process subscription')
    } finally {
      setIsLoading(false)
    }
  }

  const isCurrentPlan = currentPlan === plan.id
  const isFree = plan.price === 0

  return (
    <div className={`relative rounded-2xl p-8 ${isPopular ? 'bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-500' : 'bg-white border border-gray-200'} shadow-lg hover:shadow-xl transition-shadow duration-300`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
            <Star className="w-3 h-3 mr-1" />
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-6">{plan.description}</p>
        
        <div className="mb-8">
          {isFree ? (
            <span className="text-4xl font-bold text-gray-900">Free</span>
          ) : (
            <div>
              <span className="text-4xl font-bold text-gray-900">
                {formatPrice(plan.price, plan.currency)}
              </span>
              <span className="text-gray-600 ml-2">/{plan.interval}</span>
            </div>
          )}
        </div>

        <ul className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center text-gray-700">
              <Check className="w-5 h-5 text-success mr-3 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={handleSubscribe}
          disabled={isLoading || isCurrentPlan}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : isPopular
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : isFree ? (
            'Current Plan'
          ) : (
            'Subscribe Now'
          )}
        </button>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const { user, subscriptionTier } = useAuth()
  const currentPlan = subscriptionTier || 'free'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg mr-3"></div>
              <h1 className="text-2xl font-bold text-gray-900">ResellTrack Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </a>
              {user ? (
                <a href="/dashboard" className="btn-primary">
                  Go to Dashboard
                </a>
              ) : (
                <a href="/login" className="btn-primary">
                  Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start for free and upgrade when you're ready to grow your reselling business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {subscriptionPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              isPopular={plan.popular}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h4>
              <p className="text-gray-600">Yes! You can upgrade or downgrade your plan at any time from your account settings.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600">All new accounts get a 14-day free trial of the Pro plan features.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">We accept all major credit cards through Stripe's secure payment processing.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}