import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Type definitions
export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: string;
  nonStop?: boolean;
  maxPrice?: number;
  max?: number;
}

export interface FlightDestinationParams {
  origin: string;
  maxPrice?: number;
  departureDate?: string;
}

export interface HotelSearchParams {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  roomQuantity: number;
  adults: number;
  childAges?: number[];
  priceRange?: string;
  currency?: string;
  ratings?: string[];
  amenities?: string[];
  hotelIds?: string[];
}

export interface ActivitySearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
  north?: number;
  west?: number;
  south?: number;
  east?: number;
}

export interface LocationSearchParams {
  keyword: string;
  subType?: string;
  countryCode?: string;
}

export interface AirportSearchParams {
  keyword: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Flight Services
  async searchFlights(params: FlightSearchParams): Promise<any> {
    const response = await this.api.get('/flights/search', { params });
    return response.data;
  }

  async searchFlightDestinations(params: FlightDestinationParams): Promise<any> {
    const response = await this.api.get('/flights/destinations', { params });
    return response.data;
  }

  // New Flight APIs
  async getFlightPriceAnalysis(params: {
    originIataCode: string;
    destinationIataCode: string;
    departureDate: string;
    currencyCode?: string;
  }): Promise<any> {
    const response = await this.api.get('/flights/price-analysis', { params });
    return response.data;
  }

  async getFlightChoicePrediction(flightOffers: any[]): Promise<any> {
    const response = await this.api.post('/flights/choice-prediction', flightOffers);
    return response.data;
  }

  async searchFlightInspiration(params: {
    origin: string;
    maxPrice?: number;
    departureDate?: string;
    oneWay?: boolean;
    duration?: string;
    nonStop?: boolean;
    viewBy?: string;
  }): Promise<any> {
    const response = await this.api.get('/flights/inspiration', { params });
    return response.data;
  }

  async searchCheapestFlightDates(params: {
    origin: string;
    destination: string;
    departureDate?: string;
    oneWay?: boolean;
    nonStop?: boolean;
    duration?: string;
    viewBy?: string;
  }): Promise<any> {
    const response = await this.api.get('/flights/cheapest-dates', { params });
    return response.data;
  }

  async getFlightStatus(params: {
    carrierCode: string;
    flightNumber: string;
    scheduledDepartureDate: string;
  }): Promise<any> {
    const response = await this.api.get('/flights/status', { params });
    return response.data;
  }

