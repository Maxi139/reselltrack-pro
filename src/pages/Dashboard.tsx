import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Calendar, Package, Users, DollarSign, Target, Clock, ArrowRight } from 'lucide-react';
import { supabase, dbHelpers } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import TutorialOverlay from '../components/TutorialOverlay';
import { ROUTES } from '../routes';
import { notifyDemoRestriction } from '../utils/demoMode';

interface DashboardStats {
  totalProducts: number;
  activeMeetings: number;
  totalRevenue: number;
  conversionRate: number;
  recentProducts: any[];
  upcomingMeetings: any[];
  monthlyTrend: {
    revenue: number[];
    products: number[];
    meetings: number[];
  };
}

export default function Dashboard() {
  const { user, subscriptionTier, isDemoMode } = useAuthStore();
  const [showTutorial, setShowTutorial] = useState(true);
  const handleDemoAction = (action: string) => notifyDemoRestriction(action);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('tutorial_completed', 'true');
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    localStorage.setItem('tutorial_completed', 'true');
  };

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [
        productsRes,
        meetingsRes,
        analyticsRes
      ] = await Promise.all([
        dbHelpers.getProducts(user.id),
        dbHelpers.getMeetings(user.id),
        dbHelpers.getAnalytics(user.id)
      ]);

      const products = productsRes.data || [];
      const meetings = meetingsRes.data || [];
      const analytics = analyticsRes.data || [];

      // Calculate stats
      const totalProducts = products.length;
      const activeMeetings = meetings.filter(m => m.status === 'scheduled').length;
      const totalRevenue = products.reduce((sum, p) => sum + (p.sold_price || 0), 0);
      const conversionRate = totalProducts > 0 ? (products.filter(p => p.status === 'sold').length / totalProducts) * 100 : 0;

      // Get recent items
      const recentProducts = products
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      const upcomingMeetings = meetings
        .filter(m => m.status === 'scheduled')
        .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
        .slice(0, 5);

      // Generate monthly trend data (last 6 months)
      const monthlyTrend = {
        revenue: [1200, 1450, 1800, 2100, 1950, 2400],
        products: [15, 18, 22, 25, 23, 28],
        meetings: [8, 10, 12, 15, 13, 18]
      };

      return {
        totalProducts,
        activeMeetings,
        totalRevenue,
        conversionRate,
        recentProducts,
        upcomingMeetings,
        monthlyTrend
      } as DashboardStats;
    },
    enabled: !!user?.id
  });

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      change: '+12%',
      changeType: 'positive' as const,
      color: 'blue'
    },
    {
      title: 'Active Meetings',
      value: stats?.activeMeetings || 0,
      icon: Calendar,
      change: '+5%',
      changeType: 'positive' as const,
      color: 'green'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      change: '+18%',
      changeType: 'positive' as const,
      color: 'purple'
    },
    {
      title: 'Conversion Rate',
      value: `${(stats?.conversionRate || 0).toFixed(1)}%`,
      icon: Target,
      change: '+2.3%',
      changeType: 'positive' as const,
      color: 'orange'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-900 dark:to-dark-800 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-10 bg-slate-200 dark:bg-dark-700 rounded-xl w-1/3 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl shadow-glass p-6 border border-white/30 dark:border-dark-700/50">
                <div className="h-5 bg-slate-200 dark:bg-dark-700 rounded-lg w-2/3 mb-4 animate-pulse"></div>
                <div className="h-10 bg-slate-200 dark:bg-dark-700 rounded-xl w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-900 dark:to-dark-800">
      {showTutorial && isDemoMode && (
        <TutorialOverlay onComplete={handleTutorialComplete} onSkip={handleTutorialSkip} />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div id="dashboard-header" className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Welcome back, {user?.user_metadata?.full_name || 'Reseller'}!
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {isDemoMode ? 'You are currently in demo mode. ' : ''}
            Here's your business overview for today.
          </p>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div id="demo-banner" className="mb-8 bg-gradient-to-r from-info-50 to-primary-50 dark:from-info-900/30 dark:to-primary-900/30 rounded-2xl p-6 border border-info-200 dark:border-info-800 shadow-glass animate-fade-in-up animate-delay-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-info rounded-xl flex items-center justify-center shadow-glow">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-bold text-info-800 dark:text-info-200 mb-1">Demo Mode Active</h3>
                <p className="text-info-700 dark:text-info-300 leading-relaxed">
                  You are viewing sample data. Upgrade to Pro to manage your own products and meetings.
                </p>
                <div className="mt-3">
                  <Link
                    to={ROUTES.pricing}
                    className="inline-flex items-center px-6 py-3 bg-gradient-primary text-white font-semibold rounded-xl hover:scale-105 transition-all duration-200 shadow-glow"
                  >
                    Upgrade to Pro
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div id="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600 dark:from-primary-900 dark:to-primary-800',
              green: 'bg-gradient-to-br from-success-100 to-success-200 text-success-600 dark:from-success-900 dark:to-success-800',
              purple: 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 dark:from-purple-900 dark:to-purple-800',
              orange: 'bg-gradient-to-br from-warning-100 to-warning-200 text-warning-600 dark:from-warning-900 dark:to-warning-800'
            };

            return (
              <div key={index} className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl shadow-glass p-6 hover:shadow-glass-strong transition-all duration-300 border border-white/30 dark:border-dark-700/50 group hover:-translate-y-1 animate-fade-in-up animate-delay-300">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-success mr-1" />
                        <span className="text-sm text-success font-semibold">{stat.change}</span>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl ${colorClasses[stat.color as keyof typeof colorClasses]} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Products */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/30 dark:border-dark-700/50 animate-fade-in-up animate-delay-500">
              <div className="px-8 py-6 border-b border-slate-200 dark:border-dark-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Products</h2>
                <Link
                  to={ROUTES.dashboardProducts}
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold flex items-center group transition-colors"
                >
                  View all
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="p-8">
                {stats?.recentProducts && stats.recentProducts.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-dark-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-dark-900/70 transition-all duration-200 group">
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                            <Package className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{product.name}</h3>
                            <p className="text-slate-600 dark:text-slate-300">
                              {product.category} • {formatDate(product.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="text-xl font-bold text-slate-900 dark:text-white">
                            {formatCurrency(product.listing_price || 0)}
                          </p>
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                            product.status === 'sold' 
                              ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                              : product.status === 'listed'
                              ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                              : 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow animate-bounce-in">
                      <Package className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">No products yet</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                      {isDemoMode 
                        ? 'Demo products will appear here automatically.'
                        : 'Start adding products to track your reselling business.'}
                    </p>
                    {isDemoMode ? (
                      <button
                        type="button"
                        onClick={() => handleDemoAction('Creating products')}
                        className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-600 font-semibold rounded-xl cursor-not-allowed"
                        aria-disabled
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Your First Product
                      </button>
                    ) : (
                      <Link
                        to={ROUTES.dashboardProductNew}
                        className="inline-flex items-center px-6 py-3 bg-gradient-primary text-white font-semibold rounded-xl hover:scale-105 transition-all duration-200 shadow-glow"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Your First Product
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="space-y-8">
            <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/30 dark:border-dark-700/50 animate-fade-in-up animate-delay-700">
              <div className="px-8 py-6 border-b border-slate-200 dark:border-dark-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Meetings</h2>
                <Link
                  to={ROUTES.dashboardMeetings}
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold flex items-center group transition-colors"
                >
                  View all
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="p-8">
                {stats?.upcomingMeetings && stats.upcomingMeetings.length > 0 ? (
                  <div className="space-y-6">
                    {stats.upcomingMeetings.map((meeting) => (
                      <div key={meeting.id} className="flex items-center space-x-6 p-4 bg-slate-50 dark:bg-dark-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-dark-900/70 transition-all duration-200 group">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-info rounded-2xl flex items-center justify-center shadow-glow">
                            <Calendar className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">{meeting.title}</p>
                          <p className="text-slate-600 dark:text-slate-300 mb-1">
                            {formatDate(meeting.scheduled_date)} at {meeting.scheduled_time}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400">
                            with {meeting.client_name}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-info rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow animate-bounce-in">
                      <Calendar className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">No meetings scheduled</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                      {isDemoMode
                        ? 'Demo meetings will appear here automatically.'
                        : 'Schedule meetings to manage your client interactions.'}
                    </p>
                    {isDemoMode ? (
                      <button
                        type="button"
                        onClick={() => handleDemoAction('Scheduling meetings')}
                        className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-600 font-semibold rounded-xl cursor-not-allowed"
                        aria-disabled
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Schedule Meeting
                      </button>
                    ) : (
                      <Link
                        to={ROUTES.dashboardMeetingNew}
                        className="inline-flex items-center px-6 py-3 bg-gradient-info text-white font-semibold rounded-xl hover:scale-105 transition-all duration-200 shadow-glow"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Schedule Meeting
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-3xl shadow-glass border border-white/30 dark:border-dark-700/50 animate-fade-in-up animate-delay-900">
              <div className="px-8 py-6 border-b border-slate-200 dark:border-dark-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quick Actions</h2>
              </div>
              <div className="p-8 space-y-4">
                {isDemoMode ? (
                  <button
                    type="button"
                    onClick={() => handleDemoAction('Creating products')}
                    className="w-full flex items-center justify-center px-6 py-4 bg-gray-200 text-gray-600 font-semibold rounded-xl cursor-not-allowed"
                    aria-disabled
                  >
                    <Plus className="h-5 w-5 mr-3" />
                    Add New Product
                  </button>
                ) : (
                  <Link
                    to={ROUTES.dashboardProductNew}
                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-primary text-white font-semibold rounded-xl hover:scale-105 transition-all duration-200 shadow-glow group"
                  >
                    <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform" />
                    Add New Product
                  </Link>
                )}
                {isDemoMode ? (
                  <button
                    type="button"
                    onClick={() => handleDemoAction('Scheduling meetings')}
                    className="w-full flex items-center justify-center px-6 py-4 bg-gray-200 text-gray-600 font-semibold rounded-xl cursor-not-allowed"
                    aria-disabled
                  >
                    <Calendar className="h-5 w-5 mr-3" />
                    Schedule Meeting
                  </button>
                ) : (
                  <Link
                    to={ROUTES.dashboardMeetingNew}
                    className="w-full flex items-center justify-center px-6 py-4 bg-white dark:bg-dark-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border-2 border-slate-200 dark:border-dark-600 hover:bg-slate-50 dark:hover:bg-dark-600 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 group"
                  >
                    <Calendar className="h-5 w-5 mr-3 text-primary-600" />
                    Schedule Meeting
                  </Link>
                )}
                {!isDemoMode && subscriptionTier === 'free' && (
                  <Link
                    to={ROUTES.pricing}
                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-success text-white font-semibold rounded-xl hover:scale-105 transition-all duration-200 shadow-glow group"
                  >
                    <TrendingUp className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                    Upgrade to Pro
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}