export type UserType = 'business' | 'leisure' | 'bleisure';

export interface UserProfile {
  type: UserType;
  preferences: {
    business?: {
      expensePolicy: boolean;
      meetingSync: boolean;
      corporateRates: boolean;
    };
    leisure?: {
      interests: string[];
      travelStyle: string[];
      budget: {
        min: number;
        max: number;
        currency: string;
      };
    };
    bleisure?: {
      workDays: string[];
      leisureDays: string[];
      expenseSplit: boolean;
    };
  };
}

export interface ProfileState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => void;
  clearProfile: () => void;
}