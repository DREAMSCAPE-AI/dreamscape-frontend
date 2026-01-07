/**
 * Hotel Booking Workflow Store
 * Manages 5-step hotel booking process:
 * 1. Search → 2. Select Hotel → 3. Hotel Details → 4. Passenger Info → 5. Payment
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Hotel booking workflow steps
export enum HotelBookingStep {
  SEARCH = 1,
  SELECT_HOTEL = 2,
  HOTEL_DETAILS = 3,
  PASSENGER_INFO = 4,
  PAYMENT = 5,
}

// Room selection
export interface RoomSelection {
  roomId: string;
  roomType: string;
  roomName: string;
  bedType: string;
  quantity: number;
  guests: {
    adults: number;
    children: number;
  };
  price: number;
  currency: string;
  amenities?: string[];
}

// Guest information
export interface GuestInfo {
  id: string;
  type: 'primary' | 'additional';
  title: 'Mr' | 'Ms' | 'Mrs' | 'Dr';
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  specialRequests?: string;
}

// Contact information
export interface HotelContactInfo {
  email: string;
  phone: string;
  arrivalTime?: string;
  specialRequests?: string;
}

// Hotel booking state
interface HotelBookingState {
  // Current step
  currentStep: HotelBookingStep;

  // Selected hotel data
  selectedHotel: any | null;
  searchParams: any | null;

  // Step 3: Room and stay details
  rooms: RoomSelection[];
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;

  // Step 4: Guest information
  guests: GuestInfo[];
  contactInfo: HotelContactInfo | null;

  // Total pricing
  basePrice: number;
  roomsTotal: number;
  taxesAndFees: number;
  currency: string;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentStep: (step: HotelBookingStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: HotelBookingStep) => void;

  // Step 2: Select hotel
  setSelectedHotel: (hotel: any, searchParams: any) => void;

  // Step 3: Hotel details and room selection
  addRoomSelection: (room: RoomSelection) => void;
  updateRoomSelection: (roomId: string, data: Partial<RoomSelection>) => void;
  removeRoomSelection: (roomId: string) => void;
  setCheckInDate: (date: string) => void;
  setCheckOutDate: (date: string) => void;
  calculateNumberOfNights: () => void;

  // Step 4: Guest info
  addGuest: (guest: GuestInfo) => void;
  updateGuest: (guestId: string, data: Partial<GuestInfo>) => void;
  removeGuest: (guestId: string) => void;
  setContactInfo: (contact: HotelContactInfo) => void;
  initializeGuests: (primaryGuest: boolean) => void;

  // Pricing calculations
  calculateTotals: () => void;
  getTotalPrice: () => number;

  // Validation
  canProceedToNextStep: () => boolean;

  // Reset
  resetBooking: () => void;
  clearError: () => void;
}

export const useHotelBookingStore = create<HotelBookingState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: HotelBookingStep.SEARCH,
      selectedHotel: null,
      searchParams: null,
      rooms: [],
      checkInDate: '',
      checkOutDate: '',
      numberOfNights: 0,
      guests: [],
      contactInfo: null,
      basePrice: 0,
      roomsTotal: 0,
      taxesAndFees: 0,
      currency: 'USD',
      isLoading: false,
      error: null,

      // Navigation
      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const { currentStep, canProceedToNextStep } = get();
        if (!canProceedToNextStep()) {
          set({ error: 'Please complete all required fields before proceeding.' });
          return;
        }
        if (currentStep < HotelBookingStep.PAYMENT) {
          set({ currentStep: currentStep + 1, error: null });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > HotelBookingStep.SEARCH) {
          set({ currentStep: currentStep - 1, error: null });
        }
      },

      goToStep: (step) => set({ currentStep: step, error: null }),

      // Step 2: Select hotel
      setSelectedHotel: (hotel, searchParams) => {
        const basePrice = hotel.price?.total || hotel.offers?.[0]?.price?.total || 0;
        const checkIn = searchParams?.checkInDate || '';
        const checkOut = searchParams?.checkOutDate || '';

        set({
          selectedHotel: hotel,
          searchParams,
          basePrice,
          currency: hotel.price?.currency || hotel.offers?.[0]?.price?.currency || 'USD',
          checkInDate: checkIn,
          checkOutDate: checkOut,
          currentStep: HotelBookingStep.HOTEL_DETAILS,
        });

        // Calculate nights
        get().calculateNumberOfNights();
      },

      // Step 3: Room selection
      addRoomSelection: (room) => {
        set({ rooms: [...get().rooms, room] });
        get().calculateTotals();
      },

      updateRoomSelection: (roomId, data) => {
        set({
          rooms: get().rooms.map((r) => (r.roomId === roomId ? { ...r, ...data } : r)),
        });
        get().calculateTotals();
      },

      removeRoomSelection: (roomId) => {
        set({ rooms: get().rooms.filter((r) => r.roomId !== roomId) });
        get().calculateTotals();
      },

      setCheckInDate: (date) => {
        set({ checkInDate: date });
        get().calculateNumberOfNights();
        get().calculateTotals();
      },

      setCheckOutDate: (date) => {
        set({ checkOutDate: date });
        get().calculateNumberOfNights();
        get().calculateTotals();
      },

      calculateNumberOfNights: () => {
        const { checkInDate, checkOutDate } = get();
        if (checkInDate && checkOutDate) {
          const checkIn = new Date(checkInDate);
          const checkOut = new Date(checkOutDate);
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          set({ numberOfNights: nights > 0 ? nights : 0 });
        } else {
          set({ numberOfNights: 0 });
        }
      },

      // Step 4: Guest info
      addGuest: (guest) => {
        set({ guests: [...get().guests, guest] });
      },

      updateGuest: (guestId, data) => {
        set({
          guests: get().guests.map((g) => (g.id === guestId ? { ...g, ...data } : g)),
        });
      },

      removeGuest: (guestId) => {
        set({ guests: get().guests.filter((g) => g.id !== guestId) });
      },

      setContactInfo: (contact) => set({ contactInfo: contact }),

      initializeGuests: (primaryGuest) => {
        if (primaryGuest) {
          const guest: GuestInfo = {
            id: 'guest-primary',
            type: 'primary',
            title: 'Mr',
            firstName: '',
            lastName: '',
          };
          set({ guests: [guest] });
        }
      },

      // Pricing
      calculateTotals: () => {
        const { rooms, numberOfNights, basePrice } = get();
        const roomsTotal = rooms.reduce((sum, room) => sum + room.price * room.quantity * numberOfNights, 0);
        const taxesAndFees = roomsTotal * 0.15; // 15% taxes and fees estimate
        set({ roomsTotal, taxesAndFees });
      },

      getTotalPrice: () => {
        const { roomsTotal, taxesAndFees } = get();
        return roomsTotal + taxesAndFees;
      },

      // Validation
      canProceedToNextStep: () => {
        const { currentStep, selectedHotel, rooms, checkInDate, checkOutDate, guests, contactInfo } = get();

        switch (currentStep) {
          case HotelBookingStep.SEARCH:
            return true; // Can always proceed from search
          case HotelBookingStep.SELECT_HOTEL:
            return selectedHotel !== null;
          case HotelBookingStep.HOTEL_DETAILS:
            // Must have selected at least one room and valid dates
            return rooms.length > 0 && checkInDate !== '' && checkOutDate !== '';
          case HotelBookingStep.PASSENGER_INFO:
            // Must have at least one guest with complete info
            if (guests.length === 0) return false;
            const allGuestsValid = guests.every((g) => g.firstName && g.lastName);
            return allGuestsValid && contactInfo !== null && !!contactInfo.email && !!contactInfo.phone;
          case HotelBookingStep.PAYMENT:
            return true; // Already at payment step
          default:
            return false;
        }
      },

      // Reset
      resetBooking: () =>
        set({
          currentStep: HotelBookingStep.SEARCH,
          selectedHotel: null,
          searchParams: null,
          rooms: [],
          checkInDate: '',
          checkOutDate: '',
          numberOfNights: 0,
          guests: [],
          contactInfo: null,
          basePrice: 0,
          roomsTotal: 0,
          taxesAndFees: 0,
          currency: 'USD',
          isLoading: false,
          error: null,
        }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'hotel-booking-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        selectedHotel: state.selectedHotel,
        searchParams: state.searchParams,
        rooms: state.rooms,
        checkInDate: state.checkInDate,
        checkOutDate: state.checkOutDate,
        numberOfNights: state.numberOfNights,
        guests: state.guests,
        contactInfo: state.contactInfo,
        basePrice: state.basePrice,
        roomsTotal: state.roomsTotal,
        taxesAndFees: state.taxesAndFees,
        currency: state.currency,
      }),
    }
  )
);
