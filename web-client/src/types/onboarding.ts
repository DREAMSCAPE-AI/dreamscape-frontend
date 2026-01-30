// Enums matching backend - STRICTLY ALIGNED WITH PRISMA SCHEMA
export enum TravelType {
  ADVENTURE = 'ADVENTURE',
  CULTURAL = 'CULTURAL',
  RELAXATION = 'RELAXATION',
  BUSINESS = 'BUSINESS',
  FAMILY = 'FAMILY',
  ROMANTIC = 'ROMANTIC',
  WELLNESS = 'WELLNESS',
  EDUCATIONAL = 'EDUCATIONAL',
  CULINARY = 'CULINARY',
  SHOPPING = 'SHOPPING',
  NIGHTLIFE = 'NIGHTLIFE',
  NATURE = 'NATURE',
  URBAN = 'URBAN',
  BEACH = 'BEACH',
  MOUNTAIN = 'MOUNTAIN',
  HISTORICAL = 'HISTORICAL'
}

export enum TravelStyle {
  PLANNED = 'PLANNED',
  SPONTANEOUS = 'SPONTANEOUS',
  MIXED = 'MIXED'
}

export enum ComfortLevel {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  LUXURY = 'LUXURY'
}

export enum AccommodationType {
  HOTEL = 'HOTEL',
  RESORT = 'RESORT',
  BOUTIQUE_HOTEL = 'BOUTIQUE_HOTEL',
  HOSTEL = 'HOSTEL',
  APARTMENT = 'APARTMENT',
  VILLA = 'VILLA',
  BED_AND_BREAKFAST = 'BED_AND_BREAKFAST',
  GUESTHOUSE = 'GUESTHOUSE',
  CAMPING = 'CAMPING',
  LUXURY_TENT = 'LUXURY_TENT',
  CRUISE = 'CRUISE',
  UNIQUE_STAY = 'UNIQUE_STAY'
}

export enum ActivityLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH'
}

export enum TravelGroupType {
  SOLO = 'SOLO',
  COUPLE = 'COUPLE',
  FAMILY_WITH_KIDS = 'FAMILY_WITH_KIDS',
  FAMILY_ADULTS = 'FAMILY_ADULTS',
  FRIENDS_GROUP = 'FRIENDS_GROUP',
  BUSINESS_GROUP = 'BUSINESS_GROUP',
  TOUR_GROUP = 'TOUR_GROUP',
  EXTENDED_FAMILY = 'EXTENDED_FAMILY'
}

export enum SeasonalPreference {
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  FALL = 'FALL',
  WINTER = 'WINTER',
  WET_SEASON = 'WET_SEASON',
  DRY_SEASON = 'DRY_SEASON',
  PEAK_SEASON = 'PEAK_SEASON',
  OFF_SEASON = 'OFF_SEASON'
}

export enum TravelExperienceLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  EXPERIENCED = 'EXPERIENCED',
  EXPERT = 'EXPERT'
}

export enum RiskTolerance {
  CONSERVATIVE = 'CONSERVATIVE',
  MODERATE = 'MODERATE',
  ADVENTUROUS = 'ADVENTUROUS'
}

export enum BudgetFlexibility {
  STRICT = 'STRICT',
  FLEXIBLE = 'FLEXIBLE',
  VERY_FLEXIBLE = 'VERY_FLEXIBLE',
  SOMEWHAT_FLEXIBLE= 'SOMEWHAT_FLEXIBLE'
}

export enum DateFlexibility {
  FLEXIBLE = 'FLEXIBLE',
  SEMI_FLEXIBLE = 'SEMI_FLEXIBLE',
  FIXED = 'FIXED'
}

export enum CabinClass {
  ECONOMY = 'ECONOMY',
  PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST'
}

export enum GroupSizePreference {
  SOLO = 'SOLO',
  SMALL_2_4 = 'SMALL_2_4',
  MEDIUM_5_10 = 'MEDIUM_5_10',
  LARGE_11_20 = 'LARGE_11_20',
  VERY_LARGE_20_PLUS = 'VERY_LARGE_20_PLUS'
}

// Main model interfaces
export interface BudgetRange {
  min: number;
  max: number;
  currency: string;
}

export interface DurationRange {
  min: number;
  max: number;
  unit: 'DAYS' | 'WEEKS' | 'MONTHS';
}

export interface TravelOnboardingProfile {
  // Step 1: Destinations
  preferredDestinations?: Record<string, unknown>;

