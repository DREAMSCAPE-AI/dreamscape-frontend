import { useState } from 'react';
import { Calendar, DollarSign, Clock, Briefcase, Plane, Loader2 } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import BusinessItinerary from './BusinessItinerary';
import ExpenseTracker from './ExpenseTracker';
import RebookingOptions from './RebookingOptions';

const BusinessDashboard = () => {
  const {
    recentBookings,
    upcomingTrips,
    stats,
    loading,
    error
  } = useDashboard();

  const [showRebooking, setShowRebooking] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'expenses'>('itinerary');

  // Derive stats from real data
  const totalBookings = stats?.totalBookings ?? 0;
  const totalSpent = stats?.totalSpent ?? 0;
  const upcoming = stats?.upcomingTrips ?? upcomingTrips.length;

  // Split bookings by type
  const flightBookings = recentBookings.filter(b => b.type === 'flight');
  const hotelBookings = recentBookings.filter(b => b.type === 'hotel');

  // Transform bookings to BusinessItinerary format
  const flights = flightBookings.map(b => ({
    id: b.id,
    itineraries: [{
      segments: [{
        departure: { iataCode: b.details?.departure?.iataCode || b.details?.origin || '???', at: b.departureDate },
        arrival: { iataCode: b.details?.arrival?.iataCode || b.details?.destination || b.destination || '???', at: b.returnDate || b.departureDate },
        carrierCode: b.details?.carrierCode || b.details?.airline || '',
        number: b.details?.flightNumber || b.details?.number || ''
      }]
    }]
  }));

  const hotels = hotelBookings.map(b => ({
    id: b.id,
    name: b.details?.hotelName || b.details?.name || b.destination || 'Hotel',
    chainCode: b.details?.chainCode || '',
    rating: b.details?.rating || '0'
  }));

  const handleRebookFlight = (flight?: any) => {
    setSelectedFlight(flight || (flights.length > 0 ? flights[0] : null));
    setShowRebooking(true);
  };

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
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Bookings', value: String(totalBookings), icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
          { title: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
          { title: 'Upcoming Trips', value: String(upcoming), icon: Clock, color: 'bg-orange-50 text-orange-600' },
          { title: 'Flights Booked', value: String(flightBookings.length), icon: Plane, color: 'bg-purple-50 text-purple-600' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-sm text-gray-600">{stat.title}</div>
            <div className="text-2xl font-bold mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'itinerary', label: 'Business Itinerary', icon: Calendar },
              { id: 'expenses', label: 'Expense Management', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-600 hover:text-orange-500'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'itinerary' && (
            flights.length > 0 || hotels.length > 0 ? (
              <BusinessItinerary
                meetings={[]}
                flights={flights as any}
                hotels={hotels as any}
                experiences={[]}
                onRebookFlight={() => handleRebookFlight()}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Business Trips</h3>
                <p>Your upcoming business itinerary will appear here once you book flights or hotels.</p>
              </div>
            )
          )}

          {activeTab === 'expenses' && <ExpenseTracker onSave={() => {}} onCancel={() => {}} />}
        </div>
      </div>

      {/* Rebooking Modal */}
      {showRebooking && selectedFlight && (
        <RebookingOptions
          originalFlight={selectedFlight}
          alternativeFlights={[]}
          onClose={() => setShowRebooking(false)}
          onSelect={() => {
            setShowRebooking(false);
          }}
        />
      )}
    </div>
  );
};

export default BusinessDashboard;
