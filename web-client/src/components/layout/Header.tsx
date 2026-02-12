import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Menu,
  Heart,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  Map,
  Compass,
  Route,
  Plane,
  Building2,
  BarChart3,
  MapPin,
  Building,
  Car,
  Brain,
  Wrench,
  Clock,
  Calendar,
  History
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import { CartButton } from '@/components/cart';
import LanguageSelector from '@/components/common/LanguageSelector';
import FavoritesService from '@/services/api/FavoritesService';
import { MobileDrawer } from '@/components/mobile';
import { useMobileNavigation } from '@/hooks/useMobileNavigation';

interface HeaderProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn = false, onLogout }) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDiscoverMenu, setShowDiscoverMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { toggleDrawer } = useMobileNavigation();

  // Fetch favorites count when user is logged in
  useEffect(() => {
    const fetchFavoritesCount = async () => {
      if (isLoggedIn) {
        try {
          const response = await FavoritesService.getFavorites({ limit: 0 });
          setFavoritesCount(response.total || 0);
        } catch (error) {
          console.error('Failed to fetch favorites count:', error);
          setFavoritesCount(0);
        }
      } else {
        setFavoritesCount(0);
      }
    };

    fetchFavoritesCount();
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout?.();
  };

  const mainLinks = [
    { name: t('nav.flights'), path: '/flights', icon: Plane },
    { name: t('nav.hotels'), path: '/hotels', icon: Building2 },
    { name: t('nav.activities'), path: '/activities', icon: Route },
    { name: t('nav.map'), path: '/map', icon: Map },
    { name: t('nav.destinations'), path: '/destinations', icon: Compass }
  ];

  const toolsMenuItems = [
    { name: t('nav.toolsMenu.flightAnalytics'), path: '/analytics', icon: BarChart3, description: t('nav.toolsMenu.flightAnalyticsDesc') },
    { name: t('nav.toolsMenu.flightStatus'), path: '/flight-status', icon: Plane, description: t('nav.toolsMenu.flightStatusDesc') },
    { name: t('nav.toolsMenu.airportInfo'), path: '/airports', icon: MapPin, description: t('nav.toolsMenu.airportInfoDesc') },
    { name: t('nav.toolsMenu.airlineLookup'), path: '/airlines', icon: Building, description: t('nav.toolsMenu.airlineLookupDesc') },
    { name: t('nav.toolsMenu.transfers'), path: '/transfers', icon: Car, description: t('nav.toolsMenu.transfersDesc') },
    { name: t('nav.toolsMenu.travelInsights'), path: '/insights', icon: Brain, description: t('nav.toolsMenu.travelInsightsDesc') }
  ];

  return (
    <header className="fixed w-full max-w-full z-50 bg-white/80 backdrop-blur-md shadow-sm overflow-x-clip">
      <div className="w-full max-w-[100vw]">
        <nav className="flex items-center justify-between h-16 md:h-20 w-full max-w-full px-3 md:px-6 lg:px-8">
          {/* Left Section */}
          <div className="flex items-center gap-3 md:gap-6 lg:gap-8 flex-shrink-0">
            <Logo onClick={() => navigate('/')} />

            {/* Main Navigation */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              {mainLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="flex items-center gap-1.5 lg:gap-2 min-h-[44px] text-sm lg:text-base text-gray-700 hover:text-orange-500 transition-colors"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              {/* Discover Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowDiscoverMenu(true)}
                  onMouseLeave={() => setShowDiscoverMenu(false)}
                  className="flex items-center gap-1.5 lg:gap-2 min-h-[44px] text-sm lg:text-base text-gray-700 hover:text-orange-500 transition-colors"
                >
                  <span>{t('nav.discover')}</span>
                  <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4" />
                </button>

                {showDiscoverMenu && (
                  <div
                    onMouseEnter={() => setShowDiscoverMenu(true)}
                    onMouseLeave={() => setShowDiscoverMenu(false)}
                    className="absolute top-full left-0 w-60 lg:w-64 bg-white rounded-lg shadow-lg py-2 mt-2 z-50"
                  >
                    {[
                      { name: t('nav.discoverMenu.culture'), path: '/destination/culture', icon: Compass },
                      { name: t('nav.discoverMenu.adventure'), path: '/destination/adventure', icon: Map },
                      { name: t('nav.discoverMenu.relaxation'), path: '/destination/relaxation', icon: User }
                    ].map((category) => (
                      <Link
                        key={category.name}
                        to={category.path}
                        onClick={() => setShowDiscoverMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm lg:text-base hover:bg-orange-50 text-gray-700 hover:text-orange-500 transition-colors"
                      >
                        <category.icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                        <span>{category.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Tools Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowToolsMenu(true)}
                  onMouseLeave={() => setShowToolsMenu(false)}
                  className="flex items-center gap-1.5 lg:gap-2 min-h-[44px] text-sm lg:text-base text-gray-700 hover:text-orange-500 transition-colors"
                >
                  <Wrench className="w-4 h-4 flex-shrink-0" />
                  <span>{t('nav.tools')}</span>
                  <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4" />
                </button>

                {showToolsMenu && (
                  <div
                    onMouseEnter={() => setShowToolsMenu(true)}
                    onMouseLeave={() => setShowToolsMenu(false)}
                    className="absolute top-full left-0 w-72 lg:w-80 bg-white rounded-lg shadow-lg py-2 mt-2 z-50"
                  >
                    {toolsMenuItems.map((tool) => (
                      <Link
                        key={tool.name}
                        to={tool.path}
                        onClick={() => setShowToolsMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 min-h-[44px] hover:bg-orange-50 text-gray-700 hover:text-orange-500 transition-colors"
                      >
                        <tool.icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm lg:text-base">{tool.name}</div>
                          <div className="text-xs text-gray-500">{tool.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Link
              to="/planner"
              className="hidden md:flex items-center gap-2 px-4 py-2 min-h-[44px] text-sm lg:text-base bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Route className="w-4 h-4 flex-shrink-0" />
              <span>{t('nav.planTrip')}</span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {isLoggedIn ? (
              <>
                {/* Language Selector - Hidden on mobile */}
                <div className="hidden md:block">
                  <LanguageSelector variant="compact" />
                </div>

                {/* Shopping Cart - Always visible with touch target */}
                <div className="flex items-center">
                  <CartButton />
                </div>

                {/* Favorites - Touch-optimized */}
                <Link
                  to="/favorites"
                  className="hidden md:flex relative p-2 min-h-[44px] min-w-[44px] items-center justify-center text-gray-700 hover:text-orange-600 transition-colors duration-200 rounded-lg hover:bg-orange-50"
                  title={t('nav.viewFavorites')}
                >
                  <Heart className="w-6 h-6" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {favoritesCount > 99 ? '99+' : favoritesCount}
                    </span>
                  )}
                </Link>

                {/* Notifications - Touch-optimized */}
                <button
                  className="hidden md:flex relative p-2 min-h-[44px] min-w-[44px] items-center justify-center text-gray-700 hover:text-orange-600 transition-colors duration-200 rounded-lg hover:bg-orange-50"
                  aria-label={t('nav.notifications')}
                >
                  <Bell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    2
                  </span>
                </button>

                {/* User Menu - Touch-optimized on desktop, hidden on mobile (drawer handles this) */}
                <div className="hidden md:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 min-h-[44px] text-gray-700 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                    aria-label={t('nav.userMenu.profile')}
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-500" />
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute top-full right-0 w-56 bg-white rounded-lg shadow-lg py-2 mt-2 z-50">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 min-h-[44px] text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span>{t('nav.userMenu.profile')}</span>
                      </Link>
                      <Link
                        to="/planner"
                        className="flex items-center gap-3 px-4 py-2.5 min-h-[44px] text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Route className="w-4 h-4 flex-shrink-0" />
                        <span>{t('nav.userMenu.myTrips')}</span>
                      </Link>
                      <Link
                        to="/favorites"
                        className="flex items-center gap-3 px-4 py-2.5 min-h-[44px] text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Heart className="w-4 h-4 flex-shrink-0" />
                        <span>{t('nav.userMenu.favorites')}</span>
                      </Link>
                      <Link
                        to="/bookings"
                        className="flex items-center gap-3 px-4 py-2.5 min-h-[44px] text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{t('nav.userMenu.myBookings')}</span>
                      </Link>
                      <Link
                        to="/history"
                        className="flex items-center gap-3 px-4 py-2.5 min-h-[44px] text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <History className="w-4 h-4 flex-shrink-0" />
                        <span>{t('nav.userMenu.history')}</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 min-h-[44px] text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 flex-shrink-0" />
                        <span>{t('nav.userMenu.settings')}</span>
                      </Link>
                      <Link
                        to="/support"
                        className="flex items-center gap-3 px-4 py-2.5 min-h-[44px] text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <HelpCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{t('nav.userMenu.help')}</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 min-h-[44px] text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        <span>{t('nav.userMenu.logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Language Selector for logged-out users - Hidden on mobile */}
                <div className="hidden md:block">
                  <LanguageSelector variant="compact" />
                </div>

                <Link
                  to="/auth"
                  className="hidden md:flex items-center px-4 py-2 min-h-[44px] text-sm lg:text-base text-gray-700 hover:text-orange-500 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/auth"
                  className="hidden md:flex items-center px-4 py-2 min-h-[44px] text-sm lg:text-base bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  {t('nav.signUp')}
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              data-testid="mobile-menu-button"
              onClick={toggleDrawer}
              className="md:hidden text-gray-700 hover:text-orange-500 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer isLoggedIn={isLoggedIn} onLogout={onLogout} />
    </header>
  );
};

export default Header;