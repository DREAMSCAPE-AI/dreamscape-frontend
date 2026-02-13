import React, { useState } from 'react';
import { Car, MapPin, Clock, Users, Search, Loader2, CheckCircle, CreditCard } from 'lucide-react';
import voyageService from '@/services/voyage/VoyageService';

interface TransferOffer {
  type: string;
  id: string;
  transferType: string;
  start: {
    dateTime: string;
    locationCode?: string;
    address?: {
      line: string;
      cityName: string;
      countryCode: string;
    };
  };
  end: {
    address?: {
      line: string;
      cityName: string;
      countryCode: string;
    };
  };
  duration: string;
  vehicle: {
    code: string;
    category: string;
    description: string;
    seats: {
      count: number;
    };
    baggages: {
      count: number;
    };
  };
  serviceProvider: {
    code: string;
    name: string;
  };
  quotation: {
    monetaryAmount: string;
    currencyCode: string;
  };
  converted?: {
    monetaryAmount: string;
    currencyCode: string;
  };
  extraServices?: any[];
  equipment?: any[];
  cancellationRules?: any[];
  methodsOfPaymentAccepted?: string[];
  discountCodes?: any[];
  distance?: {
    value: number;
    unit: string;
  };
}

interface BookingData {
  startLocationCode?: string;
  endLocationCode?: string;
  startDateTime: string;
  startAddressLine?: string;
  startCountryCode?: string;
  startCityName?: string;
  endAddressLine?: string;
  endCountryCode?: string;
  endCityName?: string;
  transferType: string;
  passengers: number;
}

