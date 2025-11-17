import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DemoPage from './pages/DemoPage';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Meetings from './pages/Meetings';
import Pricing from './pages/Pricing';
import ProductFormPage from './pages/ProductFormPage';
import MeetingFormPage from './pages/MeetingFormPage';
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './store';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { user, isLoading } = useAuth();
  const { isDemoMode } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/demo" element={<DemoPage />} />
          
          {/* Auth Routes */}
          <Route 
            path="/auth" 
            element={!user ? <AuthPage /> : <Navigate to="/dashboard" replace />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={(user || isDemoMode) ? <Layout /> : <Navigate to="/auth" replace />}
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="meetings/new" element={<MeetingFormPage />} />
            <Route path="meetings/:id/edit" element={<MeetingFormPage />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster 
          position="top-right"
          expand={false}
          richColors
          closeButton
          duration={4000}
        />
        
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;