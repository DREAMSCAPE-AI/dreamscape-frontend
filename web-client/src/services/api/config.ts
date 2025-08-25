// API Base Configuration
export const API_CONFIG = {
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// API Endpoints - Updated to match backend routes
export const ENDPOINTS = {
  auth: {
    token: '/auth/token' // This will be handled by backend
  },
  flights: {
    search: '/flights/search',
    pricing: '/flights/pricing',
    orders: '/flights/orders',
    seatmaps: '/flights/seatmaps',
    prediction: '/flights/prediction',
    inspiration: '/flights/destinations',
    cheapestDates: '/flights/cheapest-dates',
    availability: '/flights/availability',
    priceAnalysis: '/flights/price-analysis',
    delayPrediction: '/flights/delay-prediction',
    onTime: '/flights/on-time'
  },
  hotels: {
    search: '/hotels/search',
    details: '/hotels/details',
    booking: '/hotels/booking',
    ratings: '/hotels/ratings',
    byCity: '/hotels/by-city',
    byGeocode: '/hotels/by-geocode',
    byHotels: '/hotels/by-hotels',
    autocomplete: '/hotels/autocomplete'
  },
  experiences: {
    search: '/activities/search',
    byId: '/activities/details',
    bySquare: '/activities/by-square'
  },
  transfers: {
    search: '/transfers/search',
    booking: '/transfers/booking',
    management: '/transfers/management'
  },
  locations: {
    search: '/locations/search',
    byId: '/locations/details',
    airports: '/locations/airports',
    cities: '/locations/cities'
  },
  insights: {
    mostTraveled: '/insights/most-traveled',
    mostBooked: '/insights/most-booked',
    busiestPeriod: '/insights/busiest-period',
    tripPurpose: '/insights/trip-purpose'
  },
  airlines: {
    checkinLinks: '/airlines/checkin-links',
    lookup: '/airlines/lookup',
    routes: '/airlines/routes'
  }
};