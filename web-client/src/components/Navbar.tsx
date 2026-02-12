import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane, Menu, ChevronDown, BarChart3, Plane as PlaneIcon, MapPin, Building, Car, Brain, Home, Globe, Camera, Users, Search, Heart, Calendar, Star, Info, Phone, X } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);

  const toolsMenuItems = [
    { to: '/analytics', label: 'Flight Analytics', icon: BarChart3, description: 'Travel trends and insights' },
    { to: '/flight-status', label: 'Flight Status', icon: PlaneIcon, description: 'Track flights and delays' },
    { to: '/airports', label: 'Airport Info', icon: MapPin, description: 'Airport performance and routes' },
    { to: '/airlines', label: 'Airline Lookup', icon: Building, description: 'Airline information and routes' },
    { to: '/transfers', label: 'Transfers', icon: Car, description: 'Book ground transportation' },
    { to: '/insights', label: 'Travel Insights', icon: Brain, description: 'AI-powered recommendations' }
  ];

  const homeMenuItems = [
    { to: '/', label: 'Home', icon: Home, description: 'Main dashboard' },
    { to: '/search', label: 'Search Flights', icon: Search, description: 'Find the best flights' },
    { to: '/deals', label: 'Special Deals', icon: Heart, description: 'Exclusive offers' },
    { to: '/trip-planner', label: 'Trip Planner', icon: Calendar, description: 'Plan your journey' }
  ];

  const destinationsMenuItems = [
    { to: '/destinations', label: 'All Destinations', icon: Globe, description: 'Explore all locations' },
    { to: '/destinations/popular', label: 'Popular Destinations', icon: Star, description: 'Top travel spots' },
    { to: '/destinations/europe', label: 'Europe', icon: MapPin, description: 'European destinations' },
    { to: '/destinations/asia', label: 'Asia', icon: MapPin, description: 'Asian destinations' },
    { to: '/destinations/americas', label: 'Americas', icon: MapPin, description: 'American destinations' }
  ];

  const experiencesMenuItems = [
    { to: '/experiences', label: 'All Experiences', icon: Camera, description: 'Browse all activities' },
    { to: '/experiences/adventure', label: 'Adventure', icon: Camera, description: 'Thrilling activities' },
    { to: '/experiences/culture', label: 'Culture', icon: Camera, description: 'Cultural experiences' },
    { to: '/experiences/food', label: 'Food & Dining', icon: Camera, description: 'Culinary adventures' },
    { to: '/experiences/wellness', label: 'Wellness', icon: Camera, description: 'Relaxation & spa' }
  ];

  const aboutMenuItems = [
    { to: '/about', label: 'About Us', icon: Info, description: 'Our story and mission' },
    { to: '/about/team', label: 'Our Team', icon: Users, description: 'Meet the team' },
    { to: '/contact', label: 'Contact', icon: Phone, description: 'Get in touch' },
    { to: '/careers', label: 'Careers', icon: Users, description: 'Join our team' }
  ];

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        setExpandedMobileMenu(null);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = (menuKey: string) => {
    setExpandedMobileMenu(expandedMobileMenu === menuKey ? null : menuKey);
  };

  const renderDropdownMenu = (items: typeof homeMenuItems, menuKey: string) => {
    if (hoveredMenu !== menuKey) return null;

    return (
      <div
        className="absolute top-full left-0 mt-0 w-60 md:w-64 lg:w-72 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 overflow-hidden z-50"
        onMouseEnter={() => setHoveredMenu(menuKey)}
        onMouseLeave={() => setHoveredMenu(null)}
      >
        <div className="p-2 pt-4">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 p-3 min-h-[44px] rounded-lg hover:bg-orange-50 transition-colors ${
                location.pathname === item.to ? 'bg-orange-100 text-orange-600' : 'text-gray-700'
              }`}
            >
              <item.icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm md:text-base">{item.label}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <nav className="fixed w-full z-50 bg-black/20 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <Plane className="h-6 w-6 md:h-8 md:w-8 text-orange-400" />
            <span className="text-lg md:text-2xl font-bold text-white">TravelX</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {/* Home Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredMenu('home')}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <div className="pb-2">
                <NavLink to="/" active={location.pathname === '/'}>
                  <span className="flex items-center gap-1">
                    Home
                    <ChevronDown className="w-3 h-3" />
                  </span>
                </NavLink>
              </div>
              {renderDropdownMenu(homeMenuItems, 'home')}
            </div>

            {/* Destinations Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredMenu('destinations')}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <div className="pb-2">
                <NavLink to="/destinations" active={location.pathname.startsWith('/destinations')}>
                  <span className="flex items-center gap-1">
                    Destinations
                    <ChevronDown className="w-3 h-3" />
                  </span>
                </NavLink>
              </div>
              {renderDropdownMenu(destinationsMenuItems, 'destinations')}
            </div>

            {/* Experiences Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredMenu('experiences')}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <div className="pb-2">
                <NavLink to="/experiences" active={location.pathname.startsWith('/experiences')}>
                  <span className="flex items-center gap-1">
                    Experiences
                    <ChevronDown className="w-3 h-3" />
                  </span>
                </NavLink>
              </div>
              {renderDropdownMenu(experiencesMenuItems, 'experiences')}
            </div>
            
            {/* Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`flex items-center gap-1 text-sm lg:text-base font-medium hover:text-orange-400 transition-colors min-h-[44px] ${
                  toolsMenuItems.some(item => location.pathname === item.to) ? 'text-orange-400' : 'text-gray-300'
                }`}
              >
                Tools
                <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isToolsOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 md:w-80 lg:w-96 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 overflow-hidden">
                  <div className="p-2">
                    {toolsMenuItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsToolsOpen(false)}
                        className={`flex items-center gap-3 p-3 min-h-[44px] rounded-lg hover:bg-orange-50 transition-colors ${
                          location.pathname === item.to ? 'bg-orange-100 text-orange-600' : 'text-gray-700'
                        }`}
                      >
                        <item.icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm md:text-base">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* About Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setHoveredMenu('about')}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <div className="pb-2">
                <NavLink to="/about" active={location.pathname.startsWith('/about') || location.pathname === '/contact' || location.pathname === '/careers'}>
                  <span className="flex items-center gap-1">
                    About
                    <ChevronDown className="w-3 h-3" />
                  </span>
                </NavLink>
              </div>
              {renderDropdownMenu(aboutMenuItems, 'about')}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              to="/auth"
              className="hidden md:block bg-white/10 hover:bg-white/20 px-4 py-2 min-h-[44px] flex items-center text-sm lg:text-base text-white rounded-md transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              className="hidden md:block bg-gradient-to-r from-orange-500 to-pink-600 px-4 py-2 min-h-[44px] flex items-center text-sm lg:text-base text-white rounded-md hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-white hover:text-orange-400 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Backdrop for dropdown */}
      {isToolsOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsToolsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-gray-900 z-50 overflow-y-auto lg:hidden">
            <div className="p-4 md:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <Plane className="h-6 w-6 md:h-8 md:w-8 text-orange-400" />
                  <span className="text-lg md:text-xl font-bold text-white">TravelX</span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Auth Buttons */}
              <div className="flex flex-col gap-2 mb-6 md:mb-8">
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-4 py-3 min-h-[44px] flex items-center justify-center text-sm md:text-base bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-4 py-3 min-h-[44px] flex items-center justify-center text-sm md:text-base bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </div>

              {/* Navigation Sections */}
              <div className="space-y-2">
                {/* Home Section */}
                <div className="border-b border-gray-800 pb-2">
                  <button
                    onClick={() => toggleMobileMenu('home')}
                    className="w-full flex items-center justify-between p-3 min-h-[44px] text-left text-sm md:text-base text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      Home
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedMobileMenu === 'home' ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedMobileMenu === 'home' && (
                    <div className="pl-4 mt-2 space-y-1">
                      {homeMenuItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-3 min-h-[44px] text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <item.icon className="w-4 h-4" />
                          <div>
                            <div>{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Destinations Section */}
                <div className="border-b border-gray-800 pb-2">
                  <button
                    onClick={() => toggleMobileMenu('destinations')}
                    className="w-full flex items-center justify-between p-3 min-h-[44px] text-left text-sm md:text-base text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Destinations
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedMobileMenu === 'destinations' ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedMobileMenu === 'destinations' && (
                    <div className="pl-4 mt-2 space-y-1">
                      {destinationsMenuItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-3 min-h-[44px] text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <item.icon className="w-4 h-4" />
                          <div>
                            <div>{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experiences Section */}
                <div className="border-b border-gray-800 pb-2">
                  <button
                    onClick={() => toggleMobileMenu('experiences')}
                    className="w-full flex items-center justify-between p-3 min-h-[44px] text-left text-sm md:text-base text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Experiences
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedMobileMenu === 'experiences' ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedMobileMenu === 'experiences' && (
                    <div className="pl-4 mt-2 space-y-1">
                      {experiencesMenuItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-3 min-h-[44px] text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <item.icon className="w-4 h-4" />
                          <div>
                            <div>{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tools Section */}
                <div className="border-b border-gray-800 pb-2">
                  <button
                    onClick={() => toggleMobileMenu('tools')}
                    className="w-full flex items-center justify-between p-3 min-h-[44px] text-left text-sm md:text-base text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Tools
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedMobileMenu === 'tools' ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedMobileMenu === 'tools' && (
                    <div className="pl-4 mt-2 space-y-1">
                      {toolsMenuItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-3 min-h-[44px] text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <item.icon className="w-4 h-4" />
                          <div>
                            <div>{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* About Section */}
                <div>
                  <button
                    onClick={() => toggleMobileMenu('about')}
                    className="w-full flex items-center justify-between p-3 min-h-[44px] text-left text-sm md:text-base text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      About
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedMobileMenu === 'about' ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedMobileMenu === 'about' && (
                    <div className="pl-4 mt-2 space-y-1">
                      {aboutMenuItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-3 min-h-[44px] text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <item.icon className="w-4 h-4" />
                          <div>
                            <div>{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

const NavLink = ({ to, children, active = false }: { to: string; children: React.ReactNode; active?: boolean }) => (
  <Link
    to={to}
    className={`text-sm lg:text-base font-medium hover:text-orange-400 transition-colors min-h-[44px] flex items-center ${
      active ? 'text-orange-400' : 'text-gray-300'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;