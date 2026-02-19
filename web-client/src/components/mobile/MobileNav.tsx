/**
 * MobileNav Component
 * Mobile navigation content with accordion-style menus
 * Optimized for touch interactions
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ChevronRight,
  ChevronDown,
  Map,
  Compass,
  Wrench,
  Clock,
  Brain,
  Car,
  BarChart3,
  Building,
  Route,
  History,
} from 'lucide-react';
import { useMobileNavigation } from '@/hooks/useMobileNavigation';

interface MobileNavProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isLoggedIn, onLogout }) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { activeSection, toggleSection, closeDrawer } = useMobileNavigation();

  const handleNavigation = (path: string) => {
    navigate(path);
    closeDrawer();
  };

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

  // Discover menu items
  const discoverItems = [
    { name: t('nav.discoverMenu.culture'), path: '/destination/culture', icon: Compass },
    { name: t('nav.discoverMenu.adventure'), path: '/destination/adventure', icon: Map },
    { name: t('nav.discoverMenu.relaxation'), path: '/destination/relaxation', icon: User },
  ];

  // Tools menu items
  const toolsMenuItems = [
    {
      name: t('nav.toolsMenu.budgetPlanner'),
      path: '/tools/budget',
      icon: BarChart3,
      description: t('nav.toolsMenu.budgetPlannerDesc'),
    },
    {
      name: t('nav.toolsMenu.packingList'),
      path: '/tools/packing',
      icon: Building,
      description: t('nav.toolsMenu.packingListDesc'),
    },
    {
      name: t('nav.toolsMenu.weatherForecast'),
      path: '/tools/weather',
      icon: Clock,
      description: t('nav.toolsMenu.weatherForecastDesc'),
    },
    {
      name: t('nav.toolsMenu.travelHistory'),
      path: '/travel-history',
      icon: History,
      description: t('nav.toolsMenu.travelHistoryDesc'),
    },
    {
      name: t('nav.toolsMenu.routePlanner'),
      path: '/tools/route',
      icon: Route,
      description: t('nav.toolsMenu.routePlannerDesc'),
    },
    {
      name: t('nav.toolsMenu.transfers'),
      path: '/transfers',
      icon: Car,
      description: t('nav.toolsMenu.transfersDesc'),
    },
    {
      name: t('nav.toolsMenu.travelInsights'),
      path: '/insights',
      icon: Brain,
      description: t('nav.toolsMenu.travelInsightsDesc'),
    },
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

      {/* Discover Accordion */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('discover')}
          className="
            flex items-center justify-between w-full px-4 py-3
            text-gray-700 hover:bg-orange-50
            transition-colors
            min-h-[44px]
          "
          aria-expanded={activeSection === 'discover'}
        >
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5" />
            <span className="font-medium">{t('nav.discover')}</span>
          </div>
          {activeSection === 'discover' ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Discover Submenu */}
        {activeSection === 'discover' && (
          <div className="bg-gray-50 py-1">
            {discoverItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={closeDrawer}
                  className="
                    flex items-center gap-3 w-full px-8 py-2.5
                    text-gray-600 hover:text-orange-600 hover:bg-orange-50
                    transition-colors
                    min-h-[44px]
                  "
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Tools Accordion */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('tools')}
          className="
            flex items-center justify-between w-full px-4 py-3
            text-gray-700 hover:bg-orange-50
            transition-colors
            min-h-[44px]
          "
          aria-expanded={activeSection === 'tools'}
        >
          <div className="flex items-center gap-3">
            <Wrench className="w-5 h-5" />
            <span className="font-medium">{t('nav.tools')}</span>
          </div>
          {activeSection === 'tools' ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Tools Submenu */}
        {activeSection === 'tools' && (
          <div className="bg-gray-50 py-1">
            {toolsMenuItems.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.name}
                  to={tool.path}
                  onClick={closeDrawer}
                  className="
                    flex items-start gap-3 w-full px-8 py-2.5
                    text-gray-600 hover:text-orange-600 hover:bg-orange-50
                    transition-colors
                    min-h-[44px]
                  "
                >
                  <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{tool.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{tool.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
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
