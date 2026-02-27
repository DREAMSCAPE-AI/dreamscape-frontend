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
import FavoritesService from '@/services/user/FavoritesService';
import notificationService from '@/services/user/NotificationService';
import NotificationCenter from '@/components/notifications/NotificationCenter';
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { toggleDrawer, isDrawerOpen } = useMobileNavigation();

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

  // Load unread notifications count + connect Socket.io when logged in
  useEffect(() => {
    if (isLoggedIn) {
      notificationService.getUnreadCount()
        .then(setUnreadNotificationsCount)
        .catch(() => setUnreadNotificationsCount(0));

      notificationService.connect();
      const handleNewNotification = () => {
        notificationService.getUnreadCount()
          .then(setUnreadNotificationsCount)
          .catch(() => {});
      };
      notificationService.onNewNotification(handleNewNotification);

      return () => {
        notificationService.offNewNotification(handleNewNotification);
        notificationService.disconnect();
      };
    }

    setUnreadNotificationsCount(0);
    notificationService.disconnect();
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
    <header className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="w-full px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          {/* Left Section */}
          <div className="flex items-center gap-8">
            <Logo onClick={() => navigate('/')} />
            
            {/* Main Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {mainLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              {/* Discover Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowDiscoverMenu(true)}
                  onMouseLeave={() => setShowDiscoverMenu(false)}
                  className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={showDiscoverMenu}
                  onKeyDown={(e) => { if (e.key === 'Escape') setShowDiscoverMenu(false); if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); setShowDiscoverMenu(true); } }}
                >
                  <span>{t('nav.discover')}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showDiscoverMenu && (
                  <div
                    onMouseEnter={() => setShowDiscoverMenu(true)}
                    onMouseLeave={() => setShowDiscoverMenu(false)}
                    className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-lg py-2 mt-2"
                    role="menu"
                  >
                    {[
                      { name: t('nav.discoverMenu.culture'), path: '/destination/culture', icon: Compass },
                      { name: t('nav.discoverMenu.adventure'), path: '/destination/adventure', icon: Map },
                      { name: t('nav.discoverMenu.relaxation'), path: '/destination/relaxation', icon: User }
                    ].map((category) => (
                      <Link
                        key={category.name}
                        to={category.path}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-orange-50 text-gray-700 hover:text-orange-500 transition-colors"
                        role="menuitem"
                      >
                        <category.icon className="w-5 h-5" />
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
                  className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={showToolsMenu}
                  onKeyDown={(e) => { if (e.key === 'Escape') setShowToolsMenu(false); if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); setShowToolsMenu(true); } }}
                >
                  <Wrench className="w-4 h-4" />
                  <span>{t('nav.tools')}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showToolsMenu && (
                  <div
                    onMouseEnter={() => setShowToolsMenu(true)}
                    onMouseLeave={() => setShowToolsMenu(false)}
                    className="absolute top-full left-0 w-80 bg-white rounded-lg shadow-lg py-2 mt-2"
                    role="menu"
                  >
                    {toolsMenuItems.map((tool) => (
                      <Link
                        key={tool.name}
                        to={tool.path}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-gray-700 hover:text-orange-500 transition-colors"
                        role="menuitem"
                      >
                        <tool.icon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{tool.name}</div>
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
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Route className="w-4 h-4" />
              <span>{t('nav.planTrip')}</span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {/* Language Selector */}
                <LanguageSelector variant="compact" />

                {/* Shopping Cart */}
                <CartButton />

                {/* Favorites */}
                <Link
                  to="/favorites"
                  className="hidden md:block relative p-2 text-gray-700 hover:text-orange-600 transition-colors duration-200 rounded-lg hover:bg-orange-50"
                  title={t('nav.viewFavorites')}
                  aria-label={favoritesCount > 0 ? `Favoris (${favoritesCount})` : 'Favoris'}
                >
                  <Heart className="w-6 h-6" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" aria-hidden="true">
                      {favoritesCount > 99 ? '99+' : favoritesCount}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors duration-200 rounded-lg hover:bg-orange-50"
                    aria-label="Notifications"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadNotificationsCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <NotificationCenter
                      onClose={() => setShowNotifications(false)}
                      onUnreadCountChange={setUnreadNotificationsCount}
                    />
                  )}
                </div>

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-gray-700"
                    aria-haspopup="menu"
                    aria-expanded={showUserMenu}
                    aria-label="Menu utilisateur"
                    onKeyDown={(e) => { if (e.key === 'Escape') setShowUserMenu(false); }}
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-500" />
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute top-full right-0 w-48 bg-white rounded-lg shadow-lg py-2 mt-2" role="menu">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        onClick={() => setShowUserMenu(false)}
                        role="menuitem"
                      >
                        <User className="w-4 h-4" />
                        <span>{t('nav.userMenu.profile')}</span>
                      </Link>
                      <Link
                        to="/planner"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        onClick={() => setShowUserMenu(false)}
                        role="menuitem"
                      >
                        <Route className="w-4 h-4" />
                        <span>{t('nav.userMenu.myTrips')}</span>
                      </Link>
                      <Link
                        to="/favorites"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        onClick={() => setShowUserMenu(false)}
                        role="menuitem"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{t('nav.userMenu.favorites')}</span>
                      </Link>
                      <Link
                        to="/bookings"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        onClick={() => setShowUserMenu(false)}
                        role="menuitem"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>{t('nav.userMenu.myBookings')}</span>
                      </Link>
                      <Link
                        to="/history"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        onClick={() => setShowUserMenu(false)}
                        role="menuitem"
                      >
                        <History className="w-4 h-4" />
                        <span>{t('nav.userMenu.history')}</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        onClick={() => setShowUserMenu(false)}
                        role="menuitem"
                      >
                        <Settings className="w-4 h-4" />
                        <span>{t('nav.userMenu.settings')}</span>
                      </Link>
                      <Link
                        to="/support"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        onClick={() => setShowUserMenu(false)}
                        role="menuitem"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>{t('nav.userMenu.help')}</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('nav.userMenu.logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Language Selector for logged-out users */}
                <LanguageSelector variant="compact" />

                <Link
                  to="/auth"
                  className="hidden md:block px-4 py-2 text-gray-700 hover:text-orange-500"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/auth"
                  className="hidden md:block px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
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
              aria-expanded={isDrawerOpen}
              aria-label={isDrawerOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
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
