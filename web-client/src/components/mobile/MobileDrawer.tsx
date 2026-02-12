/**
 * MobileDrawer Component
 * Slide-in navigation drawer for mobile devices
 * Features: Swipe-to-close, accordion menus, touch-optimized
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useMobileNavigation, useSwipe } from '@/hooks/useMobileNavigation';
import MobileNav from './MobileNav';

interface MobileDrawerProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ isLoggedIn, onLogout }) => {
  const { isDrawerOpen, closeDrawer } = useMobileNavigation();

  // Swipe-to-close gesture
  const swipeHandlers = useSwipe({
    onSwipeLeft: closeDrawer,
    threshold: 100,
  });

  // Prevent scroll on body when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="mobile-drawer-backdrop"
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        data-testid="mobile-drawer"
        className={`
          fixed top-0 right-0 h-screen w-[280px] max-w-[85vw]
          bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-out
          md:hidden
          ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        {...swipeHandlers}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            data-testid="mobile-drawer-close"
            onClick={closeDrawer}
            className="
              p-2 rounded-lg
              text-gray-500 hover:text-gray-700 hover:bg-gray-100
              transition-colors
              min-h-[44px] min-w-[44px]
              flex items-center justify-center
            "
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="overflow-y-auto h-[calc(100%-73px)] overscroll-contain">
          <MobileNav isLoggedIn={isLoggedIn} onLogout={onLogout} />
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
