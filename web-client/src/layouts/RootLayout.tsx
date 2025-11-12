import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/services/auth/AuthService';

export default function RootLayout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Don't show header/footer on auth pages only
  const isAuthPage = location.pathname === '/auth';
  const hideHeaderFooter = isAuthPage;

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeaderFooter && <Header isLoggedIn={isAuthenticated} onLogout={handleLogout} />}
      <div className="flex-grow">
        <Outlet />
      </div>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}