/**
 * Flight Booking Workflow Store
 * Manages 7-step flight booking process:
 * 1. Search → 2. Select Flight → 3. Choose Seats → 4. Select Meals →
 * 5. Add Baggage → 6. Passenger Info → 7. Payment
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Flight booking workflow steps
export enum FlightBookingStep {
  SEARCH = 1,
  SELECT_FLIGHT = 2,
  CHOOSE_SEATS = 3,
  SELECT_MEALS = 4,
  ADD_BAGGAGE = 5,
  PASSENGER_INFO = 6,
  PAYMENT = 7,
}

// Seat selection
export interface SeatSelection {
  segmentId: string;
  passengerId: string;
  seatNumber: string;
  seatType: 'economy' | 'premium' | 'business' | 'first';
  price: number;
  currency: string;
}

// Meal selection
export interface MealSelection {
  segmentId: string;
  passengerId: string;
  mealType: string;
  mealName: string;
  price: number;
  currency: string;
  dietaryRestrictions?: string[];
}

// Baggage selection
export interface BaggageSelection {
  passengerId: string;
  type: 'checked' | 'cabin' | 'sports';
  weight: number;
  quantity: number;
  price: number;
  currency: string;
}

// Passenger information
export interface PassengerInfo {
  id: string;
  type: 'adult' | 'child' | 'infant';
  title: 'Mr' | 'Ms' | 'Mrs' | 'Dr';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
  email?: string;
  phone?: string;
  frequentFlyerNumber?: string;
}

// Contact information
export interface ContactInfo {
  email: string;
  phone: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Flight booking state
interface FlightBookingState {
  // Current step
  currentStep: FlightBookingStep;

  // Selected flight data
  selectedFlight: any | null;
  searchParams: any | null;

  // Step 3: Seat selections
  seats: SeatSelection[];
  availableSeats: any[];

  // Step 4: Meal selections
  meals: MealSelection[];
  availableMeals: any[];

  // Step 5: Baggage selections
  baggage: BaggageSelection[];
  availableBaggage: any[];

  // Step 6: Passenger information
  passengers: PassengerInfo[];
  contactInfo: ContactInfo | null;

  // Total pricing
  basePrice: number;
  seatsTotal: number;
  mealsTotal: number;
  baggageTotal: number;
  currency: string;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentStep: (step: FlightBookingStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: FlightBookingStep) => void;

  // Step 2: Select flight
  setSelectedFlight: (flight: any, searchParams: any) => void;

  // Step 3: Seat selection
  addSeatSelection: (seat: SeatSelection) => void;
  removeSeatSelection: (segmentId: string, passengerId: string) => void;
  setAvailableSeats: (seats: any[]) => void;

  // Step 4: Meal selection
  addMealSelection: (meal: MealSelection) => void;
  removeMealSelection: (segmentId: string, passengerId: string) => void;
  setAvailableMeals: (meals: any[]) => void;

  // Step 5: Baggage selection
  addBaggageSelection: (baggage: BaggageSelection) => void;
  removeBaggageSelection: (passengerId: string, type: string) => void;
  setAvailableBaggage: (baggage: any[]) => void;

  // Step 6: Passenger info
  addPassenger: (passenger: PassengerInfo) => void;
  updatePassenger: (passengerId: string, data: Partial<PassengerInfo>) => void;
  removePassenger: (passengerId: string) => void;
  setContactInfo: (contact: ContactInfo) => void;
  initializePassengers: (count: number, types: Array<'adult' | 'child' | 'infant'>) => void;

  // Pricing calculations
  calculateTotals: () => void;
  getTotalPrice: () => number;

  // Validation
  canProceedToNextStep: () => boolean;

  // Reset
  resetBooking: () => void;
  clearError: () => void;
}

export const useFlightBookingStore = create<FlightBookingState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: FlightBookingStep.SEARCH,
      selectedFlight: null,
      searchParams: null,
      seats: [],
      availableSeats: [],
      meals: [],
      availableMeals: [],
      baggage: [],
      availableBaggage: [],
      passengers: [],
      contactInfo: null,
      basePrice: 0,
      seatsTotal: 0,
      mealsTotal: 0,
      baggageTotal: 0,
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
        if (currentStep < FlightBookingStep.PAYMENT) {
          set({ currentStep: currentStep + 1, error: null });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > FlightBookingStep.SEARCH) {
          set({ currentStep: currentStep - 1, error: null });
        }
      },

      goToStep: (step) => set({ currentStep: step, error: null }),

      // Step 2: Select flight
      setSelectedFlight: (flight, searchParams) => {
        const basePrice = flight.price?.total || flight.price?.grandTotal || 0;
        set({
          selectedFlight: flight,
          searchParams,
          basePrice,
          currency: flight.price?.currency || 'USD',
          currentStep: FlightBookingStep.CHOOSE_SEATS,
        });
      },

      // Step 3: Seat selection
      addSeatSelection: (seat) => {
        const seats = get().seats.filter(
          (s) => !(s.segmentId === seat.segmentId && s.passengerId === seat.passengerId)
        );
        set({ seats: [...seats, seat] });
        get().calculateTotals();
      },

      removeSeatSelection: (segmentId, passengerId) => {
        set({
          seats: get().seats.filter(
            (s) => !(s.segmentId === segmentId && s.passengerId === passengerId)
          ),
        });
        get().calculateTotals();
      },

      setAvailableSeats: (seats) => set({ availableSeats: seats }),

      // Step 4: Meal selection
      addMealSelection: (meal) => {
        const meals = get().meals.filter(
          (m) => !(m.segmentId === meal.segmentId && m.passengerId === meal.passengerId)
        );
        set({ meals: [...meals, meal] });
        get().calculateTotals();
      },

      removeMealSelection: (segmentId, passengerId) => {
        set({
          meals: get().meals.filter(
            (m) => !(m.segmentId === segmentId && m.passengerId === passengerId)
          ),
        });
        get().calculateTotals();
      },

      setAvailableMeals: (meals) => set({ availableMeals: meals }),

      // Step 5: Baggage selection
      addBaggageSelection: (baggage) => {
        const existing = get().baggage.filter(
          (b) => !(b.passengerId === baggage.passengerId && b.type === baggage.type)
        );
        set({ baggage: [...existing, baggage] });
        get().calculateTotals();
      },

      removeBaggageSelection: (passengerId, type) => {
        set({
          baggage: get().baggage.filter(
            (b) => !(b.passengerId === passengerId && b.type === type)
          ),
        });
        get().calculateTotals();
      },

      setAvailableBaggage: (baggage) => set({ availableBaggage: baggage }),

      // Step 6: Passenger info
      addPassenger: (passenger) => {
        set({ passengers: [...get().passengers, passenger] });
      },

      updatePassenger: (passengerId, data) => {
        set({
          passengers: get().passengers.map((p) =>
            p.id === passengerId ? { ...p, ...data } : p
          ),
        });
      },

      removePassenger: (passengerId) => {
        set({ passengers: get().passengers.filter((p) => p.id !== passengerId) });
      },

      setContactInfo: (contact) => set({ contactInfo: contact }),

      initializePassengers: (count, types) => {
        const passengers: PassengerInfo[] = [];
        for (let i = 0; i < count; i++) {
          passengers.push({
            id: `passenger-${i + 1}`,
            type: types[i] || 'adult',
            title: 'Mr',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            nationality: '',
          });
        }
        set({ passengers });
      },

      // Pricing
      calculateTotals: () => {
        const { seats, meals, baggage } = get();
        const seatsTotal = seats.reduce((sum, seat) => sum + seat.price, 0);
        const mealsTotal = meals.reduce((sum, meal) => sum + meal.price, 0);
        const baggageTotal = baggage.reduce((sum, bag) => sum + bag.price * bag.quantity, 0);
        set({ seatsTotal, mealsTotal, baggageTotal });
      },

      getTotalPrice: () => {
        const { basePrice, seatsTotal, mealsTotal, baggageTotal } = get();
        return basePrice + seatsTotal + mealsTotal + baggageTotal;
      },

      // Validation
      canProceedToNextStep: () => {
        const { currentStep, selectedFlight, passengers, contactInfo } = get();

        switch (currentStep) {
          case FlightBookingStep.SEARCH:
            return true; // Can always proceed from search
          case FlightBookingStep.SELECT_FLIGHT:
            return selectedFlight !== null;
          case FlightBookingStep.CHOOSE_SEATS:
            return true; // Seats are optional
          case FlightBookingStep.SELECT_MEALS:
            return true; // Meals are optional
          case FlightBookingStep.ADD_BAGGAGE:
            return true; // Baggage is optional
          case FlightBookingStep.PASSENGER_INFO:
            // All passengers must have complete info
            if (passengers.length === 0) return false;
            const allPassengersValid = passengers.every(
              (p) =>
                p.firstName &&
                p.lastName &&
                p.dateOfBirth &&
                p.nationality
            );
            return allPassengersValid && contactInfo !== null && !!contactInfo.email && !!contactInfo.phone;
          case FlightBookingStep.PAYMENT:
            return true; // Already at payment step
          default:
            return false;
        }
      },

      // Reset
      resetBooking: () =>
        set({
          currentStep: FlightBookingStep.SEARCH,
          selectedFlight: null,
          searchParams: null,
          seats: [],
          availableSeats: [],
          meals: [],
          availableMeals: [],
          baggage: [],
          availableBaggage: [],
          passengers: [],
          contactInfo: null,
          basePrice: 0,
          seatsTotal: 0,
          mealsTotal: 0,
          baggageTotal: 0,
          currency: 'USD',
          isLoading: false,
          error: null,
        }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'flight-booking-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        selectedFlight: state.selectedFlight,
        searchParams: state.searchParams,
        seats: state.seats,
        meals: state.meals,
        baggage: state.baggage,
        passengers: state.passengers,
        contactInfo: state.contactInfo,
        basePrice: state.basePrice,
        seatsTotal: state.seatsTotal,
        mealsTotal: state.mealsTotal,
        baggageTotal: state.baggageTotal,
        currency: state.currency,
      }),
    }
  )
);
