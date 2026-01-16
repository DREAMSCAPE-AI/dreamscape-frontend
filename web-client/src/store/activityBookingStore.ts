/**
 * Activity Booking Workflow Store
 * Manages 4-step activity booking process:
 * 1. Search → 2. Select Activity → 3. Details → 4. Payment
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Activity booking workflow steps
export enum ActivityBookingStep {
  SEARCH = 1,
  SELECT_ACTIVITY = 2,
  DETAILS = 3,
  PAYMENT = 4,
}

// Participant information
export interface ParticipantInfo {
  id: string;
  type: 'adult' | 'child' | 'infant';
  title: 'Mr' | 'Ms' | 'Mrs' | 'Dr';
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  specialRequirements?: string;
}

// Contact information
export interface ActivityContactInfo {
  email: string;
  phone: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Activity booking state
interface ActivityBookingState {
  // Current step
  currentStep: ActivityBookingStep;

  // Selected activity data
  selectedActivity: any | null;
  searchParams: any | null;

  // Booking details
  numberOfParticipants: number;
  selectedDate: string;
  selectedTime?: string;

  // Step 3: Participant information
  participants: ParticipantInfo[];
  contactInfo: ActivityContactInfo | null;

  // Total pricing
  basePrice: number;
  currency: string;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentStep: (step: ActivityBookingStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: ActivityBookingStep) => void;

  // Step 2: Select activity
  setSelectedActivity: (activity: any, searchParams?: any) => void;

  // Booking details
  setNumberOfParticipants: (count: number) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTime: (time: string) => void;

  // Step 3: Participant info
  addParticipant: (participant: ParticipantInfo) => void;
  updateParticipant: (participantId: string, data: Partial<ParticipantInfo>) => void;
  removeParticipant: (participantId: string) => void;
  setContactInfo: (contact: ActivityContactInfo) => void;
  initializeParticipants: (count: number, types: Array<'adult' | 'child' | 'infant'>) => void;

  // Pricing calculations
  getTotalPrice: () => number;

  // Validation
  canProceedToNextStep: () => boolean;

  // Reset
  resetBooking: () => void;
  clearError: () => void;
}

export const useActivityBookingStore = create<ActivityBookingState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: ActivityBookingStep.SEARCH,
      selectedActivity: null,
      searchParams: null,
      numberOfParticipants: 1,
      selectedDate: '',
      selectedTime: undefined,
      participants: [],
      contactInfo: null,
      basePrice: 0,
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
        if (currentStep < ActivityBookingStep.PAYMENT) {
          set({ currentStep: currentStep + 1, error: null });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > ActivityBookingStep.SEARCH) {
          set({ currentStep: currentStep - 1, error: null });
        }
      },

      goToStep: (step) => set({ currentStep: step, error: null }),

      // Step 2: Select activity
      setSelectedActivity: (activity, searchParams) => {
        const basePrice = activity.price?.amount || 0;
        set({
          selectedActivity: activity,
          searchParams,
          basePrice,
          currency: activity.price?.currency || 'USD',
          currentStep: ActivityBookingStep.DETAILS,
        });
      },

      // Booking details
      setNumberOfParticipants: (count) => {
        set({ numberOfParticipants: count });
      },

      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },

      setSelectedTime: (time) => {
        set({ selectedTime: time });
      },

      // Participant info
      addParticipant: (participant) => {
        set({ participants: [...get().participants, participant] });
      },

      updateParticipant: (participantId, data) => {
        set({
          participants: get().participants.map((p) =>
            p.id === participantId ? { ...p, ...data } : p
          ),
        });
      },

      removeParticipant: (participantId) => {
        set({ participants: get().participants.filter((p) => p.id !== participantId) });
      },

      setContactInfo: (contact) => set({ contactInfo: contact }),

      initializeParticipants: (count, types) => {
        const participants: ParticipantInfo[] = [];
        for (let i = 0; i < count; i++) {
          participants.push({
            id: `participant-${i + 1}`,
            type: types[i] || 'adult',
            title: 'Mr',
            firstName: '',
            lastName: '',
          });
        }
        set({ participants });
      },

      // Pricing
      getTotalPrice: () => {
        const { basePrice, numberOfParticipants } = get();
        return basePrice * numberOfParticipants;
      },

      // Validation
      canProceedToNextStep: () => {
        const { currentStep, selectedActivity, selectedDate, participants, contactInfo } = get();

        switch (currentStep) {
          case ActivityBookingStep.SEARCH:
            return true; // Can always proceed from search
          case ActivityBookingStep.SELECT_ACTIVITY:
            return selectedActivity !== null;
          case ActivityBookingStep.DETAILS:
            // Must have selected a date and have participant info
            if (!selectedDate) return false;
            if (participants.length === 0) return false;
            const allParticipantsValid = participants.every(
              (p) => p.firstName && p.lastName
            );
            return allParticipantsValid && contactInfo !== null && !!contactInfo.email && !!contactInfo.phone;
          case ActivityBookingStep.PAYMENT:
            return true; // Already at payment step
          default:
            return false;
        }
      },

      // Reset
      resetBooking: () =>
        set({
          currentStep: ActivityBookingStep.SEARCH,
          selectedActivity: null,
          searchParams: null,
          numberOfParticipants: 1,
          selectedDate: '',
          selectedTime: undefined,
          participants: [],
          contactInfo: null,
          basePrice: 0,
          currency: 'USD',
          isLoading: false,
          error: null,
        }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'activity-booking-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        selectedActivity: state.selectedActivity,
        searchParams: state.searchParams,
        numberOfParticipants: state.numberOfParticipants,
        selectedDate: state.selectedDate,
        selectedTime: state.selectedTime,
        participants: state.participants,
        contactInfo: state.contactInfo,
        basePrice: state.basePrice,
        currency: state.currency,
      }),
    }
  )
);
