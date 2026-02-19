import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart';
import { useAuth } from '@/services/auth/AuthService';
import { useLanguageSync } from '@/i18n/useLanguageSync';

export default function RootLayout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useLanguageSync();

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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:rounded-lg focus:font-medium"
      >
        Aller au contenu principal
      </a>
      {!hideHeaderFooter && <Header isLoggedIn={isAuthenticated} onLogout={handleLogout} />}
      <main id="main-content" className="flex-grow">
        <Outlet />
      </main>
      {!hideHeaderFooter && <Footer />}
      <CartDrawer />
    </div>
  );
}