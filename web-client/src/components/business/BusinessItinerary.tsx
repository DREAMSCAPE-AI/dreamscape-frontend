import React from 'react';
import { Calendar, Clock, MapPin, Building2, DollarSign, AlertCircle } from 'lucide-react';
import type { FlightOffer, HotelOffer, Experience } from '@/services/voyage/types';

interface BusinessItineraryProps {
  meetings: Meeting[];
  flights: FlightOffer[];
  hotels: HotelOffer[];
  experiences: Experience[];
  onRebookFlight?: (flight: FlightOffer) => void;
  onAddExpense?: (expense: Expense) => void;
}

interface Meeting {
  id: string;
  title: string;
  location: string;
  startTime: string;
  endTime: string;
  participants: string[];
}

interface Expense {
  id: string;
  category: 'flight' | 'hotel' | 'transport' | 'meal' | 'other';
  amount: number;
  currency: string;
  date: string;
  description: string;
  receipt?: string;
}

const BusinessItinerary: React.FC<BusinessItineraryProps> = ({
  meetings,
  flights,
  hotels,
  experiences,
  onRebookFlight,
  onAddExpense
}) => {
  return (
    <div className="space-y-6">
      {/* Timeline View */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Your Business Trip Timeline</h2>
        
        <div className="space-y-6">
          {meetings.map((meeting, index) => (
            <div key={meeting.id} className="relative flex gap-4">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">
                  {new Date(meeting.startTime).getHours()}:{new Date(meeting.startTime).getMinutes().toString().padStart(2, '0')}
                </div>
                {index < meetings.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 absolute top-8 left-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{meeting.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{meeting.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(meeting.startTime).toLocaleTimeString()} - 
                            {new Date(meeting.endTime).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onAddExpense?.({
                          id: crypto.randomUUID(),
                          category: 'other',
                          amount: 0,
                          currency: 'USD',
                          date: new Date().toISOString(),
                          description: `Expenses for ${meeting.title}`
                        })}
                        className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Free Time Recommendations */}
                  {index < meetings.length - 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Free Time Activities Nearby</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {experiences.slice(0, 2).map((experience) => (
                          <div key={experience.id} className="p-2 bg-white rounded-lg text-sm">
                            <div className="font-medium">{experience.title}</div>
                            <div className="text-gray-500">{experience.duration}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Status */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Travel Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Flight Status */}
          {flights.map((flight) => (
            <div key={flight.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Flight {flight.itineraries[0].segments[0].carrierCode} {flight.itineraries[0].segments[0].number}</h3>
                {flight.itineraries[0].segments[0].arrival.at && (
                  <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-sm">On Time</span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(flight.itineraries[0].segments[0].departure.at).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{flight.itineraries[0].segments[0].arrival.iataCode}</span>
                </div>
              </div>

              {onRebookFlight && (
                <button
                  onClick={() => onRebookFlight(flight)}
                  className="mt-4 w-full px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm"
                >
                  View Rebooking Options
                </button>
              )}
            </div>
          ))}

          {/* Hotel Status */}
          {hotels.map((hotel) => (
            <div key={hotel.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{hotel.name}</h3>
                <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-sm">Confirmed</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>{hotel.chainCode}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{hotel.rating} Stars</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Tracking */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Expense Tracking</h2>
          <button
            onClick={() => onAddExpense?.({
              id: crypto.randomUUID(),
              category: 'other',
              amount: 0,
              currency: 'USD',
              date: new Date().toISOString(),
              description: 'New expense'
            })}
            className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
          >
            Add Expense
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['flight', 'hotel', 'transport'].map((category) => (
            <div key={category} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium capitalize mb-2">{category} Expenses</h3>
              <div className="text-2xl font-bold text-gray-900">$0.00</div>
              <div className="text-sm text-gray-500 mt-1">0 receipts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessItinerary;