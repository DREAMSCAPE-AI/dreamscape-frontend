import React, { useState } from 'react';
import { useAuth } from '../../services/auth/AuthService';
import UnifiedDashboard from '../dashboard/UnifiedDashboard';
import { Briefcase, Compass, LogOut, User } from 'lucide-react';

const DashboardDemo = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [selectedDemo, setSelectedDemo] = useState<'business' | 'leisure' | null>(null);

  const handleDemoLogin = async (type: 'business' | 'leisure') => {
    try {
      if (type === 'business') {
        await login('business@example.com', 'business123');
      } else {
        await login('leisure@example.com', 'leisure123');
      }
      setSelectedDemo(type);
    } catch (error) {
      console.error('Demo login failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setSelectedDemo(null);
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Demo Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Dreamscape Dashboard Demo</h1>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  user.userCategory === 'BUSINESS' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {user.userCategory === 'BUSINESS' ? <Briefcase className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
                  {user.userCategory === 'BUSINESS' ? 'Business User' : 'Leisure User'}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  {user.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4" />
                  Switch User
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <UnifiedDashboard userCategory={user.userCategory} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Unified Dashboard Demo
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Experience how the dashboard adapts to different user categories
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Business User Demo */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Business Traveler</h3>
            <p className="text-gray-600 mb-6">
              Experience the business-focused dashboard with expense tracking, meeting integration, 
              and travel policy management.
            </p>
            <ul className="text-left text-sm text-gray-600 mb-8 space-y-2">
              <li>• Business itinerary management</li>
              <li>• Expense tracking & reporting</li>
              <li>• Travel policy compliance</li>
              <li>• Meeting integration</li>
              <li>• Rebooking options</li>
            </ul>
            <button
              onClick={() => handleDemoLogin('business')}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Business Dashboard
            </button>
          </div>

          {/* Leisure User Demo */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Compass className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Leisure Explorer</h3>
            <p className="text-gray-600 mb-6">
              Discover the leisure-focused dashboard with community features, destination exploration, 
              and experience sharing.
            </p>
            <ul className="text-left text-sm text-gray-600 mb-8 space-y-2">
              <li>• Community posts & sharing</li>
              <li>• Destination exploration</li>
              <li>• Travel achievements</li>
              <li>• Photo sharing</li>
              <li>• Experience recommendations</li>
            </ul>
            <button
              onClick={() => handleDemoLogin('leisure')}
              className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Leisure Dashboard
            </button>
          </div>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-xl max-w-2xl mx-auto">
          <h4 className="text-lg font-semibold text-blue-900 mb-2">
            🎯 Unified Dashboard Benefits
          </h4>
          <p className="text-blue-800">
            One codebase, multiple experiences. The dashboard automatically adapts its interface, 
            navigation, and features based on the user's category, providing a personalized 
            experience while maintaining code efficiency.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardDemo;
