/**
 * MobileNav Component
 * Mobile navigation content with accordion-style menus
 * Optimized for touch interactions
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plane,
  Building2,
  MapPin,
  Calendar,
  User,
  LogOut,
  Settings,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { useMobileNavigation } from '@/hooks/useMobileNavigation';

interface MobileNavProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isLoggedIn, onLogout }) => {
  const { t } = useTranslation('common');
  const { closeDrawer } = useMobileNavigation();

  const handleLogout = () => {
    onLogout?.();
    closeDrawer();
  };

  // Main navigation links
  const mainLinks = [
    { name: t('nav.flights'), path: '/flights', icon: Plane },
    { name: t('nav.hotels'), path: '/hotels', icon: Building2 },
    { name: t('nav.activities'), path: '/activities', icon: MapPin },
    { name: t('nav.itinerary'), path: '/planner', icon: Calendar },
  ];

  return (
    <nav className="flex flex-col py-2">
      {/* User Section (if logged in) */}
      {isLoggedIn && (
        <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-pink-50 border-b border-gray-200">
          <Link
            to="/dashboard"
            onClick={closeDrawer}
            className="flex items-center gap-3 w-full text-left min-h-[44px]"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{t('nav.myAccount')}</p>
              <p className="text-sm text-gray-600">{t('nav.viewProfile')}</p>
            </div>
          </Link>
        </div>
      )}

      {/* Main Navigation Links */}
      <div className="py-2 border-b border-gray-200">
        {mainLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={closeDrawer}
              className="
                flex items-center gap-3 w-full px-4 py-3
                text-gray-700 hover:bg-orange-50 hover:text-orange-600
                transition-colors
                min-h-[44px]
              "
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* About Section */}
      <div className="py-2 border-b border-gray-200">
        <Link
          to="/about"
          onClick={closeDrawer}
          className="
            flex items-center gap-3 w-full px-4 py-3
            text-gray-700 hover:bg-orange-50 hover:text-orange-600
            transition-colors
            min-h-[44px]
          "
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{t('nav.about')}</span>
        </Link>
        <Link
          to="/help"
          onClick={closeDrawer}
          className="
            flex items-center gap-3 w-full px-4 py-3
            text-gray-700 hover:bg-orange-50 hover:text-orange-600
            transition-colors
            min-h-[44px]
          "
        >
          <BookOpen className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Documentation</span>
        </Link>
        <Link
          to="/faq"
          onClick={closeDrawer}
          className="
            flex items-center gap-3 w-full px-4 py-3
            text-gray-700 hover:bg-orange-50 hover:text-orange-600
            transition-colors
            min-h-[44px]
          "
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">FAQ</span>
        </Link>
        <Link
          to="/help"
          onClick={closeDrawer}
          className="
            flex items-center gap-3 w-full px-4 py-3
            text-gray-700 hover:bg-orange-50 hover:text-orange-600
            transition-colors
            min-h-[44px]
          "
        >
          <BookOpen className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Documentation</span>
        </Link>
        <Link
          to="/faq"
          onClick={closeDrawer}
          className="
            flex items-center gap-3 w-full px-4 py-3
            text-gray-700 hover:bg-orange-50 hover:text-orange-600
            transition-colors
            min-h-[44px]
          "
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">FAQ</span>
        </Link>
      </div>

      {/* User Actions (if logged in) */}
      {isLoggedIn && (
        <div className="py-2">
          <Link
            to="/settings"
            onClick={closeDrawer}
            className="
              flex items-center gap-3 w-full px-4 py-3
              text-gray-700 hover:bg-orange-50 hover:text-orange-600
              transition-colors
              min-h-[44px]
            "
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{t('nav.settings')}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="
              flex items-center gap-3 w-full px-4 py-3
              text-red-600 hover:bg-red-50
              transition-colors
              min-h-[44px]
            "
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{t('nav.logout')}</span>
          </button>
        </div>
      )}

      {/* Login/Register (if not logged in) */}
      {!isLoggedIn && (
        <div className="py-4 px-4 space-y-2">
          <Link
            to="/auth"
            onClick={closeDrawer}
            className="
              flex items-center justify-center
              w-full py-3 px-4 rounded-lg
              bg-gradient-to-r from-orange-500 to-pink-500
              text-white font-medium
              hover:from-orange-600 hover:to-pink-600
              transition-all
              min-h-[44px]
            "
          >
            {t('nav.login')}
          </Link>
          <Link
            to="/auth"
            onClick={closeDrawer}
            className="
              flex items-center justify-center
              w-full py-3 px-4 rounded-lg
              border-2 border-orange-500
              text-orange-600 font-medium
              hover:bg-orange-50
              transition-colors
              min-h-[44px]
            "
          >
            {t('nav.signUp')}
          </Link>
        </div>
      )}
    </nav>
  );
};

export default MobileNav;
