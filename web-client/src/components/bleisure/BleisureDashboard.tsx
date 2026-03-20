import { useState } from 'react';
import { Briefcase, Compass, Calendar, DollarSign, Clock, Users, MapPin, Filter, Loader2 } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import ExpenseTracker from '../business/ExpenseTracker';
import PersonalizedActivities from '../destination/PersonalizedActivities';

const BleisureDashboard = () => {
  const {
    upcomingTrips,
    recentBookings,
    stats,
    loading,
    error
  } = useDashboard();

  const [mode, setMode] = useState<'business' | 'leisure'>('business');
  const [showExpenses, setShowExpenses] = useState(false);

  // Transform bookings into schedule activities
  const schedule = upcomingTrips.map(trip => ({
    id: trip.id,
    type: (trip.type === 'flight' || trip.type === 'hotel') ? 'business' as const : 'leisure' as const,
    title: trip.details?.title || trip.details?.hotelName || `${trip.type.charAt(0).toUpperCase() + trip.type.slice(1)} - ${trip.destination}`,
    startTime: trip.departureDate,
    endTime: trip.returnDate || trip.departureDate,
    location: trip.destination,
    category: trip.type === 'activity' ? 'Cultural' : undefined,
    cost: {
      amount: trip.totalAmount,
      currency: trip.currency || 'EUR',
      type: (trip.type === 'flight' || trip.type === 'hotel') ? 'business' as const : 'personal' as const
    }
  }));

  // Calculate stats from real data
  const businessExpenses = recentBookings
    .filter(b => b.type === 'flight' || b.type === 'hotel')
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const personalExpenses = recentBookings
    .filter(b => b.type === 'activity' || b.type === 'transfer')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

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
            title: 'Total Bookings',
            value: String(stats?.totalBookings ?? 0),
            icon: Clock,
            color: 'bg-blue-50 text-blue-600',
            type: 'business'
          },
          {
            title: 'Upcoming Trips',
            value: String(stats?.upcomingTrips ?? upcomingTrips.length),
            icon: Compass,
            color: 'bg-orange-50 text-orange-600',
            type: 'leisure'
          },
          {
            title: 'Business Expenses',
            value: `$${businessExpenses.toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-green-50 text-green-600',
            type: 'business'
          },
          {
            title: 'Personal Expenses',
            value: `$${personalExpenses.toLocaleString()}`,
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
          {/* Schedule */}
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

            {schedule.length > 0 ? (
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
                          {new Date(activity.startTime).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric'
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
                              {activity.cost.currency} {activity.cost.amount.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No upcoming activities. Book a trip to see your schedule here.</p>
              </div>
            )}
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
                    <span className="text-gray-600">Total Bookings</span>
                    <span className="font-medium">{stats?.totalBookings ?? 0}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stats?.totalBookings ?? 0) * 10)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Upcoming</span>
                    <span className="font-medium">{stats?.upcomingTrips ?? 0}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stats?.upcomingTrips ?? 0) * 20)}%` }}
                    />
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
