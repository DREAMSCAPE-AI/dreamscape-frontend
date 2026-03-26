import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  Calendar,
  History,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
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
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDiscoverMenu, setShowDiscoverMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { toggleDrawer, isDrawerOpen } = useMobileNavigation();

  // Is homepage — transparent header on top
  const isHome = location.pathname === '/';
  const isTransparent = isHome && !scrolled;

  // Track scroll position
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch favorites count when user is logged in
  useEffect(() => {
    const fetchFavoritesCount = async () => {
      if (isLoggedIn) {
        try {
          const response = await FavoritesService.getFavorites({ limit: 0 });
          setFavoritesCount(response.total || 0);
        } catch {
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = useCallback(() => {
    setShowUserMenu(false);
    onLogout?.();
  }, [onLogout]);

  const mainLinks = [
    { name: t('nav.flights'), path: '/flights', icon: Plane },
    { name: t('nav.hotels'), path: '/hotels', icon: Building2 },
    { name: t('nav.activities'), path: '/activities', icon: Route },
    { name: t('nav.map'), path: '/map', icon: Map },
    { name: t('nav.destinations'), path: '/destinations', icon: Compass },
  ];

  const toolsMenuItems = [
    { name: t('nav.toolsMenu.flightAnalytics'), path: '/analytics', icon: BarChart3, description: t('nav.toolsMenu.flightAnalyticsDesc') },
    { name: t('nav.toolsMenu.flightStatus'), path: '/flight-status', icon: Plane, description: t('nav.toolsMenu.flightStatusDesc') },
    { name: t('nav.toolsMenu.airportInfo'), path: '/airports', icon: MapPin, description: t('nav.toolsMenu.airportInfoDesc') },
    { name: t('nav.toolsMenu.airlineLookup'), path: '/airlines', icon: Building, description: t('nav.toolsMenu.airlineLookupDesc') },
    { name: t('nav.toolsMenu.transfers'), path: '/transfers', icon: Car, description: t('nav.toolsMenu.transfersDesc') },
    { name: t('nav.toolsMenu.travelInsights'), path: '/insights', icon: Brain, description: t('nav.toolsMenu.travelInsightsDesc') },
  ];

  /* ─── Dynamic style tokens ─── */
  const textColor = isTransparent ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-orange-500';
  const textColorActive = isTransparent ? 'text-white' : 'text-gray-800';
  const dropdownBg = isTransparent
    ? 'bg-surface-950/80 backdrop-blur-xl border border-white/10'
    : 'bg-white border border-gray-100 shadow-lg';
  const dropdownItem = isTransparent
    ? 'text-white/60 hover:text-white hover:bg-white/[0.06]'
    : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50';
  const dropdownItemDesc = isTransparent ? 'text-white/30' : 'text-gray-400';

  return (
    <motion.header
      className={`fixed w-full z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/85 backdrop-blur-xl shadow-sm border-b border-gray-100/50'
      }`}
      initial={isHome ? { y: -80 } : false}
      animate={{ y: 0 }}
      transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="w-full px-5 lg:px-8">
        <nav className="flex items-center justify-between h-16 lg:h-[68px]">
          {/* ── Left: Logo + Nav ── */}
          <div className="flex items-center gap-7">
            <Logo onClick={() => navigate('/')} />

            {/* Main links */}
            <div className="hidden lg:flex items-center gap-1">
              {mainLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${textColor}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              {/* Discover dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowDiscoverMenu(true)}
                  onMouseLeave={() => setShowDiscoverMenu(false)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${textColor}`}
                  aria-haspopup="menu"
                  aria-expanded={showDiscoverMenu}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowDiscoverMenu(false);
                    if (e.key === 'ArrowDown' || e.key === 'Enter') {
                      e.preventDefault();
                      setShowDiscoverMenu(true);
                    }
                  }}
                >
                  <span>{t('nav.discover')}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                <AnimatePresence>
                  {showDiscoverMenu && (
                    <motion.div
                      onMouseEnter={() => setShowDiscoverMenu(true)}
                      onMouseLeave={() => setShowDiscoverMenu(false)}
                      className={`absolute top-full left-0 w-56 rounded-xl py-1.5 mt-2 ${dropdownBg}`}
                      role="menu"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                    >
                      {[
                        { name: t('nav.discoverMenu.culture'), path: '/destinations?category=cultural', icon: Compass },
                        { name: t('nav.discoverMenu.adventure'), path: '/destinations?category=adventure', icon: Map },
                        { name: t('nav.discoverMenu.relaxation'), path: '/destinations?category=wellness', icon: User },
                      ].map((cat) => (
                        <Link
                          key={cat.name}
                          to={cat.path}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${dropdownItem}`}
                          role="menuitem"
                        >
                          <cat.icon className="w-4 h-4 opacity-60" />
                          <span>{cat.name}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tools dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowToolsMenu(true)}
                  onMouseLeave={() => setShowToolsMenu(false)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${textColor}`}
                  aria-haspopup="menu"
                  aria-expanded={showToolsMenu}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowToolsMenu(false);
                    if (e.key === 'ArrowDown' || e.key === 'Enter') {
                      e.preventDefault();
                      setShowToolsMenu(true);
                    }
                  }}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{t('nav.tools')}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                <AnimatePresence>
                  {showToolsMenu && (
                    <motion.div
                      onMouseEnter={() => setShowToolsMenu(true)}
                      onMouseLeave={() => setShowToolsMenu(false)}
                      className={`absolute top-full left-0 w-72 rounded-xl py-1.5 mt-2 ${dropdownBg}`}
                      role="menu"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                    >
                      {toolsMenuItems.map((tool) => (
                        <Link
                          key={tool.name}
                          to={tool.path}
                          className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${dropdownItem}`}
                          role="menuitem"
                        >
                          <tool.icon className="w-4 h-4 opacity-60 shrink-0" />
                          <div>
                            <div className="text-sm font-medium">{tool.name}</div>
                            <div className={`text-[11px] ${dropdownItemDesc}`}>{tool.description}</div>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Right: Actions ── */}
          <div className="flex items-center gap-2">
            {/* Plan trip CTA — visible on large screens */}
            <Link
              to="/planner"
              className={`hidden xl:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${
                isTransparent
                  ? 'bg-white/[0.08] text-white/80 hover:bg-white/[0.14] border border-white/[0.08]'
                  : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              {t('nav.planTrip')}
            </Link>

            {isLoggedIn ? (
              <>
                <LanguageSelector variant="compact" />
                <CartButton />

                {/* Favorites */}
                <Link
                  to="/favorites"
                  className={`hidden md:flex items-center justify-center w-9 h-9 rounded-xl transition-colors relative ${
                    isTransparent ? 'text-white/60 hover:text-white hover:bg-white/[0.08]' : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'
                  }`}
                  title={t('nav.viewFavorites')}
                  aria-label={favoritesCount > 0 ? `Favoris (${favoritesCount})` : 'Favoris'}
                >
                  <Heart className="w-[18px] h-[18px]" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {favoritesCount > 99 ? '99+' : favoritesCount}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors relative ${
                      isTransparent ? 'text-white/60 hover:text-white hover:bg-white/[0.08]' : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'
                    }`}
                    aria-label="Notifications"
                  >
                    <Bell className="w-[18px] h-[18px]" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
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

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl transition-colors ${
                      isTransparent ? 'hover:bg-white/[0.08]' : 'hover:bg-gray-50'
                    }`}
                    aria-haspopup="menu"
                    aria-expanded={showUserMenu}
                    aria-label="Menu utilisateur"
                    onKeyDown={(e) => { if (e.key === 'Escape') setShowUserMenu(false); }}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <ChevronDown className={`w-3 h-3 ${isTransparent ? 'text-white/40' : 'text-gray-400'}`} />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        className={`absolute top-full right-0 w-52 rounded-xl py-1.5 mt-2 ${dropdownBg}`}
                        role="menu"
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                      >
                        {[
                          { to: '/dashboard', icon: User, label: t('nav.userMenu.profile') },
                          { to: '/planner', icon: Route, label: t('nav.userMenu.myTrips') },
                          { to: '/favorites', icon: Heart, label: t('nav.userMenu.favorites') },
                          { to: '/bookings', icon: Calendar, label: t('nav.userMenu.myBookings') },
                          { to: '/history', icon: History, label: t('nav.userMenu.history') },
                          { to: '/settings', icon: Settings, label: t('nav.userMenu.settings') },
                          { to: '/support', icon: HelpCircle, label: t('nav.userMenu.help') },
                        ].map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${dropdownItem}`}
                            onClick={() => setShowUserMenu(false)}
                            role="menuitem"
                          >
                            <item.icon className="w-4 h-4 opacity-60" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                        <div className={`my-1 mx-3 h-px ${isTransparent ? 'bg-white/10' : 'bg-gray-100'}`} />
                        <button
                          onClick={handleLogout}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors ${
                            isTransparent
                              ? 'text-red-400 hover:text-red-300 hover:bg-white/[0.06]'
                              : 'text-red-500 hover:text-red-600 hover:bg-red-50'
                          }`}
                          role="menuitem"
                        >
                          <LogOut className="w-4 h-4 opacity-60" />
                          <span>{t('nav.userMenu.logout')}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <LanguageSelector variant="compact" />
                <Link
                  to="/auth"
                  className={`hidden md:block px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${textColor}`}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/auth"
                  className="hidden md:inline-flex items-center px-5 py-2 text-[13px] font-semibold bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-shadow"
                >
                  {t('nav.signUp')}
                </Link>
              </>
            )}

            {/* Mobile menu */}
            <button
              data-testid="mobile-menu-button"
              onClick={toggleDrawer}
              className={`lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors ${
                isTransparent ? 'text-white/70 hover:text-white hover:bg-white/[0.08]' : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
              }`}
              aria-expanded={isDrawerOpen}
              aria-label={isDrawerOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer isLoggedIn={isLoggedIn} onLogout={onLogout} />
    </motion.header>
  );
};

export default Header;
