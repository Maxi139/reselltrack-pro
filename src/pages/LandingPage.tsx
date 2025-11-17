import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Smartphone, TrendingUp, Calendar, Shield, Star, Check, Menu, X, DollarSign, Package } from 'lucide-react'
import { useState } from 'react'
import { ROUTES } from '../routes'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RT</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">ResellTrack Pro</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary-500 transition-colors font-medium">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-500 transition-colors font-medium">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary-500 transition-colors font-medium">Testimonials</a>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to={ROUTES.auth} className="text-gray-600 hover:text-primary-500 transition-colors font-medium">
                Sign In
              </Link>
              <Link to={ROUTES.auth} className="btn-primary">
                Start Free Trial
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-primary-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-primary-500 font-medium">Features</a>
                <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-primary-500 font-medium">Pricing</a>
                <a href="#testimonials" className="block px-3 py-2 text-gray-600 hover:text-primary-500 font-medium">Testimonials</a>
                <div className="border-t border-gray-200 pt-2">
                  <Link to={ROUTES.auth} className="block px-3 py-2 text-gray-600 hover:text-primary-500 font-medium">Sign In</Link>
                  <Link to={ROUTES.auth} className="block w-full text-left px-3 py-2 btn-primary mt-2">Start Free Trial</Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Turn Your Side Hustle Into a
                  <span className="text-primary-500"> Profitable Business</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                  The all-in-one platform for resellers. Track inventory, manage customers, and grow your business with powerful analytics and automation.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={ROUTES.auth} className="btn-primary text-lg px-8 py-4">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link to={ROUTES.demo} className="btn-secondary text-lg px-8 py-4 text-center">
                  Watch Demo
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 sm:pt-8">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <DollarSign className="w-8 h-8 text-success-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">$15,750</div>
                  <div className="text-sm text-gray-600">Monthly Revenue</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <TrendingUp className="w-8 h-8 text-success-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">$3,240</div>
                  <div className="text-sm text-gray-600">Total Profit</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Package className="w-8 h-8 text-primary-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">25</div>
                  <div className="text-sm text-gray-600">Products Tracked</div>
                </div>
              </div>
            </div>

            {/* Right Column - Image Placeholder */}
            <div className="relative">
              <div className="bg-gradient-primary rounded-3xl p-8 lg:p-12 text-white shadow-xl">
                <div className="space-y-6">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">iPhone 14 Pro</span>
                      <span className="text-green-300">+$250</span>
                    </div>
                    <div className="text-sm opacity-80">Sold for $1,199 • Profit Margin: 21%</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">MacBook Air M2</span>
                      <span className="text-green-300">+$180</span>
                    </div>
                    <div className="text-sm opacity-80">Sold for $1,349 • Profit Margin: 13%</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">AirPods Pro</span>
                      <span className="text-green-300">+$95</span>
                    </div>
                    <div className="text-sm opacity-80">Sold for $279 • Profit Margin: 34%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Scale Your Reselling Business
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              From inventory tracking to customer management, we've got you covered with powerful tools designed specifically for resellers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="card-hover p-6 bg-white rounded-2xl shadow-sm h-full flex flex-col gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Inventory Tracking</h3>
              <p className="text-gray-600">
                Never lose track of your products again. Automatic profit calculations, status updates, and detailed product information.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-hover p-6 bg-white rounded-2xl shadow-sm h-full flex flex-col gap-3">
              <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Profit Analytics</h3>
              <p className="text-gray-600">
                Track your profits with detailed analytics. See which products are making you the most money and optimize your strategy.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-hover p-6 bg-white rounded-2xl shadow-sm h-full flex flex-col gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Automated Reminders</h3>
              <p className="text-gray-600">
                Never miss a follow-up or deadline. Automated reminders for customer communication and important tasks.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-hover p-6 bg-white rounded-2xl shadow-sm h-full flex flex-col gap-3">
              <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Reliable</h3>
              <p className="text-gray-600">
                Your data is safe with us. Enterprise-grade security and 99.9% uptime guarantee.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card-hover p-6 bg-white rounded-2xl shadow-sm h-full flex flex-col gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer Management</h3>
              <p className="text-gray-600">
                Keep track of your customers, their preferences, and purchase history. Build lasting relationships.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card-hover p-6 bg-white rounded-2xl shadow-sm h-full flex flex-col gap-3">
              <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Integration</h3>
              <p className="text-gray-600">
                Connect with popular marketplaces and tools. Import your existing data in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Successful Resellers
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of resellers who have transformed their business with ResellTrack Pro
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Testimonial 1 */}
            <div className="card-hover p-6 bg-gray-50 rounded-2xl shadow-sm h-full flex flex-col">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "ResellTrack Pro has completely transformed my reselling business. I've increased my profits by 40% in just 3 months!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">JD</span>
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">John Doe</div>
                  <div className="text-sm text-gray-600">Tech Reseller</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="card-hover p-6 bg-gray-50 rounded-2xl shadow-sm h-full flex flex-col">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The inventory tracking feature is a game-changer. I never lose track of my products anymore."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-success rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">SM</span>
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">Sarah Miller</div>
                  <div className="text-sm text-gray-600">Fashion Reseller</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="card-hover p-6 bg-gray-50 rounded-2xl shadow-sm h-full flex flex-col">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Best investment I've made for my business. The analytics help me make better decisions every day."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">MC</span>
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">Mike Chen</div>
                  <div className="text-sm text-gray-600">Electronics Reseller</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that's right for your business. Start free, upgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Starter Plan */}
            <div className="card-hover p-6 bg-white rounded-2xl shadow-sm flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">Free</div>
                <div className="text-gray-600">Perfect for beginners</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-success-500 mr-3" />
                  Up to 50 products
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-success-500 mr-3" />
                  Basic analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-success-500 mr-3" />
                  Customer management
                </li>
              </ul>
              <button className="w-full btn-secondary">
                Get Started Free
              </button>
            </div>

            {/* Professional Plan */}
            <div className="card-hover p-6 bg-white border-2 border-primary-500 rounded-2xl shadow-lg relative flex flex-col">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">$29</div>
                <div className="text-gray-600">per month</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-success-500 mr-3" />
                  Up to 500 products
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-success-500 mr-3" />
                  Advanced analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-success-500 mr-3" />
                  Priority support
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-success-500 mr-3" />
                  Integration support
                </li>
              </ul>
              <button className="w-full btn-primary">
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="card-hover p-6 bg-white rounded-2xl shadow-sm flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">$99</div>
                <div className="text-gray-600">per month</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-success-500 mr-3" />
                  Unlimited products
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-success-500 mr-3" />
                  Custom integrations
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-success-500 mr-3" />
                  Dedicated support
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="w-5 h-5 text-success-500 mr-3" />
                  Advanced security
                </li>
              </ul>
              <button className="w-full btn-secondary">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Reselling Business?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Join thousands of successful resellers who trust ResellTrack Pro to grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTES.auth} className="btn-primary text-lg px-8 py-4 bg-white text-primary-500 hover:bg-gray-100">
              Start Free Trial
            </Link>
            <Link to={ROUTES.demo} className="btn-outline-white text-lg px-8 py-4 text-center">
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RT</span>
                </div>
                <h3 className="text-lg font-bold">ResellTrack Pro</h3>
              </div>
              <p className="text-gray-400">
                The all-in-one platform for resellers to track inventory, manage customers, and grow their business.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ResellTrack Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}