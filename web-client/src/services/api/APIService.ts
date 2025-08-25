import axios, { AxiosInstance } from 'axios';
import { API_CONFIG, ENDPOINTS } from './config';
import type {
  FlightSearchParams,
  HotelSearchParams,
  TransferSearchParams,
  ExperienceSearchParams,
  FlightOffer,
  HotelOffer,
  TransferOffer,
  Experience,
  MarketInsight,
  APIError
} from './types';

class APIService {
  private api: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.api = axios.create(API_CONFIG);
    
    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        const apiError: APIError = {
          code: error.response?.data?.errors?.[0]?.code || 'UNKNOWN_ERROR',
          title: error.response?.data?.errors?.[0]?.title || 'Unknown Error',
          detail: error.response?.data?.errors?.[0]?.detail || 'An unknown error occurred',
          status: error.response?.status || 500,
          source: error.response?.data?.errors?.[0]?.source
        };
        return Promise.reject(apiError);
      }
    );

    // Add request interceptor to add auth token
    this.api.interceptors.request.use(
      config => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
  }

  // Authentication
  async authenticate(clientId: string, clientSecret: string): Promise<void> {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const response = await this.api.post(ENDPOINTS.auth.token, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    this.accessToken = response.data.access_token;
  }

  // Flight APIs
  async searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
    const { data } = await this.api.get(ENDPOINTS.flights.search, { params });
    return data.data;
  }

  async getFlightPrice(flightOffers: FlightOffer[]): Promise<FlightOffer[]> {
    const { data } = await this.api.post(ENDPOINTS.flights.pricing, {
      data: {
        type: 'flight-offers-pricing',
        flightOffers
      }
    });
    return data.data.flightOffers;
  }

  async createFlightOrder(flightOffer: FlightOffer, travelers: any): Promise<any> {
    const { data } = await this.api.post(ENDPOINTS.flights.orders, {
      data: {
        type: 'flight-order',
        flightOffers: [flightOffer],
        travelers
      }
    });
    return data;
  }

  // Hotel APIs
  async searchHotels(params: HotelSearchParams): Promise<HotelOffer[]> {
    const { data } = await this.api.get(ENDPOINTS.hotels.search, { params });
    return data.data;
  }

  async getHotelOffer(offerId: string): Promise<HotelOffer> {
    const url = ENDPOINTS.hotels.details.replace('{offerId}', offerId);
    const { data } = await this.api.get(url);
    return data.data;
  }

  async createHotelBooking(hotelOffer: HotelOffer, guests: any): Promise<any> {
    const { data } = await this.api.post(ENDPOINTS.hotels.booking, {
      data: {
        offerId: hotelOffer.id,
        guests,
        payments: [{
          method: 'creditCard',
          card: {
            vendorCode: 'VI',
            cardNumber: '4111111111111111',
            expiryDate: '2023-08'
          }
        }]
      }
    });
    return data;
  }

  // Transfer APIs
  async searchTransfers(params: TransferSearchParams): Promise<TransferOffer[]> {
    const { data } = await this.api.get(ENDPOINTS.transfers.search, { params });
    return data.data;
  }

  async createTransferBooking(transferOffer: TransferOffer, passengers: any): Promise<any> {
    const { data } = await this.api.post(ENDPOINTS.transfers.booking, {
      data: {
        type: 'transfer-booking',
        transferOffer,
        passengers
      }
    });
    return data;
  }

  // Experience APIs
  async searchExperiences(params: ExperienceSearchParams): Promise<Experience[]> {
    const { data } = await this.api.get(ENDPOINTS.experiences.search, { params });
    return data.data;
  }

  async getExperienceById(id: string): Promise<Experience> {
    const url = ENDPOINTS.experiences.byId.replace('{id}', id);
    const { data } = await this.api.get(url);
    return data.data;
  }

  // Market Insights APIs
  async getMostTraveledDestinations(originCityCode: string, period: string): Promise<MarketInsight[]> {
    const { data } = await this.api.get(ENDPOINTS.insights.mostTraveled, {
      params: { originCityCode, period }
    });
    return data.data;
  }

  async getMostBookedDestinations(originCityCode: string, period: string): Promise<MarketInsight[]> {
    const { data } = await this.api.get(ENDPOINTS.insights.mostBooked, {
      params: { originCityCode, period }
    });
    return data.data;
  }

  async getBusiestTravelPeriod(cityCode: string, period: string): Promise<MarketInsight> {
    const { data } = await this.api.get(ENDPOINTS.insights.busiestPeriod, {
      params: { cityCode, period }
    });
    return data.data;
  }

  // Location APIs
  async searchLocations(keyword: string, subType?: string[]): Promise<any[]> {
    const { data } = await this.api.get(ENDPOINTS.locations.search, {
      params: { keyword, subType: subType?.join(',') }
    });
    return data.data;
  }

  async getLocationById(locationId: string): Promise<any> {
    const url = ENDPOINTS.locations.byId.replace('{locationId}', locationId);
    const { data } = await this.api.get(url);
    return data.data;
  }

  async searchAirports(params: { latitude: number; longitude: number; radius?: number }): Promise<any[]> {
    const { data } = await this.api.get(ENDPOINTS.locations.airports, { params });
    return data.data;
  }

  // Airline APIs
  async getAirlineCheckinLinks(airlineCode: string): Promise<any> {
    const { data } = await this.api.get(ENDPOINTS.airlines.checkinLinks, {
      params: { airlineCode }
    });
    return data;
  }

  async getAirlineRoutes(airlineCode: string): Promise<any[]> {
    const { data } = await this.api.get(ENDPOINTS.airlines.routes, {
      params: { airlineCode }
    });
    return data.data;
  }
}

export const apiService = new APIService();
export default apiService;