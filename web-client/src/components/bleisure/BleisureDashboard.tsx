import React, { useState } from 'react';
import { Briefcase, Compass, Calendar, DollarSign, Clock, Users, ToggleLeft, Filter, MapPin } from 'lucide-react';
import BusinessItinerary from '../business/BusinessItinerary';
import ExpenseTracker from '../business/ExpenseTracker';
import PersonalizedActivities from '../destination/PersonalizedActivities';

interface Activity {
  id: string;
  title: string;
  type: 'business' | 'leisure';
  startTime: string;
  endTime: string;
  location: string;
  category?: string;
  cost?: {
    amount: number;
    currency: string;
    type: 'business' | 'personal';
  };
}

const BleisureDashboard = () => {
  const [mode, setMode] = useState<'business' | 'leisure'>('business');
  const [showExpenses, setShowExpenses] = useState(false);

  const schedule: Activity[] = [
    {
      id: '1',
      type: 'business',
      title: 'Client Meeting',
      startTime: '2024-03-20T09:00:00',
      endTime: '2024-03-20T10:30:00',
      location: 'Paris Office',
      cost: {
        amount: 0,
        currency: 'EUR',
        type: 'business'
      }
    },
    {
      id: '2',
      type: 'leisure',
      title: 'Louvre Museum Visit',
      startTime: '2024-03-20T14:00:00',
      endTime: '2024-03-20T17:00:00',
      location: 'Louvre Museum',
      category: 'Cultural',
      cost: {
        amount: 45,
        currency: 'EUR',
        type: 'personal'
      }
    },
    {
      id: '3',
      type: 'business',
      title: 'Team Workshop',
      startTime: '2024-03-21T10:00:00',
      endTime: '2024-03-21T12:00:00',
      location: 'Innovation Hub',
      cost: {
        amount: 0,
        currency: 'EUR',
        type: 'business'
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Mode Toggle */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMode('business')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                mode === 'business'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              Business Mode
            </button>
            <button
              onClick={() => setMode('leisure')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                mode === 'leisure'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Compass className="w-5 h-5" />
              Leisure Mode
            </button>
          </div>
          <button
            onClick={() => setShowExpenses(!showExpenses)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            Manage Expenses
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: 'Work Hours',
            value: '16h',
            icon: Clock,
            color: 'bg-blue-50 text-blue-600',
            type: 'business'
          },
          {
            title: 'Free Time',
            value: '24h',
            icon: Compass,
            color: 'bg-orange-50 text-orange-600',
            type: 'leisure'
          },
          {
            title: 'Business Expenses',
            value: '€450',
            icon: DollarSign,
            color: 'bg-green-50 text-green-600',
            type: 'business'
          },
          {
            title: 'Personal Expenses',
            value: '€280',
            icon: DollarSign,
            color: 'bg-purple-50 text-purple-600',
            type: 'leisure'
          }
        ]
        .filter(stat => mode === 'business' ? true : stat.type === 'leisure')
        .map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-sm text-gray-600">{stat.title}</div>
            <div className="text-2xl font-bold mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Schedule and Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mixed Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Your Schedule</h2>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Filter className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Calendar className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {schedule
                .filter(activity => mode === 'business' ? true : activity.type === 'leisure')
                .map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      activity.type === 'business'
                        ? 'border-l-blue-500 bg-blue-50'
                        : 'border-l-orange-500 bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{activity.title}</h3>
                      <span className="text-sm text-gray-600">
                        {new Date(activity.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{activity.location}</span>
                      </div>
                      {activity.category && (
                        <div className="flex items-center gap-1">
                          <Compass className="w-4 h-4" />
                          <span>{activity.category}</span>
                        </div>
                      )}
                      {activity.cost && activity.cost.amount > 0 && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            {activity.cost.currency} {activity.cost.amount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Activity Suggestions */}
          {mode === 'leisure' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Free Time Activities</h2>
              <PersonalizedActivities destinationId="paris" />
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Expense Management */}
          {showExpenses ? (
            <ExpenseTracker
              onSave={() => setShowExpenses(false)}
              onCancel={() => setShowExpenses(false)}
            />
          ) : (
            <>
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <Calendar className="w-5 h-5" />
                    <span>Schedule Meeting</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <Users className="w-5 h-5" />
                    <span>Team Availability</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <DollarSign className="w-5 h-5" />
                    <span>Add Expense</span>
                  </button>
                </div>
              </div>

              {/* Travel Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Trip Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Work Hours</span>
                    <span className="font-medium">16h / 40h</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-full w-2/5 bg-blue-500 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Free Time</span>
                    <span className="font-medium">24h</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-full w-3/5 bg-orange-500 rounded-full" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BleisureDashboard;