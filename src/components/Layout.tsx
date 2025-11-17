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

type SidebarPanelProps = {
  userName: string;
  subscriptionLabel: string;
  isDemoMode: boolean;
  onSignOut: () => void;
  currentPath: string;
  onNavigate?: () => void;
  onClose?: () => void;
};

const SidebarPanel: React.FC<SidebarPanelProps> = ({
  userName,
  subscriptionLabel,
  isDemoMode,
  onSignOut,
  currentPath,
  onNavigate,
  onClose
}) => {
  return (
    <div className="flex h-full flex-col rounded-[32px] border border-white/30 bg-white/90 p-2 text-slate-900 shadow-2xl backdrop-blur-3xl">
      <div className="rounded-[28px] bg-white/90 p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace</p>
              <p className="text-lg font-semibold text-slate-900">ResellTrack Pro</p>
              <p className="text-xs text-slate-500">Growth control center</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 shadow">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Signed in as</p>
              <p className="text-base font-semibold text-slate-900">{userName}</p>
            </div>
            <span className={`ml-auto inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              isDemoMode
                ? 'bg-blue-100 text-blue-800'
                : subscriptionLabel === 'Pro'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-200 text-slate-700'
            }`}>
              {subscriptionLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Navigation</span>
          {isDemoMode && (
            <span className="text-xs font-medium text-blue-600">Demo</span>
          )}
        </div>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => {
                  onNavigate?.();
                }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-xl'
                    : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  active ? 'bg-white/15 text-white' : 'bg-white text-slate-600 shadow'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span>{item.name}</span>
                {active && <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400"></span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-6 pb-6 pt-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 text-center shadow-inner">
          <p className="text-sm font-semibold text-slate-900">Upgrade for full access</p>
          <p className="mt-1 text-xs text-slate-500">Unlock automation, analytics & more</p>
          <Link
            to={ROUTES.pricing}
            onClick={() => onNavigate?.()}
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Upgrade plan
          </Link>
        </div>
        <button
          onClick={onSignOut}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, subscriptionTier, isDemoMode } = useAuthStore();

  const handleSignOut = async () => {
    try {
      if (isDemoMode) {
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

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const subscriptionLabel = isDemoMode ? 'Demo' : subscriptionTier === 'pro' ? 'Pro' : 'Free';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <button
              className="absolute inset-0 bg-slate-900/70 backdrop-blur"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation overlay"
            />
            <div className="relative ml-4 mr-8 mt-6 h-[calc(100%-3rem)] w-[320px] max-w-full">
              <SidebarPanel
                userName={userName}
                subscriptionLabel={subscriptionLabel}
                isDemoMode={isDemoMode}
                onSignOut={handleSignOut}
                currentPath={location.pathname}
                onNavigate={() => setSidebarOpen(false)}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        <div className="hidden lg:flex lg:w-[360px] lg:flex-col lg:p-8">
          <SidebarPanel
            userName={userName}
            subscriptionLabel={subscriptionLabel}
            isDemoMode={isDemoMode}
            onSignOut={handleSignOut}
            currentPath={location.pathname}
          />
        </div>

        <div className="flex flex-1 flex-col bg-white/80 backdrop-blur-xl">
          <header className="border-b border-white/60 bg-white/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden rounded-2xl border border-slate-200 p-2 text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                  aria-label="Open navigation menu"
                  aria-controls="dashboard-sidebar"
                  aria-expanded={sidebarOpen}
                >
                  <Menu className="h-5 w-5" />
                </button>

                <nav className="flex items-center gap-2 text-sm text-slate-500">
                  <Link to={ROUTES.dashboard} className="font-medium text-slate-600 hover:text-slate-900">
                    Dashboard
                  </Link>
                  {location.pathname !== ROUTES.dashboard && (
                    <>
                      <span className="text-slate-400">/</span>
                      <span className="font-semibold capitalize text-slate-900">
                        {location.pathname.split('/').pop()?.replace('-', ' ')}
                      </span>
                    </>
                  )}
                </nav>
              </div>

              <div className="flex items-center gap-3">
                {isDemoMode && (
                  <Link
                    to={ROUTES.pricing}
                    className="hidden sm:inline-flex items-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Unlock full access
                  </Link>
                )}
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    isDemoMode
                      ? 'bg-blue-50 text-blue-700'
                      : subscriptionLabel === 'Pro'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {subscriptionLabel}
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