  // Step 2: Budget
  globalBudgetRange?: BudgetRange;
  budgetFlexibility?: BudgetFlexibility;

  // Step 3: Travel Types
  travelTypes?: TravelType[];

  // Step 4: Style & Comfort
  travelStyle?: TravelStyle;
  comfortLevel?: ComfortLevel;

  // Step 5: Accommodation
  accommodationTypes?: AccommodationType[];
  accommodationBudgetRange?: BudgetRange;

  // Step 6: Transport
  preferredAirlines?: string[];
  cabinClassPreferences?: CabinClass[];

  // Step 7: Activities
  preferredActivities?: string[];
  activityLevel?: ActivityLevel;

  // Step 8: Travel Groups
  travelGroupTypes?: TravelGroupType[];
  groupSizePreference?: GroupSizePreference;

  // Step 9: Constraints
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];

  // Step 10: Timing
  seasonalPreferences?: SeasonalPreference[];
  dateFlexibility?: DateFlexibility;

  // Step 11: Duration
  typicalTripDuration?: DurationRange;
  preferredDuration?: DurationRange;

  // Step 12: Experience
  travelExperienceLevel?: TravelExperienceLevel;
  riskTolerance?: RiskTolerance;

  // Metadata
  completedSteps?: string[];
  isComplete?: boolean;
  lastUpdated?: string;
}

// API Request/Response types
export interface OnboardingStepRequest {
  step: string;
  data: Partial<TravelOnboardingProfile>;
  markCompleted: boolean;
}

export interface OnboardingProgressResponse {
  totalSteps: number;
  completedSteps: string[];
  currentStep?: string;
  progressPercentage: number;
}

export interface OnboardingResponse {
  success: boolean;
  profile?: TravelOnboardingProfile;
  progress?: OnboardingProgressResponse;
  message?: string;
}

// Step configuration
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  required: boolean;
  order: number;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'destinations',
    title: 'Destinations préférées',
    description: 'Où aimez-vous voyager ?',
    icon: '🌍',
    required: true,
    order: 1
  },
  {
    id: 'budget',
    title: 'Budget global',
    description: 'Quel est votre budget de voyage ?',
    icon: '💰',
    required: true,
    order: 2
  },
  {
    id: 'travel_types',
    title: 'Types de voyage',
    description: 'Quels types de voyages vous intéressent ?',
    icon: '🧳',
    required: true,
    order: 3
  },
  {
    id: 'style_comfort',
    title: 'Style de voyage',
    description: 'Quel est votre style de voyage ?',
    icon: '🎭',
    required: false,
    order: 4
  },
  {
    id: 'accommodation',
    title: 'Hébergement',
    description: 'Vos préférences d\'hébergement',
    icon: '🏨',
    required: true,
    order: 5
  },
  {
    id: 'transport',
    title: 'Transport',
    description: 'Vos préférences de transport',
    icon: '✈️',
    required: true,
    order: 6
  },
  {
    id: 'activities',
    title: 'Activités',
    description: 'Quelles activités vous plaisent ?',
    icon: '🎯',
    required: false,
    order: 7
  }
];

// Onboarding Types
export interface OnboardingProfile {
  id: string;
  userId: string;
  currentStep: string;
  completedSteps: string[];
  stepData: Record<string, any>;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string | null;
  lastUpdatedAt: string;
}

export interface OnboardingProgress {
  totalSteps: number;
  completedSteps: string[];
  currentStep: string;
  progressPercentage: number;
  isCompleted: boolean;
}

export interface StepUpdateData {
  step: string;
  data: any;
  markCompleted?: boolean;
}

export interface OnboardingStepData {
  // Step 1: Travel Types
  travel_types?: {
    travelStyle: string[];
  };

  // Step 2: Destinations (Interests)
  destinations?: {
    interests: string[];
  };

  // Step 3: Budget
  budget?: {
    currency: string;
    range: [number, number];
  };

  // Step 4: Transport (Travel Duration)
  transport?: {
    travelDuration: string[];
  };

  // Step 5: Accommodation (Accessibility)
  accommodation?: {
    accessibility: string[];
    sustainability: boolean;
  };
}

export interface CreateOnboardingProfileData {
  currentStep?: string;
  stepData?: OnboardingStepData;
}

// API Response types
export interface OnboardingServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const REQUIRED_STEPS = [
  'destinations',
  'budget',
  'travel_types',
  'accommodation',
  'transport'
] as const;

export type RequiredStep = typeof REQUIRED_STEPS[number];