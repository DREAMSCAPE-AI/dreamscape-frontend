import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane, Menu, ChevronDown, BarChart3, Plane as PlaneIcon, MapPin, Building, Car, Brain, Home, Globe, Camera, Users, Search, Heart, Calendar, Star, Info, Phone } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

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

  const renderDropdownMenu = (items: typeof homeMenuItems, menuKey: string) => {
    if (hoveredMenu !== menuKey) return null;
    
    return (
      <div 
        className="absolute top-full left-0 mt-0 w-64 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 overflow-hidden z-50"
        onMouseEnter={() => setHoveredMenu(menuKey)}
        onMouseLeave={() => setHoveredMenu(null)}
      >
        <div className="p-2 pt-4">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors ${
                location.pathname === item.to ? 'bg-orange-100 text-orange-600' : 'text-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <div>
                <div className="font-medium">{item.label}</div>
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
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <Plane className="h-8 w-8 text-orange-400" />
            <span className="text-2xl font-bold">TravelX</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
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
                className={`flex items-center gap-1 text-sm font-medium hover:text-orange-400 transition-colors ${
                  toolsMenuItems.some(item => location.pathname === item.to) ? 'text-orange-400' : 'text-gray-300'
                }`}
              >
                Tools
                <ChevronDown className={`w-4 h-4 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isToolsOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 overflow-hidden">
                  <div className="p-2">
                    {toolsMenuItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsToolsOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors ${
                          location.pathname === item.to ? 'bg-orange-100 text-orange-600' : 'text-gray-700'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{item.label}</div>
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
          
          <div className="flex items-center gap-4">
            <Link 
              to="/auth"
              className="hidden md:block bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/auth"
              className="hidden md:block bg-gradient-to-r from-orange-500 to-pink-600 px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
            <button className="md:hidden p-2">
              <Menu className="h-6 w-6" />
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
    </nav>
  );
};

const NavLink = ({ to, children, active = false }: { to: string; children: React.ReactNode; active?: boolean }) => (
  <Link 
    to={to}
    className={`text-sm font-medium hover:text-orange-400 transition-colors ${
      active ? 'text-orange-400' : 'text-gray-300'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;