import React, { useState } from 'react';
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
  Wrench
} from 'lucide-react';
import Logo from './Logo';

interface HeaderProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn = false, onLogout }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDiscoverMenu, setShowDiscoverMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout?.();
  };

  const mainLinks = [
    { name: 'Flights', path: '/flights', icon: Plane },
    { name: 'Hotels', path: '/hotels', icon: Building2 },
    { name: 'Activities', path: '/activities', icon: Route },
    { name: 'Map', path: '/map', icon: Map },
    { name: 'Destinations', path: '/destinations', icon: Compass }
  ];

  const toolsMenuItems = [
    { name: 'Flight Analytics', path: '/analytics', icon: BarChart3, description: 'Travel trends and insights' },
    { name: 'Flight Status', path: '/flight-status', icon: Plane, description: 'Track flights and delays' },
    { name: 'Airport Info', path: '/airports', icon: MapPin, description: 'Airport performance and routes' },
    { name: 'Airline Lookup', path: '/airlines', icon: Building, description: 'Airline information and routes' },
    { name: 'Transfers', path: '/transfers', icon: Car, description: 'Book ground transportation' },
    { name: 'Travel Insights', path: '/insights', icon: Brain, description: 'AI-powered recommendations' }
  ];

  return (
    <header className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
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
                >
                  <span>Discover</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showDiscoverMenu && (
                  <div
                    onMouseEnter={() => setShowDiscoverMenu(true)}
                    onMouseLeave={() => setShowDiscoverMenu(false)}
                    className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-lg py-2 mt-2"
                  >
                    {[
                      { name: 'Culture', path: '/destination/culture', icon: Compass },
                      { name: 'Adventure', path: '/destination/adventure', icon: Map },
                      { name: 'Relaxation', path: '/destination/relaxation', icon: User }
                    ].map((category) => (
                      <Link
                        key={category.name}
                        to={category.path}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-orange-50 text-gray-700 hover:text-orange-500 transition-colors"
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
                >
                  <Wrench className="w-4 h-4" />
                  <span>Tools</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showToolsMenu && (
                  <div
                    onMouseEnter={() => setShowToolsMenu(true)}
                    onMouseLeave={() => setShowToolsMenu(false)}
                    className="absolute top-full left-0 w-80 bg-white rounded-lg shadow-lg py-2 mt-2"
                  >
                    {toolsMenuItems.map((tool) => (
                      <Link
                        key={tool.name}
                        to={tool.path}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-gray-700 hover:text-orange-500 transition-colors"
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
              <span>Plan Trip</span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <button className="hidden md:flex items-center gap-1 text-gray-700 hover:text-orange-500">
                  <Heart className="w-5 h-5" />
                  <span className="text-xs bg-orange-100 text-orange-600 px-1.5 rounded-full">3</span>
                </button>

                <button className="hidden md:flex items-center gap-1 text-gray-700 hover:text-orange-500">
                  <Bell className="w-5 h-5" />
                  <span className="text-xs bg-orange-100 text-orange-600 px-1.5 rounded-full">2</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-500" />
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute top-full right-0 w-48 bg-white rounded-lg shadow-lg py-2 mt-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/planner"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                      >
                        <Route className="w-4 h-4" />
                        <span>My Trips</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <Link
                        to="/support"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>Help</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/auth" 
                  className="hidden md:block px-4 py-2 text-gray-700 hover:text-orange-500"
                >
                  Login
                </Link>
                <Link 
                  to="/auth"
                  className="hidden md:block px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden text-gray-700 hover:text-orange-500">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;