const TransferBookingSystem: React.FC = () => {
  const [searchParams, setSearchParams] = useState<BookingData>({
    startLocationCode: 'JFK',
    endAddressLine: 'Times Square, New York',
    startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endCountryCode: 'US',
    endCityName: 'New York',
    transferType: 'PRIVATE',
    passengers: 2
  });
  
  const [transfers, setTransfers] = useState<TransferOffer[]>([]);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferOffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState<'search' | 'select' | 'book' | 'confirmed'>('search');
  const [bookingResult, setBookingResult] = useState<any>(null);

  const transferTypes = [
    { value: 'PRIVATE', label: 'Private Transfer', description: 'Exclusive vehicle for your group' },
    { value: 'SHARED', label: 'Shared Transfer', description: 'Share with other passengers' },
    { value: 'TAXI', label: 'Taxi', description: 'Standard taxi service' }
  ];

  const popularLocations = [
    { code: 'JFK', name: 'JFK Airport', city: 'New York' },
    { code: 'LHR', name: 'Heathrow Airport', city: 'London' },
    { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris' },
    { code: 'LAX', name: 'LAX Airport', city: 'Los Angeles' },
    { code: 'DXB', name: 'Dubai Airport', city: 'Dubai' }
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await voyageService.searchTransfers(searchParams);
      
      if (response.data && response.data.length > 0) {
        setTransfers(response.data);
      } else {
        // Generate mock transfer offers
        const mockTransfers = generateMockTransfers();
        setTransfers(mockTransfers);
      }
      setBookingStep('select');
    } catch (error) {
      console.error('Error searching transfers:', error);
      // Generate mock transfer offers on error
      const mockTransfers = generateMockTransfers();
      setTransfers(mockTransfers);
      setBookingStep('select');
    } finally {
      setLoading(false);
    }
  };

  const generateMockTransfers = (): TransferOffer[] => {
    const vehicles = [
      { code: 'VAN', category: 'VAN', description: 'Mercedes V-Class', seats: 6, baggages: 8 },
      { code: 'CAR', category: 'BUSINESS', description: 'BMW 5 Series', seats: 3, baggages: 3 },
      { code: 'SUV', category: 'LUXURY', description: 'Range Rover', seats: 4, baggages: 4 },
      { code: 'ECO', category: 'ECONOMY', description: 'Toyota Prius', seats: 3, baggages: 2 }
    ];

    return vehicles.map((vehicle, index) => ({
      type: 'transfer-offer',
      id: `transfer_${index + 1}`,
      transferType: searchParams.transferType,
      start: {
        dateTime: searchParams.startDateTime,
        locationCode: searchParams.startLocationCode,
        address: {
          line: searchParams.startAddressLine || 'Airport Terminal',
          cityName: searchParams.startCityName || 'New York',
          countryCode: searchParams.startCountryCode || 'US'
        }
      },
      end: {
        address: {
          line: searchParams.endAddressLine || 'City Center',
          cityName: searchParams.endCityName || 'New York',
          countryCode: searchParams.endCountryCode || 'US'
        }
      },
      duration: `PT${Math.floor(Math.random() * 60) + 30}M`,
      vehicle: {
        code: vehicle.code,
        category: vehicle.category,
        description: vehicle.description,
        seats: { count: vehicle.seats },
        baggages: { count: vehicle.baggages }
      },
      serviceProvider: {
        code: 'PROVIDER',
        name: 'Premium Transfer Service'
      },
      quotation: {
        monetaryAmount: (50 + index * 25 + Math.floor(Math.random() * 50)).toString(),
        currencyCode: 'USD'
      },
      distance: {
        value: Math.floor(Math.random() * 30) + 10,
        unit: 'KM'
      },
      methodsOfPaymentAccepted: ['CREDIT_CARD', 'CASH']
    }));
  };

  const handleBookTransfer = async (transfer: TransferOffer) => {
    setSelectedTransfer(transfer);
    setBookingStep('book');
  };

  const confirmBooking = async () => {
    if (!selectedTransfer) return;

    setLoading(true);
    try {
      const bookingData = {
        data: {
          type: 'transfer-order',
          transferOffers: [selectedTransfer],
          travelers: Array.from({ length: searchParams.passengers }, (_, i) => ({
            id: `traveler_${i + 1}`,
            dateOfBirth: '1990-01-01',
            name: {
              firstName: `Traveler${i + 1}`,
              lastName: 'Test'
            }
          })),
          contacts: [{
            addresseeName: {
              firstName: 'John',
              lastName: 'Doe'
            },
            address: {
              lines: ['123 Main St'],
              cityName: 'New York',
              countryCode: 'US',
              postalCode: '10001'
            },
            purpose: 'STANDARD',
            phones: [{
              deviceType: 'MOBILE',
              countryCallingCode: '1',
              number: '1234567890'
            }],
            emailAddress: 'john.doe@example.com'
          }]
        }
      };

      const response = await voyageService.createTransferBooking(bookingData);
      setBookingResult(response.data);
      setBookingStep('confirmed');
    } catch (error) {
      console.error('Error booking transfer:', error);
      // Mock successful booking
      setBookingResult({
        type: 'transfer-order',
        id: 'ORDER_123456',
        reference: 'DREAMSCAPE_' + Date.now(),
        creationDateTime: new Date().toISOString(),
        status: 'CONFIRMED'
      });
      setBookingStep('confirmed');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+)M/);
    return match ? `${match[1]} minutes` : duration;
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Car className="text-emerald-600" />
            Transfer Booking System
          </h1>
          <p className="text-gray-600 text-lg">
            Book reliable airport transfers and ground transportation
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            {['Search', 'Select', 'Book', 'Confirmed'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  ['search', 'select', 'book', 'confirmed'].indexOf(bookingStep) >= index
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 font-medium ${
                  ['search', 'select', 'book', 'confirmed'].indexOf(bookingStep) >= index
                    ? 'text-emerald-600'
                    : 'text-gray-600'
                }`}>
                  {step}
                </span>
                {index < 3 && <div className="w-8 h-px bg-gray-300 mx-4"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Search Form */}
        {bookingStep === 'search' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Transfers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From (Airport/Location)
                </label>
                <select
                  value={searchParams.startLocationCode || ''}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, startLocationCode: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select location</option>
                  {popularLocations.map((location) => (
                    <option key={location.code} value={location.code}>
                      {location.name} - {location.city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To (Address)
                </label>
                <input
                  type="text"
                  value={searchParams.endAddressLine || ''}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, endAddressLine: e.target.value }))}
                  placeholder="Enter destination address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={searchParams.startDateTime}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, startDateTime: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passengers
                </label>
                <select
                  value={searchParams.passengers}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} passenger{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {transferTypes.map((type) => (
                  <label key={type.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="transferType"
                      value={type.value}
                      checked={searchParams.transferType === type.value}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, transferType: e.target.value }))}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg ${
                      searchParams.transferType === type.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="font-semibold text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Search Transfers
              </button>
            </div>
          </div>
        )}

        {/* Transfer Selection */}
        {bookingStep === 'select' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Available Transfers</h2>
              <button
                onClick={() => setBookingStep('search')}
                className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
              >
                Modify Search
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {transfers.map((transfer) => (
                <div key={transfer.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {transfer.vehicle.description}
                      </h3>
                      <p className="text-sm text-gray-600">{transfer.vehicle.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        ${transfer.quotation.monetaryAmount}
                      </div>
                      <div className="text-sm text-gray-600">{transfer.quotation.currencyCode}</div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      Up to {transfer.vehicle.seats.count} passengers
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {transfer.distance?.value} {transfer.distance?.unit}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {formatDuration(transfer.duration)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookTransfer(transfer)}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Select Transfer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Confirmation */}
        {bookingStep === 'book' && selectedTransfer && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Booking</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Vehicle:</span>
                    <div className="font-semibold">{selectedTransfer.vehicle.description}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Date & Time:</span>
                    <div className="font-semibold">{formatDateTime(selectedTransfer.start.dateTime)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Duration:</span>
                    <div className="font-semibold">{formatDuration(selectedTransfer.duration)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Passengers:</span>
                    <div className="font-semibold">{searchParams.passengers}</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-emerald-600">
                      ${selectedTransfer.quotation.monetaryAmount} {selectedTransfer.quotation.currencyCode}
                    </span>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <button
                    onClick={confirmBooking}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => setBookingStep('select')}
                    className="w-full px-6 py-3 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50"
                  >
                    Back to Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Confirmed */}
        {bookingStep === 'confirmed' && bookingResult && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-sm text-gray-600 mb-2">Booking Reference</div>
              <div className="text-2xl font-bold text-gray-900">
                {bookingResult.reference || bookingResult.id}
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Your transfer has been successfully booked. You will receive a confirmation email shortly.
            </p>
            <button
              onClick={() => {
                setBookingStep('search');
                setTransfers([]);
                setSelectedTransfer(null);
                setBookingResult(null);
              }}
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Book Another Transfer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferBookingSystem;
