import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  Calendar,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  TrendingUp,
  User
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { ROUTES } from '../routes';

const navigation = [
  { name: 'Dashboard', href: ROUTES.dashboard, icon: Home },
  { name: 'Products', href: ROUTES.dashboardProducts, icon: Package },
  { name: 'Meetings', href: ROUTES.dashboardMeetings, icon: Calendar },
  { name: 'Analytics', href: ROUTES.dashboardAnalytics, icon: BarChart3 },
  { name: 'Settings', href: ROUTES.dashboardSettings, icon: Settings },
  { name: 'Help', href: ROUTES.dashboardHelp, icon: HelpCircle },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, subscriptionTier, isDemoMode } = useAuthStore();

  const handleSignOut = async () => {
    try {
      if (isDemoMode) {
        // Clear demo session data
        sessionStorage.removeItem('is_demo_mode');
        sessionStorage.removeItem('demo_user_id');
        toast.success('Demo session ended');
      } else {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        toast.success('Signed out successfully');
      }
      
      navigate(ROUTES.landing);
    } catch (error) {
      toast.error('Error signing out');
      console.error('Sign out error:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const subscriptionLabel = isDemoMode ? 'Demo' : subscriptionTier === 'pro' ? 'Pro' : 'Free';

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-hidden={!sidebarOpen}>
          <button
            type="button"
            className="absolute inset-0 w-full h-full bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation menu"
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        id="dashboard-sidebar"
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:shadow-none lg:border-r lg:border-gray-200`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link to={ROUTES.dashboard} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">ResellTrack</span>
                <p className="text-xs text-gray-500">Pro Dashboard</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-600">{subscriptionLabel} Plan</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    isDemoMode ? 'bg-blue-100 text-blue-800' :
                    subscriptionTier === 'pro' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {subscriptionLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</h3>
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  id={item.name.toLowerCase() === 'products' ? 'products-link' :
                      item.name.toLowerCase() === 'meetings' ? 'meetings-link' : undefined}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    active
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : ''}`} />
                  <span>{item.name}</span>
                  {active && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sign out button */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</h3>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0 lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label="Open navigation menu"
                aria-controls="dashboard-sidebar"
                aria-expanded={sidebarOpen}
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm">
                <Link to={ROUTES.dashboard} className="text-gray-500 hover:text-gray-700">
                  Dashboard
                </Link>
                {location.pathname !== ROUTES.dashboard && (
                  <>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900 font-medium capitalize">
                      {location.pathname.split('/').pop()?.replace('-', ' ')}
                    </span>
                  </>
                )}
              </nav>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {isDemoMode && (
                <Link
                  to={ROUTES.pricing}
                  className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                >
                  Upgrade to Pro
                </Link>
              )}
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDemoMode 
                    ? 'bg-blue-100 text-blue-800'
                    : subscriptionTier === 'pro' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {subscriptionLabel}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}