  async predictFlightDelay(params: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    departureTime: string;
    arrivalDate: string;
    arrivalTime: string;
    aircraftCode: string;
    carrierCode: string;
    flightNumber: string;
    duration: string;
  }): Promise<any> {
    const response = await this.api.get('/flights/delay-prediction', { params });
    return response.data;
  }

  async getMostTraveledDestinations(params: {
    originCityCode: string;
    period: string;
    max?: number;
  }): Promise<any> {
    const response = await this.api.get('/flights/analytics/most-traveled', { params });
    return response.data;
  }

  async getMostBookedDestinations(params: {
    originCityCode: string;
    period: string;
    max?: number;
  }): Promise<any> {
    const response = await this.api.get('/flights/analytics/most-booked', { params });
    return response.data;
  }

  async getBusiestTravelingPeriod(params: {
    cityCode: string;
    period: string;
    direction?: string;
  }): Promise<any> {
    const response = await this.api.get('/flights/analytics/busiest-period', { params });
    return response.data;
  }

  async getFlightCheckinLinks(params: {
    airlineCode: string;
    language?: string;
  }): Promise<any> {
    const response = await this.api.get('/flights/checkin-links', { params });
    return response.data;
  }

  async getSeatMap(params: {
    flightOfferId: string;
  }): Promise<any> {
    const response = await this.api.get('/flights/seatmap', { params });
    return response.data;
  }

  async getFlightOffersPrice(flightOffers: any): Promise<any> {
    const response = await this.api.post('/flights/offers/pricing', flightOffers);
    return response.data;
  }

  async getBrandedFares(params: {
    flightOfferId: string;
  }): Promise<any> {
    const response = await this.api.get('/flights/branded-fares', { params });
    return response.data;
  }

  async searchFlightAvailabilities(params: {
    originDestinations: any[];
    travelers: any[];
    sources: string[];
  }): Promise<any> {
    const response = await this.api.post('/flights/availabilities', params);
    return response.data;
  }

  async createFlightOrder(orderData: any): Promise<any> {
    const response = await this.api.post('/flights/orders', orderData);
    return response.data;
  }

  async getFlightOrder(orderId: string): Promise<any> {
    const response = await this.api.get(`/flights/orders/${orderId}`);
    return response.data;
  }

  // Hotel Services
  async searchHotels(params: HotelSearchParams): Promise<any> {
    const response = await this.api.get('/hotels/search', { params });
    return response.data;
  }

  async getHotelDetails(offerId: string): Promise<any> {
    const response = await this.api.get(`/hotels/details/${offerId}`);
    return response.data;
  }

  async getHotelImages(hotelId: string, params?: {
    adults?: number;
    roomQuantity?: number;
    checkInDate?: string;
    checkOutDate?: string;
  }): Promise<any> {
    const response = await this.api.get(`/hotels/${hotelId}/images`, { params });
    return response.data;
  }

  // New Hotel APIs
  async getHotelRatings(params: {
    hotelIds: string;
  }): Promise<any> {
    const response = await this.api.get('/hotels/ratings', { params });
    return response.data;
  }

  async autocompleteHotelName(params: {
    keyword: string;
    subType?: string;
    countryCode?: string;
    max?: number;
  }): Promise<any> {
    const response = await this.api.get('/hotels/autocomplete', { params });
    return response.data;
  }

  async createHotelBooking(bookingData: any): Promise<any> {
    const response = await this.api.post('/hotels/bookings', bookingData);
    return response.data;
  }

  async getHotelList(params: {
    cityCode?: string;
    latitude?: number;
    longitude?: number;
    hotelIds?: string;
    radius?: number;
    radiusUnit?: string;
    chainCodes?: string;
    amenities?: string;
    ratings?: string;
    hotelSource?: string;
  }): Promise<any> {
    const response = await this.api.get('/hotels/list', { params });
    return response.data;
  }

  // Activity Services
  async searchActivities(params: ActivitySearchParams): Promise<any> {
    const response = await this.api.get('/activities/search', { params });
    return response.data;
  }

  async getActivityDetails(activityId: string): Promise<any> {
    const response = await this.api.get(`/activities/details/${activityId}`);
    return response.data;
  }

  async getActivityById(activityId: string): Promise<any> {
    const response = await this.api.get(`/activities/${activityId}`);
    return response.data;
  }

  // Location Services
  async searchLocations(params: LocationSearchParams): Promise<any> {
    const response = await this.api.get('/locations/search', { params });
    return response.data;
  }

  async searchAirports(params: AirportSearchParams): Promise<any> {
    const response = await this.api.get('/locations/airports', { params });
    return response.data;
  }

  // Transfer Services
  async searchTransfers(params: {
    startLocationCode?: string;
    endLocationCode?: string;
    startDateTime: string;
    startAddressLine?: string;
    startCountryCode?: string;
    startCityName?: string;
    endAddressLine?: string;
    endCountryCode?: string;
    endCityName?: string;
    transferType?: string;
    passengers: number;
  }): Promise<any> {
    const response = await this.api.get('/transfers/search', { params });
    return response.data;
  }

  async createTransferBooking(bookingData: any): Promise<any> {
    const response = await this.api.post('/transfers/bookings', bookingData);
    return response.data;
  }

  async getTransferOrder(orderId: string): Promise<any> {
    const response = await this.api.get(`/transfers/orders/${orderId}`);
    return response.data;
  }

  // Airline Services
  async lookupAirlineCode(params: {
    airlineCodes?: string;
    IATACode?: string;
    ICAOCode?: string;
  }): Promise<any> {
    const response = await this.api.get('/airlines/lookup', { params });
    return response.data;
  }

  async getAirlineRoutes(params: {
    airlineCode: string;
    max?: number;
  }): Promise<any> {
    const response = await this.api.get('/airlines/routes', { params });
    return response.data;
  }

  // Airport Services
  async getAirportOnTimePerformance(params: {
    airportCode: string;
    date: string;
  }): Promise<any> {
    const response = await this.api.get('/airports/on-time-performance', { params });
    return response.data;
  }

  async getNearestRelevantAirports(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    limit?: number;
    offset?: number;
    sort?: string;
  }): Promise<any> {
    const response = await this.api.get('/airports/nearest', { params });
    return response.data;
  }

  async getAirportRoutes(params: {
    departureAirportCode: string;
    max?: number;
  }): Promise<any> {
    const response = await this.api.get('/airports/routes', { params });
    return response.data;
  }

  // Prediction Services
  async predictTripPurpose(params: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate?: string;
    searchDate: string;
  }): Promise<any> {
    const response = await this.api.get('/predictions/trip-purpose', { params });
    return response.data;
  }

  // Recommendation Services
  async getTravelRecommendations(params: {
    cityCodes: string;
    travelerCountryCode?: string;
    destinationCountryCode?: string;
  }): Promise<any> {
    const response = await this.api.get('/recommendations', { params });
    return response.data;
  }

  // Auth Services
  async register(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }): Promise<any> {
    const response = await this.api.post('/v1/auth/register', userData);
    return response.data;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<any> {
    const response = await this.api.post('/v1/auth/login', credentials);
    return response.data;
  }

  async getUserProfile(token: string): Promise<any> {
    const response = await this.api.get('/v1/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async updateProfile(token: string, profileData: any): Promise<any> {
    const response = await this.api.put('/v1/auth/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async verifyToken(token: string): Promise<any> {
    const response = await this.api.post('/v1/auth/verify-token', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}

export default new ApiService();
