// Enums matching backend
export enum TravelType {
  LEISURE = 'LEISURE',
  BUSINESS = 'BUSINESS',
  ADVENTURE = 'ADVENTURE',
  CULTURAL = 'CULTURAL',
  ROMANTIC = 'ROMANTIC',
  FAMILY = 'FAMILY',
  SOLO = 'SOLO',
  GROUP = 'GROUP',
  LUXURY = 'LUXURY',
  BUDGET = 'BUDGET',
  ECO_TOURISM = 'ECO_TOURISM',
  WELLNESS = 'WELLNESS',
  EDUCATIONAL = 'EDUCATIONAL',
  RELIGIOUS = 'RELIGIOUS',
  MEDICAL = 'MEDICAL',
  SPORTS = 'SPORTS'
}

export enum TravelStyle {
  LUXURY = 'LUXURY',
  COMFORT = 'COMFORT',
  STANDARD = 'STANDARD',
  BUDGET = 'BUDGET',
  BACKPACKER = 'BACKPACKER',
  BUSINESS = 'BUSINESS',
  FAMILY_FRIENDLY = 'FAMILY_FRIENDLY'
}

export enum ComfortLevel {
  LUXURY = 'LUXURY',
  HIGH_COMFORT = 'HIGH_COMFORT',
  STANDARD = 'STANDARD',
  BASIC = 'BASIC',
  MINIMAL = 'MINIMAL'
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
  ACTIVE = 'ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
  EXTREME = 'EXTREME'
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
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH'
}

export enum BudgetFlexibility {
  STRICT = 'STRICT',
  SOMEWHAT_FLEXIBLE = 'SOMEWHAT_FLEXIBLE',
  FLEXIBLE = 'FLEXIBLE',
  VERY_FLEXIBLE = 'VERY_FLEXIBLE'
}

export enum DateFlexibility {
  FIXED_DATES = 'FIXED_DATES',
  FLEXIBLE_WEEK = 'FLEXIBLE_WEEK',
  FLEXIBLE_MONTH = 'FLEXIBLE_MONTH',
  FLEXIBLE_SEASON = 'FLEXIBLE_SEASON',
  VERY_FLEXIBLE = 'VERY_FLEXIBLE'
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
  isCompleted: boolean;
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
    id: 'travel-types',
    title: 'Types de voyage',
    description: 'Quels types de voyages vous intéressent ?',
    icon: '✈️',
    required: true,
    order: 3
  },
  {
    id: 'style-comfort',
    title: 'Style de voyage',
    description: 'Quel est votre style de voyage ?',
    icon: '🎭',
    required: true,
    order: 4
  },
  {
    id: 'accommodation',
    title: 'Hébergement',
    description: 'Vos préférences d\'hébergement',
    icon: '🏨',
    required: false,
    order: 5
  },
  {
    id: 'transport',
    title: 'Transport',
    description: 'Vos préférences de transport',
    icon: '🚁',
    required: false,
    order: 6
  },
  {
    id: 'activities',
    title: 'Activités',
    description: 'Quelles activités vous plaisent ?',
    icon: '🎯',
    required: false,
    order: 7
  },
  {
    id: 'travel-groups',
    title: 'Groupes de voyage',
    description: 'Avec qui voyagez-vous généralement ?',
    icon: '👥',
    required: false,
    order: 8
  },
  {
    id: 'constraints',
    title: 'Contraintes',
    description: 'Restrictions alimentaires et besoins spéciaux',
    icon: '⚠️',
    required: false,
    order: 9
  },
  {
    id: 'timing',
    title: 'Timing',
    description: 'Quand préférez-vous voyager ?',
    icon: '📅',
    required: false,
    order: 10
  },
  {
    id: 'duration',
    title: 'Durée',
    description: 'Durée habituelle de vos voyages',
    icon: '⏰',
    required: false,
    order: 11
  },
  {
    id: 'experience',
    title: 'Expérience',
    description: 'Votre niveau d\'expérience de voyage',
    icon: '🎓',
    required: false,
    order: 12
  },
  {
    id: 'review',
    title: 'Finalisation',
    description: 'Révision et confirmation',
    icon: '✅',
    required: true,
    order: 13
  }
];