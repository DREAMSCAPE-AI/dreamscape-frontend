import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart';
import { useAuth } from '@/services/auth/AuthService';

export default function RootLayout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();

    try {
      localStorage.removeItem('dreamscape-onboarding');
    } catch (error) {
      console.error('[RootLayout] Failed to clear onboarding store:', error);
    }

    navigate('/');
  };

  const isAuthPage = location.pathname === '/auth';
  const hideHeaderFooter = isAuthPage;

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeaderFooter && <Header isLoggedIn={isAuthenticated} onLogout={handleLogout} />}
      <div className="flex-grow">
        <Outlet />
      </div>
      {!hideHeaderFooter && <Footer />}
      <CartDrawer />
    </div>
  );
}